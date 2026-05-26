// engine/cycle.mjs
// v3.0 Phase 2 · Comeback Cycle 引擎
// 一次 BRIEF → 30 天 7 节点 brief 日历

import { getEraDNA, listGroupEras } from "./eras.mjs";

// ============ 7 节点定义 ============

export const CYCLE_STAGES = [
  {
    stage_slug: "d-30-logo-teaser",
    day_offset: -30,
    label: "D-30 · Logo Teaser",
    purpose: "comeback 公告 + 新 era logo 揭示",
    primary_specialty: ["typography", "brand"],
    output_kind: "social_card",
    visual_directive: "极简 logo + era name 大字 + 倒计时小字 · 隐藏未来视觉线索",
    motion_directive: "静态 / 微微 ambient (不能透露 MV 节奏)",
    forbidden: ["显露主视觉色", "释出 MV 帧", "展示完整 concept photo"],
  },
  {
    stage_slug: "d-21-concept-photo-1",
    day_offset: -21,
    label: "D-21 · Concept Photo 1 (Mood 1)",
    purpose: "释出 era 主视觉第一弹 · 定调 mood",
    primary_specialty: ["photography", "palette"],
    output_kind: "photo_set",
    visual_directive: "era palette 完整释出 · 全员单人定妆 + 1 张群像 · mood 主调 1",
    motion_directive: "纯静态 · 高分辨率 photoset",
    forbidden: ["透露 MV 镜头", "动态预告"],
  },
  {
    stage_slug: "d-14-concept-photo-2",
    day_offset: -14,
    label: "D-14 · Concept Photo 2 (Mood 2)",
    purpose: "释出 era 主视觉第二弹 · 对比 mood",
    primary_specialty: ["photography", "palette", "brand"],
    output_kind: "photo_set",
    visual_directive: "保留 era palette 但翻转 mood (e.g. mood 1 冷 → mood 2 暖) · 制造对比",
    motion_directive: "纯静态 · 与 D-21 形成 diptych",
    forbidden: ["跑出 era forbidden 词"],
  },
  {
    stage_slug: "d-7-mv-teaser-1",
    day_offset: -7,
    label: "D-7 · MV Teaser 1 (15-30 秒)",
    purpose: "首支动态 teaser · 释出 MV 核心镜头碎片",
    primary_specialty: ["motion", "hero", "photography"],
    output_kind: "video_teaser",
    visual_directive: "MV 关键镜头 5-8 个快剪 · 不放 hook 副歌 · 留悬念",
    motion_directive: "贴近 era motion_hint.bpm 但只用 verse 段",
    forbidden: ["完整 hook 副歌", "完整舞蹈 point"],
  },
  {
    stage_slug: "d-3-mv-teaser-2",
    day_offset: -3,
    label: "D-3 · MV Teaser 2 (高能版)",
    purpose: "升级 teaser · 透露 hook 半句 + 关键 visual",
    primary_specialty: ["motion", "hero", "brand"],
    output_kind: "video_teaser",
    visual_directive: "释出 hook 副歌前 2-3 秒 + 关键 point dance 第 1 拍",
    motion_directive: "完整 BPM + easing 释出",
    forbidden: ["放完整 hook", "放完整舞蹈"],
  },
  {
    stage_slug: "d-day-mv-release",
    day_offset: 0,
    label: "D-DAY · MV 正片 + 数字专辑发售",
    purpose: "完整 MV + landing page + 数字专辑封套全释放",
    primary_specialty: ["motion", "hero", "typography", "brand", "palette"],
    output_kind: "full_release",
    visual_directive: "完整 era 视觉宇宙落地: hero landing + MV + 专辑封套 + 5 媒介齐发",
    motion_directive: "完整 MV / 完整动效系统 / 完整 motion_hint 落地",
    forbidden: ["跑出 era forbidden 词", "和前 5 节点视觉脱节"],
  },
  {
    stage_slug: "d-plus-music-show",
    day_offset: 7,
    label: "D+7~D+28 · 4 周打歌舞台 (Music Bank/Inkigayo/M!Countdown/Show Champion)",
    purpose: "舞台版本视觉 · 跨节目变奏 · fancam 优化",
    primary_specialty: ["motion", "hero", "interaction"],
    output_kind: "stage_variants",
    visual_directive: "舞台版 palette 允许浓度 +20% (灯光补偿) · 每周 1 套小变化 · point dance 强化",
    motion_directive: "BPM 不变 · 实时灯光 sync",
    forbidden: ["改变 era core palette", "替换 era logo"],
  },
];

// ============ 主 API ============

/**
 * 输入 group + era → 输出 7 节点 brief 日历
 */
export function dispatchComebackCycle(group_slug, era_slug, options = {}) {
  const era = getEraDNA(group_slug, era_slug);
  if (!era) {
    return { error: `era ${group_slug}/${era_slug} not found`, available_eras: listGroupEras(group_slug).map(e => e.era_slug) };
  }
  
  const stages = CYCLE_STAGES.map(stage => ({
    ...stage,
    group_slug,
    era_slug,
    era_name: era.era_name,
    palette: stage.output_kind === "full_release" || stage.day_offset >= -21 ? era.palette : null,
    motion_hint: stage.primary_specialty.includes("motion") ? era.motion_hint : null,
    typography_keywords: stage.primary_specialty.includes("typography") ? era.typography_keywords : [],
    mv_grammar: stage.day_offset <= 0 && stage.day_offset >= -7 ? era.mv_grammar : null,
    era_forbidden: era.forbidden || [],
    combined_forbidden: [...(stage.forbidden || []), ...(era.forbidden || [])],
    brief_summary: composeBrief(stage, era),
  }));
  
  return {
    group_slug,
    era_slug,
    era_name: era.era_name,
    cycle_total_days: 60, // -30 → +28
    stage_count: stages.length,
    stages,
  };
}

function composeBrief(stage, era) {
  const lines = [];
  lines.push(`【${stage.label}】 ${era.era_name}`);
  lines.push(`目的: ${stage.purpose}`);
  lines.push(`主权 specialty: ${stage.primary_specialty.join(" · ")}`);
  lines.push(`视觉指令: ${stage.visual_directive}`);
  lines.push(`motion 指令: ${stage.motion_directive}`);
  if (stage.day_offset >= -21) lines.push(`palette: ${era.palette.primary} / ${era.palette.secondary} / ${era.palette.accent}`);
  if (stage.day_offset <= 0 && stage.day_offset >= -7) lines.push(`mv_grammar: ${era.mv_grammar}`);
  if (stage.primary_specialty.includes("motion")) lines.push(`motion bpm ${era.motion_hint.bpm} · easing ${era.motion_hint.easing}`);
  lines.push(`禁忌: ${[...(stage.forbidden || []), ...(era.forbidden || [])].join(" · ")}`);
  return lines.join("\n");
}

/**
 * 单 stage 查询
 */
export function getStageBrief(group_slug, era_slug, stage_slug) {
  const cycle = dispatchComebackCycle(group_slug, era_slug);
  if (cycle.error) return cycle;
  return cycle.stages.find(s => s.stage_slug === stage_slug) || { error: `stage ${stage_slug} not found` };
}

export function listCycleStages() {
  return CYCLE_STAGES.map(s => ({ stage_slug: s.stage_slug, label: s.label, day_offset: s.day_offset, primary_specialty: s.primary_specialty, output_kind: s.output_kind }));
}
