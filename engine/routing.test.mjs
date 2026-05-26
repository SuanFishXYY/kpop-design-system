// engine/routing.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { getModelTier, getRecommendedModel, getRoutingPlan, MODEL_TIERS, LAYER_TIER_MAP } from "./routing.mjs";

console.log("=== routing.mjs unit tests ===");

test("panel agent → premium", () => {
  const t = getModelTier({ layer: "panel" });
  assert.equal(t, "premium");
});

test("judge agent (legacy) → premium (backward compat)", () => {
  const t = getModelTier({ layer: "judge" });
  assert.equal(t, "premium");
});

test("group_anchor → standard", () => {
  const t = getModelTier({ layer: "group_anchor" });
  assert.equal(t, "standard");
});

test("group_soul (legacy) → standard", () => {
  const t = getModelTier({ layer: "group_soul" });
  assert.equal(t, "standard");
});

test("performer_t0 → fast", () => {
  const t = getModelTier({ layer: "performer_t0" });
  assert.equal(t, "fast");
});

test("audience → fast", () => {
  const t = getModelTier({ layer: "audience" });
  assert.equal(t, "fast");
});

test("frontmatter model_tier override 优先", () => {
  const t = getModelTier({ layer: "audience", model_tier: "premium" });
  assert.equal(t, "premium");
});

test("无 layer 默认 fast", () => {
  const t = getModelTier({});
  assert.equal(t, "fast");
});

test("getRecommendedModel claude family", () => {
  const m = getRecommendedModel({ layer: "panel" }, "claude");
  assert.equal(m, "claude-opus-4.7");
});

test("getRecommendedModel gpt family", () => {
  const m = getRecommendedModel({ layer: "group_anchor" }, "gpt");
  assert.equal(m, "gpt-5.4");
});

test("getRoutingPlan 分桶正确", () => {
  const council = {
    judges: [{ slug: "jyp", layer: "panel" }],
    souls: [{ slug: "bp", layer: "group_anchor" }, { slug: "twice", layer: "group_anchor" }],
    invited: [{ slug: "jennie", layer: "performer_t0" }],
    fandoms: [{ slug: "blink", layer: "audience" }],
  };
  const { plan, summary } = getRoutingPlan(council);
  assert.equal(plan.premium.length, 1);
  assert.equal(plan.standard.length, 2);
  assert.equal(plan.fast.length, 2);
  assert.equal(summary.total_agents, 5);
  assert.equal(summary.cost_units, 1*10 + 2*3 + 2*1); // 10+6+2 = 18
  assert.equal(summary.naive_all_premium_cost, 5*10); // 50
  assert.ok(summary.savings_pct >= 60);
});

test("getRoutingPlan 空 council 不爆", () => {
  const { plan, summary } = getRoutingPlan({});
  assert.equal(summary.total_agents, 0);
  assert.equal(plan.premium.length, 0);
});

test("MODEL_TIERS 三档齐全", () => {
  assert.ok(MODEL_TIERS.premium);
  assert.ok(MODEL_TIERS.standard);
  assert.ok(MODEL_TIERS.fast);
});

test("LAYER_TIER_MAP 含新旧 layer", () => {
  // 新
  assert.equal(LAYER_TIER_MAP.panel, "premium");
  assert.equal(LAYER_TIER_MAP.group_anchor, "standard");
  assert.equal(LAYER_TIER_MAP.audience, "fast");
  // 旧 (向后兼容)
  assert.equal(LAYER_TIER_MAP.judge, "premium");
  assert.equal(LAYER_TIER_MAP.group_soul, "standard");
  assert.equal(LAYER_TIER_MAP.fandom, "fast");
});
