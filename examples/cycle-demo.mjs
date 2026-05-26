// examples/cycle-demo.mjs
// v3.0 Phase 2 demo · Comeback Cycle 30 天 7 节点 brief 日历

import { dispatchComebackCycle, getStageBrief, listCycleStages } from "../engine/cycle.mjs";

console.log("=== Demo 1: listCycleStages (7 个回归阶段) ===");
for (const s of listCycleStages()) {
  console.log(`  ${s.label}  · primary: ${s.primary_specialty.join("/")}`);
}

console.log("\n=== Demo 2: dispatchComebackCycle(twice, fancy) ===");
const cycle = dispatchComebackCycle("twice", "fancy");
console.log(`group: ${cycle.group_slug} · era: ${cycle.era_name}`);
console.log(`total days: ${cycle.cycle_total_days} · stage count: ${cycle.stage_count}`);

for (const stage of cycle.stages) {
  console.log(`\n--- ${stage.label} (D${stage.day_offset >= 0 ? "+" : ""}${stage.day_offset}) ---`);
  console.log(stage.brief_summary);
}

console.log("\n=== Demo 3: getStageBrief(ive, iam, d-day-mv-release) ===");
const single = getStageBrief("ive", "iam", "d-day-mv-release");
if (single) {
  console.log(single.brief_summary);
} else {
  console.log("(ive iam era not found, 跳过)");
}
