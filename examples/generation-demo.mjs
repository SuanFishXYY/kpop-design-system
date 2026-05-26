// examples/generation-demo.mjs
// v3.0 Phase 4 demo · Generation Aesthetic Lint

import { checkGenerationAesthetic, listGenerationCards } from "../engine/generation.mjs";

console.log("=== Demo 1: 4 代审美卡片速览 ===");
for (const c of listGenerationCards()) {
  console.log(`\n📇 ${c.label}`);
  console.log(`  代表: ${c.representatives.slice(0, 4).join(", ")}`);
  console.log(`  签名: ${c.aesthetic_signature.slice(0, 3).join(" / ")}`);
  console.log(`  禁忌: ${c.forbidden_in_brief.slice(0, 3).join(" / ")}`);
}

const scenarios = [
  { brief: "TWICE 暗黑科技风 hero landing", group: "twice", note: "3 代团用 5 代语法" },
  { brief: "ILLIT Y2K 复古校园风格 photocard", group: "illit", note: "5 代团用 3 代语法" },
  { brief: "IVE 极简公主梦幻 KV", group: "ive", note: "4 代团走 4 代语法 (合规)" },
  { brief: "BABYMONSTER neo-dystopia AI 监控感 MV", group: "bm", note: "5 代团走 5 代 (合规)" },
];

console.log("\n=== Demo 2: 代际错位检测 ===");
for (const s of scenarios) {
  console.log(`\n📝 ${s.brief}`);
  console.log(`   场景: ${s.note}`);
  const r = checkGenerationAesthetic(s.brief, s.group);
  if (r.has_violation) {
    console.log(`   ❌ 违规! generation: ${r.generation} · 命中禁忌: ${r.violations.join(", ")}`);
    console.log(`   💡 ${r.suggestion}`);
  } else {
    console.log(`   ✅ 合规 (generation: ${r.generation || "unknown"})`);
  }
}
