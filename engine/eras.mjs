// engine/eras.mjs
// v3.0 Phase 1 · Era Universe 引擎
// 读取 groups/*.md 的 eras: 字段, 实现 era 命中 + DNA 提取

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GROUPS = join(ROOT, "groups");

// ============ Era YAML 解析 (handle nested `eras:` block) ============

/**
 * 从 group .md 内容里抽 eras 数组
 * 支持的字段: era_slug, era_name, year, album, palette{primary,secondary,accent},
 *           mood[], typography_keywords[], mv_grammar, photocard_style,
 *           generation, motion_hint{bpm,easing,duration}, forbidden[], note
 */
export function parseEras(raw) {
  const fmMatch = raw.match(/^---\s*\n([\s\S]+?)\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];
  
  // 走行解析: 找到 "eras:" 行后, 收集所有缩进 ≥2 空格的后续行作为 block
  const fmLines = fm.split("\n");
  let erasIdx = -1;
  for (let i = 0; i < fmLines.length; i++) {
    if (/^eras:\s*$/.test(fmLines[i])) { erasIdx = i; break; }
  }
  if (erasIdx === -1) return [];
  
  const blockLines = [];
  for (let i = erasIdx + 1; i < fmLines.length; i++) {
    const line = fmLines[i];
    if (line === "" || /^\s/.test(line)) {
      blockLines.push(line);
    } else {
      break; // 遇到下一个 top-level field, 停
    }
  }
  
  // 拆 era 项 (每项以 "  - era_slug:" 起头)
  const eraStarts = [];
  for (let i = 0; i < blockLines.length; i++) {
    if (/^\s*- era_slug:/.test(blockLines[i])) eraStarts.push(i);
  }
  
  const eras = [];
  for (let i = 0; i < eraStarts.length; i++) {
    const start = eraStarts[i];
    const end = eraStarts[i + 1] || blockLines.length;
    const chunk = blockLines.slice(start, end).join("\n");
    eras.push(parseOneEra(chunk));
  }
  return eras;
}

function parseOneEra(chunk) {
  const era = {};
  const get = (key) => {
    const m = chunk.match(new RegExp(`${key}:\\s*"?([^"\\n]+?)"?(?:\\s*$|\\n)`, "m"));
    return m ? m[1].trim() : "";
  };
  const getNum = (key) => {
    const m = chunk.match(new RegExp(`${key}:\\s*(\\d+)`, "m"));
    return m ? Number(m[1]) : null;
  };
  const getArr = (key) => {
    const m = chunk.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`, "m"));
    if (!m) return [];
    return m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  };
  
  era.era_slug = get("era_slug");
  era.era_name = get("era_name");
  era.year = getNum("year");
  era.album = get("album");
  era.mv_grammar = get("mv_grammar");
  era.photocard_style = get("photocard_style");
  era.generation = get("generation");
  era.mood = getArr("mood");
  era.typography_keywords = getArr("typography_keywords");
  era.forbidden = getArr("forbidden");
  
  // palette: { primary: "...", secondary: "...", accent: "..." }
  const pm = chunk.match(/palette:\s*\{\s*primary:\s*"([^"]+)",\s*secondary:\s*"([^"]+)",\s*accent:\s*"([^"]+)"\s*\}/);
  if (pm) era.palette = { primary: pm[1], secondary: pm[2], accent: pm[3] };
  
  // motion_hint: { bpm: N, easing: "...", duration: "..." }
  const mm = chunk.match(/motion_hint:\s*\{\s*bpm:\s*(\d+),\s*easing:\s*"([^"]+)",\s*duration:\s*"([^"]+)"\s*\}/);
  if (mm) era.motion_hint = { bpm: Number(mm[1]), easing: mm[2], duration: mm[3] };
  
  return era;
}

// ============ Group + Era 索引 ============

let _eraCache = null;

/**
 * 一次性加载所有 group 的 eras → 返回 { group_slug → [eras] }
 */
export function loadAllEras() {
  if (_eraCache) return _eraCache;
  const map = {};
  const files = readdirSync(GROUPS).filter(f => f.endsWith(".md"));
  for (const file of files) {
    const raw = readFileSync(join(GROUPS, file), "utf-8");
    const slugMatch = raw.match(/^group_slug:\s*"?([^"\n]+)"?/m);
    if (!slugMatch) continue;
    const slug = slugMatch[1].trim();
    const eras = parseEras(raw);
    if (eras.length) map[slug] = eras;
  }
  _eraCache = map;
  return map;
}

/**
 * 查某团的所有 era
 */
export function listGroupEras(group_slug) {
  const map = loadAllEras();
  return map[group_slug] || [];
}

/**
 * 拿到某 group_slug + era_slug 的完整 era DNA
 */
export function getEraDNA(group_slug, era_slug) {
  const eras = listGroupEras(group_slug);
  return eras.find(e => e.era_slug === era_slug) || null;
}

/**
 * 从 brief 文本里检测 era 命中
 * 规则:
 *   1. 显式命中: "fancy era" / "Fancy Era" / "Cheer Up era" / "Born Pink era"
 *   2. 专辑名命中: 出现 era.album 字符串
 *   3. era_slug 命中: 出现 era_slug (snake_case 或 space)
 * 返回数组: [{group_slug, era_slug, era, reason}]
 */
export function detectEra(brief) {
  const map = loadAllEras();
  const lower = brief.toLowerCase();
  const hits = [];
  
  for (const [group_slug, eras] of Object.entries(map)) {
    for (const era of eras) {
      const eraNameL = (era.era_name || "").toLowerCase();
      const albumL = (era.album || "").toLowerCase();
      const slugL = (era.era_slug || "").toLowerCase();
      const slugSpace = slugL.replace(/_/g, " ");
      
      let reason = null;
      // 显式 "<era> era"
      if (eraNameL && lower.includes(eraNameL)) reason = `era_name match "${era.era_name}"`;
      else if (lower.includes(`${slugSpace} era`)) reason = `slug+era keyword "${slugSpace} era"`;
      else if (albumL && albumL !== "(default — 待补充)" && lower.includes(albumL) && albumL.length > 3) {
        reason = `album match "${era.album}"`;
      }
      
      if (reason) hits.push({ group_slug, era_slug: era.era_slug, era, reason });
    }
  }
  return hits;
}

// ============ Era-locked DNA 输出 ============

/**
 * 给定 brief, 输出 era-locked design DNA
 * 若命中 era → 用 era 数据覆盖 group 默认
 * 若未命中 → 返回 null (caller 应回退到 default palette)
 */
export function getEraLockedDNA(brief) {
  const hits = detectEra(brief);
  if (!hits.length) return null;
  
  // 多命中时, 优先 era_name 命中 > album 命中 > slug 命中
  hits.sort((a, b) => {
    const order = { "era_name": 0, "slug+era": 1, "album": 2 };
    const keyA = a.reason.startsWith("era_name") ? "era_name" : a.reason.startsWith("slug") ? "slug+era" : "album";
    const keyB = b.reason.startsWith("era_name") ? "era_name" : b.reason.startsWith("slug") ? "slug+era" : "album";
    return order[keyA] - order[keyB];
  });
  
  return {
    hits,
    primary: hits[0],
    summary: hits.map(h => `${h.group_slug}/${h.era_slug} (${h.reason})`).join(" · "),
  };
}

/**
 * Forbidden 检测: 若 brief 提到的关键词在命中 era 的 forbidden 列表里 → 警告
 */
export function checkEraForbidden(brief, era) {
  if (!era || !era.forbidden) return { has_violation: false, violations: [] };
  const lower = brief.toLowerCase();
  const violations = era.forbidden.filter(f => lower.includes(f.toLowerCase()));
  return { has_violation: violations.length > 0, violations };
}
