// engine/coherence.mjs
// v3.0 Phase 3 · Multi-touchpoint Coherence
// 5 媒介 (MV/SNS/Photocard/Lightstick/Stage) 一致性 audit

import { getEraDNA } from "./eras.mjs";

// ============ 5 媒介定义 + 物理补偿系数 ============
// 每媒介允许的偏差 (相对 era base palette, HSL 空间)
// brightness: 亮度偏移 (-1.0 ~ +1.0, 表示 L 值偏移百分比)
// saturation: 饱和度偏移
// hue_tolerance: 色相允许偏差 (degrees)

export const TOUCHPOINTS = {
  mv: {
    label: "MV (Music Video)",
    typical_brightness_offset: -0.05, // 影视调色普遍略暗
    typical_saturation_offset: +0.05,
    hue_tolerance: 8,
    note: "影视调色,色温允许偏离 era base ±8°",
  },
  sns_post: {
    label: "SNS Post",
    typical_brightness_offset: 0,
    typical_saturation_offset: 0,
    hue_tolerance: 3,
    note: "数字屏最接近 era base, 偏差应最小",
  },
  photocard: {
    label: "Photocard (实体卡片印刷)",
    typical_brightness_offset: -0.08, // 印刷物理损失
    typical_saturation_offset: -0.12,
    hue_tolerance: 5,
    note: "CMYK 印刷会损失饱和度, 需要源文件预补偿",
  },
  lightstick: {
    label: "Lightstick (灯棒/应援色)",
    typical_brightness_offset: +0.20, // 物理 LED 发光
    typical_saturation_offset: -0.05,
    hue_tolerance: 12,
    note: "LED 发光偏白, 色相允许较大漂移",
  },
  stage: {
    label: "Stage (打歌/演唱会舞台)",
    typical_brightness_offset: +0.15,
    typical_saturation_offset: +0.20, // 舞台灯允许过饱和
    hue_tolerance: 10,
    note: "实时舞台灯光允许浓度 +20%",
  },
};

// ============ HEX → HSL 工具 ============

function hexToHsl(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hueDiff(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

// ============ 单色 deviation 计算 ============

function colorDeviation(observed_hex, base_hex, medium) {
  const o = hexToHsl(observed_hex);
  const b = hexToHsl(base_hex);
  const tp = TOUCHPOINTS[medium];
  
  // 期望: observed ≈ base + typical offsets (within tolerance)
  const expected_l = b.l + tp.typical_brightness_offset;
  const expected_s = b.s + tp.typical_saturation_offset;
  
  const l_dev = Math.abs(o.l - expected_l);
  const s_dev = Math.abs(o.s - expected_s);
  const h_dev = hueDiff(o.h, b.h);
  
  // 单色 score (0-100)
  const l_score = Math.max(0, 100 - l_dev * 200);
  const s_score = Math.max(0, 100 - s_dev * 200);
  const h_score = Math.max(0, 100 - (h_dev / tp.hue_tolerance) * 100);
  
  return {
    l_dev, s_dev, h_dev,
    l_score: Math.round(l_score),
    s_score: Math.round(s_score),
    h_score: Math.round(h_score),
    color_score: Math.round((l_score + s_score + h_score) / 3),
  };
}

// ============ 主 API ============

/**
 * 一致性 audit
 * @param {string} group_slug
 * @param {string} era_slug
 * @param {Array<{medium: string, palette: {primary, secondary, accent}}>} observations
 *   observations: 用户提供的 5 个媒介观察值 (实际设计稿提取到的 HEX)
 */
export function auditTouchpointCoherence(group_slug, era_slug, observations) {
  const era = getEraDNA(group_slug, era_slug);
  if (!era) return { error: `era ${group_slug}/${era_slug} not found` };
  
  const results = [];
  for (const obs of observations) {
    if (!TOUCHPOINTS[obs.medium]) {
      results.push({ medium: obs.medium, error: "unknown medium" });
      continue;
    }
    const primary_dev = colorDeviation(obs.palette.primary, era.palette.primary, obs.medium);
    const secondary_dev = colorDeviation(obs.palette.secondary, era.palette.secondary, obs.medium);
    const accent_dev = colorDeviation(obs.palette.accent, era.palette.accent, obs.medium);
    const medium_score = Math.round((primary_dev.color_score + secondary_dev.color_score + accent_dev.color_score) / 3);
    
    const suggestions = [];
    if (primary_dev.l_score < 60) suggestions.push(`primary 亮度偏离过大 (${primary_dev.l_dev.toFixed(2)}), 建议向 era base ${era.palette.primary} 校正`);
    if (primary_dev.s_score < 60) suggestions.push(`primary 饱和度偏离过大 (${primary_dev.s_dev.toFixed(2)})`);
    if (primary_dev.h_score < 60) suggestions.push(`primary 色相偏离过大 (${primary_dev.h_dev.toFixed(1)}°, ${obs.medium} 容忍 ${TOUCHPOINTS[obs.medium].hue_tolerance}°)`);
    if (suggestions.length === 0) suggestions.push(`${TOUCHPOINTS[obs.medium].label} 一致性良好`);
    
    results.push({
      medium: obs.medium,
      label: TOUCHPOINTS[obs.medium].label,
      medium_score,
      primary_dev, secondary_dev, accent_dev,
      suggestions,
    });
  }
  
  const valid = results.filter(r => !r.error);
  const overall_score = valid.length ? Math.round(valid.reduce((s, r) => s + r.medium_score, 0) / valid.length) : 0;
  const verdict = overall_score >= 80 ? "PASS" : overall_score >= 60 ? "WARN" : "FAIL";
  
  return {
    group_slug, era_slug, era_name: era.era_name,
    overall_score, verdict,
    medium_count: valid.length,
    results,
    era_base: era.palette,
  };
}

export function listTouchpoints() {
  return Object.entries(TOUCHPOINTS).map(([k, v]) => ({ medium: k, label: v.label, note: v.note }));
}
