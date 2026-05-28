// engine/routing.mjs
// v2.3.0 · Cost-Aware Model Routing
// 给 panel/group_anchor/performer/audience 各层分配合适的模型档位。
// 不是所有 agent 都该用最贵的模型 — panel 用 premium (veto 权), audience 用 fast (一句话买单率).

// ============ 档位定义 ============

export const MODEL_TIERS = {
  premium: {
    label: "premium",
    cost_relative: 10,
    recommended: {
      claude: "claude-opus-4.7",
      gpt: "gpt-5.5",
      gemini: "gemini-2.5-pro",
    },
    use_for: "panel 评审 (有 veto 权 + manifesto 复杂推理)",
  },
  standard: {
    label: "standard",
    cost_relative: 3,
    recommended: {
      claude: "claude-sonnet-4.6",
      gpt: "gpt-5.4",
      gemini: "gemini-2.5-flash",
    },
    use_for: "group_anchor 团代表 (DNA 包推理 + 集体宣言守护)",
  },
  fast: {
    label: "fast",
    cost_relative: 1,
    recommended: {
      claude: "claude-haiku-4.5",
      gpt: "gpt-5-mini",
      gemini: "gemini-2.0-flash",
    },
    use_for: "performer 担当 + audience 粉丝团 (个体一句话视角)",
  },
};

// ============ Layer → Tier 映射 (默认) ============

export const LAYER_TIER_MAP = {
  panel:         "premium",
  judge:         "premium",   // 向后兼容
  group_anchor:  "standard",
  group_soul:    "standard",  // 向后兼容
  performer_t0:  "fast",
  performer_t1:  "fast",
  tier_0:        "fast",      // 向后兼容
  tier_1:        "fast",      // 向后兼容
  audience:      "fast",
  fandom:        "fast",      // 向后兼容
};

// ============ API ============

/**
 * 单个 agent 取推荐档位.
 * 优先级: agent.model_tier (frontmatter override) > LAYER_TIER_MAP > "fast"
 */
export function getModelTier(agent) {
  if (agent && agent.model_tier && MODEL_TIERS[agent.model_tier]) {
    return agent.model_tier;
  }
  const tier = LAYER_TIER_MAP[agent && agent.layer];
  return tier || "fast";
}

/**
 * 取具体推荐模型名 (按 family 选).
 * @param {object} agent
 * @param {"claude"|"gpt"|"gemini"} family
 */
export function getRecommendedModel(agent, family = "claude") {
  const tier = getModelTier(agent);
  return MODEL_TIERS[tier].recommended[family] || MODEL_TIERS[tier].recommended.claude;
}

/**
 * Build a routing plan for a council returned by summonCouncil.
 * Used by dispatchers to spawn sub-agents across model tiers.
 */
export function getRoutingPlan(council, family = "claude") {
  const plan = { premium: [], standard: [], fast: [] };

  const pushAll = (items) => {
    for (const a of items || []) {
      const tier = getModelTier(a);
      plan[tier].push({
        slug: a.slug,
        layer: a.layer,
        tier,
        model: MODEL_TIERS[tier].recommended[family],
      });
    }
  };

  pushAll(council.judges);
  pushAll(council.souls);
  pushAll(council.invited);
  pushAll(council.fandoms);

  const total_agents = plan.premium.length + plan.standard.length + plan.fast.length;
  const cost_units =
    plan.premium.length * MODEL_TIERS.premium.cost_relative +
    plan.standard.length * MODEL_TIERS.standard.cost_relative +
    plan.fast.length * MODEL_TIERS.fast.cost_relative;
  const naive_cost = total_agents * MODEL_TIERS.premium.cost_relative;
  const savings_pct = naive_cost > 0 ? Math.round((1 - cost_units / naive_cost) * 100) : 0;

  return {
    plan,
    summary: {
      total_agents,
      premium_count: plan.premium.length,
      standard_count: plan.standard.length,
      fast_count: plan.fast.length,
      cost_units,
      naive_all_premium_cost: naive_cost,
      savings_pct,
      family,
    },
  };
}

/**
 * 估算成本 (相对单位).
 * cost_units = sum(layer_count × tier_cost)
 * 用于 BRIEF 提交前的 pre-flight 估算.
 */
export function estimateCost(council) {
  const { summary } = getRoutingPlan(council);
  return summary;
}
