import { synthesizeDesignBrief } from "../engine/synthesize.mjs";

const BRIEFS = [
  "BLACKPINK × TWICE 跨厂牌 comeback landing 页 · 高端奢华 + 元气甜美双 hero",
  "IVE 风格 公主感 SaaS B 端 dashboard 设计",
  "NewJeans + LE SSERAFIM 锐感 × 自然 内容平台 landing",
];

for (const b of BRIEFS) {
  console.log("\n========================================");
  console.log("BRIEF:", b);
  console.log("========================================");
  const dna = synthesizeDesignBrief(b);
  console.log("Lineup:", JSON.stringify(dna.lineup));
  console.log("\nPalette anchors:", JSON.stringify(dna.palette.anchors, null, 2));
  console.log("All hex:", dna.palette.all_hex.join(", "));
  console.log("\nMood intersection:", dna.mood.intersection);
  console.log("Mood union:", dna.mood.union);
  console.log("\nMotion:", JSON.stringify(dna.motion));
  console.log("\nTypography:", JSON.stringify(dna.typography));
  console.log("\nCopy tones:");
  dna.copy_tone.forEach(t => console.log("  -", t));
  console.log("\nConstraints:");
  dna.constraints.forEach(c => console.log(`  - ${c.judge}: ${c.style} | manifesto: ${c.manifesto.slice(0, 60)}`));
  console.log("\nAudience:");
  dna.audience.forEach(a => console.log(`  - ${a.fandom}: ${a.catchphrase}`));
  console.log("\nSignals: rivalry=", dna.signals.rivalry?.has_rivalry, " cross_label=", dna.signals.cross_label?.is_cross_label, " fusion=", dna.signals.fusion?.is_fusion);
}
