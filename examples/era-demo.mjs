// examples/era-demo.mjs
// v3.0 Phase 1 · Era Universe demo
// 跑 3 个 brief 看 era 命中 + DNA 输出

import { detectEra, getEraDNA, getEraLockedDNA, checkEraForbidden, listGroupEras } from "../engine/eras.mjs";

const BRIEFS = [
  "TWICE Fancy era 风格的电商 landing",
  "BLACKPINK Born Pink 周边设计",
  "aespa Supernova era 视觉",
  "做一个普通的女团 landing (不指定 era)",
  "TWICE Fancy era 用 Y2K 贴纸做 hero",
];

for (const brief of BRIEFS) {
  console.log("\n" + "=".repeat(80));
  console.log(`📋 BRIEF: ${brief}`);
  console.log("=".repeat(80));
  
  const result = getEraLockedDNA(brief);
  if (!result) {
    console.log("🔓 未命中任何 era · 回退到 group 默认 palette");
    continue;
  }
  
  const { group_slug, era_slug, era, reason } = result.primary;
  console.log(`🔒 锁定 era: ${group_slug}/${era_slug} (${reason})`);
  console.log(`   era_name: ${era.era_name} · year: ${era.year} · album: ${era.album}`);
  console.log(`   🎨 palette: primary=${era.palette.primary} secondary=${era.palette.secondary} accent=${era.palette.accent}`);
  console.log(`   💭 mood: ${era.mood.join(" · ")}`);
  console.log(`   🔤 typography: ${era.typography_keywords.join(" · ")}`);
  console.log(`   🎬 mv_grammar: ${era.mv_grammar}`);
  console.log(`   🃏 photocard: ${era.photocard_style}`);
  console.log(`   🏷  generation: ${era.generation}`);
  console.log(`   🎵 motion: bpm=${era.motion_hint.bpm} easing="${era.motion_hint.easing}" duration="${era.motion_hint.duration}"`);
  if (era.forbidden && era.forbidden.length) {
    console.log(`   🚫 forbidden: ${era.forbidden.join(" · ")}`);
  }
  
  const check = checkEraForbidden(brief, era);
  if (check.has_violation) {
    console.log(`   ⚠️  WARNING: brief 触犯 forbidden 词 → ${check.violations.join(", ")}`);
  }
}

console.log("\n" + "=".repeat(80));
console.log("📚 TWICE 所有 era:");
console.log("=".repeat(80));
for (const e of listGroupEras("twice")) {
  console.log(`  ${e.era_slug.padEnd(20)} · ${e.year} · ${e.era_name} · 主色 ${e.palette.primary}`);
}
