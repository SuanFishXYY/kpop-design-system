import { summonCouncil } from "../engine/dispatch.mjs";
import { getRoutingPlan, estimateCost, MODEL_TIERS } from "../engine/routing.mjs";

const BRIEFS = [
  "BLACKPINK × TWICE 跨厂牌 comeback landing",
  "IVE 风格 SaaS B 端 dashboard",
  "BLACKPINK × TWICE × IVE 大型平台改版",
];

console.log("=== Model Tier Definitions ===");
for (const [k, v] of Object.entries(MODEL_TIERS)) {
  console.log(`  ${k}: cost=${v.cost_relative}x · ${v.use_for}`);
  console.log(`    claude: ${v.recommended.claude} | gpt: ${v.recommended.gpt}`);
}

for (const brief of BRIEFS) {
  console.log("\n========================================");
  console.log("BRIEF:", brief);
  console.log("========================================");
  const council = summonCouncil(brief);
  const { plan, summary } = getRoutingPlan(council, "claude");

  console.log(`Total agents: ${summary.total_agents}`);
  console.log(`  premium: ${summary.premium_count} · standard: ${summary.standard_count} · fast: ${summary.fast_count}`);
  console.log(`Cost units (smart routing): ${summary.cost_units}`);
  console.log(`Cost units (naive all-premium): ${summary.naive_all_premium_cost}`);
  console.log(`💰 Savings: ${summary.savings_pct}%`);

  console.log("\nPremium (panel):");
  plan.premium.forEach(a => console.log(`  ${a.slug} (${a.layer}) → ${a.model}`));
  console.log("\nStandard (group_anchor):");
  plan.standard.forEach(a => console.log(`  ${a.slug} (${a.layer}) → ${a.model}`));
  console.log(`\nFast (performer + audience): ${plan.fast.length} agents`);
  plan.fast.slice(0, 3).forEach(a => console.log(`  ${a.slug} (${a.layer}) → ${a.model}`));
  if (plan.fast.length > 3) console.log(`  ... + ${plan.fast.length - 3} more`);
}
