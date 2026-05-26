// examples/coherence-demo.mjs
// v3.0 Phase 3 demo · Multi-touchpoint Coherence audit

import { auditTouchpointCoherence, listTouchpoints } from "../engine/coherence.mjs";

console.log("=== Demo 1: listTouchpoints (5 个媒介定义) ===");
for (const t of listTouchpoints()) {
  console.log(`  ${t.medium.padEnd(12)} ${t.label}`);
  console.log(`    ${t.note}`);
}

console.log("\n=== Demo 2: TWICE Fancy 5 媒介一致性 audit (理想情况) ===");
const ideal = auditTouchpointCoherence("twice", "fancy", [
  { medium: "mv",         palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  { medium: "sns_post",   palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  { medium: "photocard",  palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  { medium: "lightstick", palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  { medium: "stage",      palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
]);
console.log(`Verdict: ${ideal.verdict} · Score: ${ideal.overall_score}/100`);
for (const r of ideal.results) {
  console.log(`  ${r.label}: ${r.medium_score}/100 — ${r.suggestions[0]}`);
}

console.log("\n=== Demo 3: BLACKPINK Born Pink — photocard 过亮 (印刷未做预补偿) ===");
const broken = auditTouchpointCoherence("bp", "born_pink", [
  { medium: "mv",        palette: { primary: "#1A1A1A", secondary: "#FF1493", accent: "#FFFFFF" } },
  { medium: "photocard", palette: { primary: "#7A7A7A", secondary: "#FFB6E1", accent: "#FFFFFF" } }, // 过亮过淡
]);
if (broken.error) {
  console.log(`(skipped: ${broken.error})`);
} else {
  console.log(`Verdict: ${broken.verdict} · Score: ${broken.overall_score}/100`);
  for (const r of broken.results) {
    console.log(`  ${r.label}: ${r.medium_score}/100`);
    r.suggestions.forEach(s => console.log(`    → ${s}`));
  }
}
