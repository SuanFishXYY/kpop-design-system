import { synthesizeDesignBrief, aggregatePerformerDNA, getPerformersBySpecialty } from "../engine/synthesize.mjs";
import { summonCouncil } from "../engine/dispatch.mjs";

const BRIEF = "BLACKPINK × TWICE 跨厂牌 comeback landing · 双 hero";

const dna = synthesizeDesignBrief(BRIEF);
const perf = dna.performer_dna;

console.log("=== 116 performer activated · v2.4.0 ===\n");
console.log("BRIEF:", BRIEF);
console.log("\nTotal performers:", perf.total);
console.log("Specialty coverage:", perf.specialty_coverage.join(", "));

console.log("\n=== 按设计维度分桶 ===");
for (const [dim, idols] of Object.entries(perf.by_specialty)) {
  console.log(`\n【${dim}】(${idols.length} 担当)`);
  idols.slice(0, 4).forEach(i => {
    console.log(`  ${i.name} (${i.group}) [${i.role}]`);
    console.log(`    ui_specialty: ${i.ui_specialty}`);
    console.log(`    personality: ${i.personality}`);
  });
  if (idols.length > 4) console.log(`  ... +${idols.length - 4} more`);
}

console.log("\n=== 按维度查 (LLM 实战) ===");
const council = summonCouncil(BRIEF);
const typoOwners = getPerformersBySpecialty(council, "typography", 3);
console.log("\n谁 own typography 段?");
typoOwners.forEach(i => console.log(`  - ${i.name} (${i.group}): ${i.ui_specialty}`));

const motionOwners = getPerformersBySpecialty(council, "motion", 3);
console.log("\n谁 own motion 段?");
motionOwners.forEach(i => console.log(`  - ${i.name} (${i.group}): ${i.ui_specialty}`));

const heroOwners = getPerformersBySpecialty(council, "hero", 3);
console.log("\n谁 own hero 段?");
heroOwners.forEach(i => console.log(`  - ${i.name} (${i.group}): ${i.ui_specialty}`));
