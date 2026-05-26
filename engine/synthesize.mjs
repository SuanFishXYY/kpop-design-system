// engine/synthesize.mjs
// v2.2.0 · Design Brief Discovery
// 把召唤的 panel + group_anchor + audience 的 frontmatter DNA
// 聚合成可设计的「设计 DNA 包」, 供 LLM 在 loop 里写真实设计 brief。

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { summonCouncil } from "./dispatch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function parseRichFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]+?)\n---/);
  if (!m) return {};
  const body = m[1];
  const fm = { palette: {}, mood_keywords: [], signature_tracks: [] };

  const paletteMatch = body.match(/palette:\s*\n((?:\s+\w+:\s*"[^"]+"\s*\n?)+)/);
  if (paletteMatch) {
    for (const line of paletteMatch[1].split("\n")) {
      const kv = line.match(/\s+(\w+):\s*"([^"]+)"/);
      if (kv) fm.palette[kv[1]] = kv[2];
    }
  }

  const moodMatch = body.match(/mood_keywords:\s*\[([^\]]+)\]/);
  if (moodMatch) {
    fm.mood_keywords = moodMatch[1]
      .split(",")
      .map(s => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  const tracksMatch = body.match(/signature_tracks:\s*\n((?:\s+-\s*\{[^}]+\}\s*\n?)+)/);
  if (tracksMatch) {
    for (const line of tracksMatch[1].split("\n")) {
      const t = line.match(/-\s*\{([^}]+)\}/);
      if (!t) continue;
      const obj = {};
      for (const part of t[1].split(",")) {
        const kv = part.match(/(\w+):\s*"?([^",}]+)"?/);
        if (kv) {
          const v = kv[2].trim();
          obj[kv[1]] = isNaN(Number(v)) || v === "" ? v : Number(v);
        }
      }
      fm.signature_tracks.push(obj);
    }
  }

  for (const key of [
    "core_aesthetic", "soul_manifesto", "fandom_name", "rivalry_narrative",
    "judging_style", "manifesto", "catchphrase", "group_name", "era"
  ]) {
    const re = new RegExp(`^${key}:\\s*"([^"]+)"`, "m");
    const sm = body.match(re);
    if (sm) fm[key] = sm[1];
  }

  return fm;
}

function safeRead(path) {
  try { return readFileSync(path, "utf-8"); } catch { return null; }
}

function loadGroupDNA(group_slug) {
  const raw = safeRead(join(ROOT, "groups", `${group_slug}.md`));
  return raw ? parseRichFrontmatter(raw) : null;
}

function loadJudgeDNA(judge_slug) {
  const raw = safeRead(join(ROOT, "judges", `${judge_slug}.md`));
  return raw ? parseRichFrontmatter(raw) : null;
}

function loadFandomDNA(group_slug) {
  const raw = safeRead(join(ROOT, "fandoms", `${group_slug}.md`));
  return raw ? parseRichFrontmatter(raw) : null;
}

function deriveMotionHint(bpms) {
  if (!bpms.length) return null;
  const avg = bpms.reduce((a, b) => a + b, 0) / bpms.length;
  if (avg < 90)  return { tempo: "slow",      easing: "easeOut",          duration_ms: "500-800", note: "舒缓克制 · 适合 B 端 · 信任感优先" };
  if (avg < 115) return { tempo: "standard",  easing: "easeInOut",        duration_ms: "300-500", note: "中速节奏 · 通用方案 · 平衡感" };
  if (avg < 130) return { tempo: "snappy",    easing: "easeOut + spring", duration_ms: "200-350", note: "明快有力 · 适合年轻 C 端" };
  return                  { tempo: "explosive",easing: "spring + overshoot",duration_ms: "150-300", note: "高能爆炸 · 适合娱乐/活动页" };
}

function deriveTypographyHint(mood) {
  const moods = (mood.union || []).map(m => m.toLowerCase());
  const has = (re) => moods.some(m => re.test(m));
  const flags = {
    luxury:  has(/luxury|opulent|奢华|elegant/),
    sharp:   has(/sharp|bold|aggressive|fierce|brutal|锐/),
    cute:    has(/cute|sweet|candy|甜|可爱|girly|pastel/),
    minimal: has(/minimal|clean|简|geometric/),
    edgy:    has(/edgy|dark|baroque|trap/),
  };
  const stack = [];
  if (flags.luxury)  stack.push("display: Playfair Display / Cormorant (奢华衬线)");
  if (flags.sharp)   stack.push("headline: Inter Black / Helvetica Bold (锐感无衬线)");
  if (flags.cute)    stack.push("accent: Quicksand / Nunito (圆角无衬线 · 甜系)");
  if (flags.minimal) stack.push("body: Inter / SF Pro Display (现代极简)");
  if (flags.edgy)    stack.push("display: Bodoni / Didot (高对比反差)");
  if (!stack.length) stack.push("default: Inter (中性方案 · 数据驱动)");
  return { suggested_stack: stack, flags };
}

function deriveCopyTone(constraints, anchors) {
  const tones = [];
  for (const c of constraints) {
    if (/noise|真诚|truth/i.test(c.style + c.manifesto)) tones.push(`${c.judge}: noise level + 真诚共鸣`);
    if (/swagger|对决/i.test(c.style + c.manifesto))     tones.push(`${c.judge}: swagger / 对决式`);
    if (/healing|治愈/i.test(c.style + c.manifesto))      tones.push(`${c.judge}: healing / 治愈系`);
  }
  for (const a of anchors) {
    if (a.manifesto) tones.push(`${a.from} 团代表宣言: "${a.manifesto}"`);
  }
  return tones;
}

// ============ v2.4.0 · Performer DNA 聚合 ============

const SPECIALTY_KEYWORDS = {
  typography: /typo|font|衬线|字|serif|sans|letter|kerning|leading/i,
  motion:     /motion|animation|动效|easing|spring|节奏|tempo|transition/i,
  palette:    /palette|color|配色|hex|swatch|hue|tone|gradient/i,
  layout:     /layout|grid|ia|architect|架构|栏|布局|composition/i,
  brand:      /brand|品牌|logo|identity|mark|象征|signature/i,
  hero:       /hero|kv|key.?visual|首屏|landing|banner/i,
  interaction:/micro|interaction|hover|交互|tap|gesture|haptic/i,
  illustration:/illust|绘|graphic|icon|插画|sticker/i,
  photography:/photo|拍|镜头|frame|视觉|cinematic|filmic/i,
  copy:       /copy|文案|tone|voice|tagline|claim|wording/i,
};

function classifyIdolSpecialty(idol) {
  const blob = `${idol.ui_specialty || ""} ${idol.personality || ""} ${idol.vibe || ""} ${idol.attitude || ""}`;
  const hits = [];
  for (const [tag, re] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (re.test(blob)) hits.push(tag);
  }
  return hits.length ? hits : ["general"];
}

/**
 * 把 council 召唤的所有 performer (invited) 按 ui_specialty 关键词聚类.
 * 让 116 idols 真正参与设计 brief 产出, 不再只是投票傀儡.
 */
export function aggregatePerformerDNA(council) {
  const invited = (council && council.invited) || [];
  const bySpecialty = {};
  const allTags = new Set();
  const dnaList = invited.map(p => {
    const tags = classifyIdolSpecialty(p);
    tags.forEach(t => allTags.add(t));
    for (const t of tags) {
      bySpecialty[t] = bySpecialty[t] || [];
      bySpecialty[t].push({
        slug: p.slug,
        name: p.name,
        group: p.group,
        role: p.role || "",
        ui_specialty: p.ui_specialty || "",
        personality: p.personality || "",
        vibe: p.vibe || "",
        layer: p.layer,
        weight: p.weight,
      });
    }
    return {
      slug: p.slug,
      name: p.name,
      group: p.group,
      ui_specialty: p.ui_specialty || "",
      personality: p.personality || "",
      tags,
    };
  });

  return {
    total: invited.length,
    specialty_coverage: [...allTags],
    by_specialty: bySpecialty,
    dna_list: dnaList,
  };
}

/**
 * 给一个设计维度关键词 (e.g. "typography"), 返回最匹配的 performers.
 * 用于 LLM 在写 brief 时, "我现在写 typography 段落, 谁来 own?"
 */
export function getPerformersBySpecialty(council, dimension, limit = 5) {
  const agg = aggregatePerformerDNA(council);
  const list = agg.by_specialty[dimension] || [];
  return list.slice(0, limit);
}

export function synthesizeDesignBrief(brief) {
  const council = summonCouncil(brief);

  const anchorDNA = council.souls.map(s => {
    const dna = loadGroupDNA(s.group_slug) || {};
    return {
      from: s.group_slug,
      group: dna.group_name || s.name,
      era: dna.era || s.era,
      core_aesthetic: dna.core_aesthetic || "",
      manifesto: dna.soul_manifesto || s.attitude || "",
      palette: dna.palette || {},
      moods: dna.mood_keywords || [],
      tracks: dna.signature_tracks || [],
      rivalry_narrative: dna.rivalry_narrative || s.rivalry_narrative || "",
    };
  });

  const allMoods = anchorDNA.flatMap(a => a.moods);
  const moodFreq = {};
  allMoods.forEach(m => { moodFreq[m] = (moodFreq[m] || 0) + 1; });
  const mood = {
    intersection: Object.keys(moodFreq).filter(k => moodFreq[k] >= 2),
    union: [...new Set(allMoods)],
    distribution: moodFreq,
  };

  const bpms = anchorDNA.flatMap(a => a.tracks.map(t => t.bpm).filter(b => typeof b === "number"));
  const motion = {
    bpm_min: bpms.length ? Math.min(...bpms) : null,
    bpm_max: bpms.length ? Math.max(...bpms) : null,
    bpm_avg: bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : null,
    hint: deriveMotionHint(bpms),
  };

  const constraints = (council.judges || []).map(j => {
    const dna = loadJudgeDNA(j.judge_slug) || {};
    return {
      judge: j.judge_slug,
      label: j.label,
      style: dna.judging_style || j.judging_style || "",
      manifesto: dna.manifesto || j.manifesto || "",
      can_veto: j.can_veto,
      veto_scope: j.veto_scope,
    };
  });

  const audience = (council.fandoms || []).map(f => {
    const dna = loadFandomDNA(f.group_slug) || {};
    return {
      from: f.group_slug,
      fandom: dna.fandom_name || f.fandom_name,
      catchphrase: dna.catchphrase || f.catchphrase || "",
    };
  });

  const palette = {
    anchors: anchorDNA.map(a => ({
      from: a.from, group: a.group,
      primary: a.palette.primary || null,
      secondary: a.palette.secondary || null,
      accent: a.palette.accent || null,
    })),
    all_hex: [
      ...new Set(
        anchorDNA.flatMap(a => [a.palette.primary, a.palette.secondary, a.palette.accent]).filter(Boolean)
      ),
    ],
  };

  const typography = deriveTypographyHint(mood);
  const copy_tone = deriveCopyTone(constraints, anchorDNA);

  return {
    brief,
    lineup: {
      panel: constraints.map(c => c.judge),
      anchors: anchorDNA.map(a => a.group),
      audience: audience.map(a => a.fandom),
      performers: council.invited.length,
    },
    palette,
    mood,
    motion,
    typography,
    copy_tone,
    constraints,
    audience,
    signals: {
      rivalry: council.rivalry_check,
      cross_label: council.cross_label_check,
      fusion: council.fusion_check,
    },
    anchor_dna: anchorDNA,
    performer_dna: aggregatePerformerDNA(council),
  };
}
