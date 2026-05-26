// engine/generation.mjs
// v3.0 Phase 4 · Generation Aesthetic Lint
// 2/3/4/5 代审美错位禁止

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ============ 4 代审美卡片 ============

export const GENERATION_CARDS = {
  "2代": {
    label: "2 代 (~2007-2012)",
    representatives: ["SNSD", "KARA", "Wonder Girls", "f(x)", "Brown Eyed Girls"],
    aesthetic_signature: ["高饱和糖果色", "粉嫩", "大头特写", "校园制服", "圆润字体", "8 个以上女团群像"],
    typical_keywords: ["糖果色", "粉嫩", "校服", "圆润"],
    forbidden_in_brief: ["暗黑科技", "监控构图", "AI cyber", "极简留白", "去性别", "neo-dystopia"],
    motion_signature: "高对比 snappy 抖动",
  },
  "3代": {
    label: "3 代 (~2013-2018)",
    representatives: ["TWICE", "BLACKPINK", "Red Velvet", "MAMAMOO", "GFRIEND", "EXID"],
    aesthetic_signature: ["杂志大片", "Y2K 复古", "黑白对照", "Velvet 暗黑高级", "巴洛克", "金箔"],
    typical_keywords: ["Y2K", "杂志大片", "高级", "巴洛克", "金箔"],
    forbidden_in_brief: ["AI cyber", "监控感", "neo-dystopia", "暗黑科技", "后人类", "去性别"],
    motion_signature: "slow burn / dramatic build",
  },
  "4代": {
    label: "4 代 (~2019-2022)",
    representatives: ["IVE", "aespa", "NewJeans", "ITZY", "(G)I-DLE", "LE SSERAFIM", "STAYC"],
    aesthetic_signature: ["简洁极简", "公主梦幻", "AI 元宇宙双生", "Y2K 邻家", "薄荷糖清新"],
    typical_keywords: ["极简", "公主", "AI", "元宇宙", "Y2K", "薄荷", "清新"],
    forbidden_in_brief: ["8 个以上的女团群像", "高度繁复巴洛克"],
    motion_signature: "fresh breeze / glitch cut / regal",
  },
  "5代": {
    label: "5 代 (~2023+)",
    representatives: ["BABYMONSTER", "ILLIT", "IZNA", "MEOVV", "XG", "LAPILLUS"],
    aesthetic_signature: ["暗黑科技", "AI 后人类", "监控感", "去性别", "neo-dystopia", "极简未来"],
    typical_keywords: ["暗黑", "neo", "dystopia", "监控", "AI", "后人类", "去性别", "futuristic"],
    forbidden_in_brief: ["Y2K", "校园制服", "8 个以上的女团群像", "巴洛克金箔"],
    motion_signature: "explosion / war drum",
  },
};

// ============ Group → generation 映射 ============

let _genCache = null;

function loadGroupGenerations() {
  if (_genCache) return _genCache;
  const map = {};
  const files = readdirSync(join(ROOT, "groups")).filter(f => f.endsWith(".md"));
  for (const file of files) {
    const raw = readFileSync(join(ROOT, "groups", file), "utf-8");
    const slugMatch = raw.match(/^group_slug:\s*"?([^"\n]+)"?/m);
    const eraMatch = raw.match(/^era:\s*"?([^"\n]+)"?/m);
    if (slugMatch && eraMatch) {
      const era = eraMatch[1].trim();
      // normalize "3 代" / "3代" → "3代"
      const norm = era.replace(/\s+/g, "");
      // 取首个数字 + "代"
      const m = norm.match(/(\d+)代/);
      if (m) map[slugMatch[1].trim()] = `${m[1]}代`;
    }
  }
  _genCache = map;
  return map;
}

export function getGroupGeneration(group_slug) {
  return loadGroupGenerations()[group_slug] || null;
}

// ============ Brief lint ============

/**
 * 检查 brief 是否触犯团 generation 的审美 forbidden
 * @returns {has_violation, generation, violations, suggestion}
 */
export function checkGenerationAesthetic(brief, group_slug) {
  const gen = getGroupGeneration(group_slug);
  if (!gen) return { has_violation: false, reason: "unknown_group_generation" };
  
  const card = GENERATION_CARDS[gen];
  if (!card) return { has_violation: false, reason: "no_generation_card" };
  
  const lower = brief.toLowerCase();
  const violations = card.forbidden_in_brief.filter(f => lower.includes(f.toLowerCase()));
  
  if (violations.length === 0) {
    return { has_violation: false, generation: gen, group_slug, card_label: card.label };
  }
  
  // 推荐: 命中的禁忌词对应哪个 generation?
  let suggested_correct_gen = null;
  for (const [otherGen, otherCard] of Object.entries(GENERATION_CARDS)) {
    if (otherGen === gen) continue;
    const matches = otherCard.typical_keywords.filter(k => violations.some(v => v.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(v.toLowerCase())));
    if (matches.length) { suggested_correct_gen = otherGen; break; }
  }
  
  return {
    has_violation: true,
    generation: gen,
    group_slug,
    card_label: card.label,
    violations,
    suggested_correct_gen,
    suggestion: suggested_correct_gen
      ? `「${violations.join(", ")}」是 ${suggested_correct_gen} 的视觉语法; ${gen} 团 ${group_slug.toUpperCase()} 应走 ${card.aesthetic_signature.slice(0, 3).join(" / ")}`
      : `${gen} 团 ${group_slug.toUpperCase()} 不应使用「${violations.join(", ")}」`,
    correct_aesthetic: card.aesthetic_signature,
  };
}

export function listGenerationCards() {
  return Object.entries(GENERATION_CARDS).map(([k, v]) => ({ generation: k, ...v }));
}
