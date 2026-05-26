import { buildAwardsStage, scoreAwardsStage, loadStage, loadLineage } from "../engine/dispatch.mjs";

const BRIEF = "BLACKPINK × TWICE 跨厂牌 comeback landing 页 · 高端奢华 + 元气甜美双 hero · 联袂回归舞台";

// 简单 voteSimulator: 90% yes, 10% no
function voteSimulator(agent, brief) {
  const seed = (agent.slug || "").length + brief.length;
  const r = (seed * 9301 + 49297) % 233280 / 233280;
  if (r < 0.88) return { vote: "yes", reason: `${agent.slug} 认可舞台张力` };
  return { vote: "no", reason: `${agent.slug} 担心节奏冲突`, is_veto: false };
}

const stage = buildAwardsStage(BRIEF);
const result = scoreAwardsStage(BRIEF, voteSimulator);

console.log("=== AWARDS STAGE ===");
console.log("panel:", stage.judges?.map(j => j.slug) || []);
console.log("group_anchor:", stage.souls.map(s => s.group_slug));
console.log("audience:", stage.fandoms?.map(f => f.fandom_name) || []);
console.log("performers:", stage.invited.length);
console.log("fusion:", stage.fusion_check.is_fusion);
console.log("cross_label:", stage.cross_label_check.is_cross_label, "gate_passed:", stage.cross_label_check.gate_passed);
console.log("rivalry:", stage.rivalry_check?.has_rivalry, "pairs:", JSON.stringify(stage.rivalry_check?.pairs || []));

console.log("\n=== AWARD CATEGORIES (matched) ===");
const cat = loadStage("comeback");
console.log("category:", cat?.slug || "n/a", "-", cat?.title || "");

console.log("\n=== LEGACY LINEAGE ===");
const lin = loadLineage("visual_center");
console.log("legacy:", lin?.slug || "n/a", "-", lin?.title || "");

console.log("\n=== LIVE VOTING ===");
const byLayer = {};
for (const v of result.votes) {
  byLayer[v.layer] = byLayer[v.layer] || { yes: 0, no: 0, weight_yes: 0, weight_no: 0 };
  byLayer[v.layer][v.vote] += 1;
  byLayer[v.layer][`weight_${v.vote}`] += v.weight;
}
for (const [layer, t] of Object.entries(byLayer)) {
  console.log(`  ${layer}: yes=${t.yes} no=${t.no} (weighted yes=${t.weight_yes} no=${t.weight_no})`);
}

console.log("\n=== FINAL DECISION ===");
console.log("passed:", result.decision.passed);
console.log("ratio:", result.decision.ratio?.toFixed(3));
console.log("reason:", result.decision.reason);
