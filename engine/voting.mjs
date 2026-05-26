// engine/voting.mjs
// 加权陪审团真投票引擎
// 输入: 议会成员 + 各自的投票意见
// 输出: 通过/否决 + 详细票面 + 团魂否决标记

const QUORUM_RATIO = 2 / 3;

/**
 * 单个 agent 的投票记录
 * @typedef {Object} Vote
 * @property {string} slug         - agent slug (e.g. "twice-momo" or "group-soul-twice")
 * @property {string} layer        - "group_soul" | "tier_0" | "tier_1"
 * @property {number} weight       - 3 | 2 | 1.5
 * @property {"yes"|"no"|"abstain"} vote
 * @property {string} reason       - 投票理由
 * @property {boolean} [is_veto]   - 团魂层是否使用否决权
 */

/**
 * 议会投票主函数
 * @param {Vote[]} votes
 * @returns {Object} 决议结果
 */
export function tallyCouncilVotes(votes) {
  if (!Array.isArray(votes) || votes.length === 0) {
    return { passed: false, reason: "empty council", tally: {} };
  }

  // 1. 团魂否决检查 (vote=no + is_veto=true) — 一票否决
  const vetoes = votes.filter(v => v.layer === "group_soul" && v.is_veto && v.vote === "no");
  if (vetoes.length > 0) {
    return {
      passed: false,
      reason: `团魂否决 (group_soul veto): ${vetoes.map(v => v.slug).join(", ")}`,
      vetoed_by: vetoes.map(v => ({ slug: v.slug, reason: v.reason })),
      tally: { veto: vetoes.length }
    };
  }

  // 2. 加权计票 (abstain 不计入分子也不计入分母)
  const yes_weight = votes.filter(v => v.vote === "yes").reduce((s, v) => s + v.weight, 0);
  const no_weight  = votes.filter(v => v.vote === "no").reduce((s, v) => s + v.weight, 0);
  const total_weight = yes_weight + no_weight;
  const yes_ratio = total_weight === 0 ? 0 : yes_weight / total_weight;

  const passed = yes_ratio >= QUORUM_RATIO;

  // 3. 分层 tally (透明化决议过程)
  const by_layer = {};
  for (const v of votes) {
    if (!by_layer[v.layer]) by_layer[v.layer] = { yes: 0, no: 0, abstain: 0, weight_yes: 0, weight_no: 0 };
    by_layer[v.layer][v.vote]++;
    if (v.vote === "yes") by_layer[v.layer].weight_yes += v.weight;
    if (v.vote === "no")  by_layer[v.layer].weight_no  += v.weight;
  }

  return {
    passed,
    quorum_required: QUORUM_RATIO,
    yes_ratio: Number(yes_ratio.toFixed(3)),
    tally: {
      yes_count: votes.filter(v => v.vote === "yes").length,
      no_count:  votes.filter(v => v.vote === "no").length,
      abstain_count: votes.filter(v => v.vote === "abstain").length,
      yes_weight,
      no_weight,
      total_weight,
    },
    by_layer,
    decision_reason: passed
      ? `加权通过 ${(yes_ratio * 100).toFixed(1)}% ≥ ${(QUORUM_RATIO * 100).toFixed(1)}%`
      : `未达票数 ${(yes_ratio * 100).toFixed(1)}% < ${(QUORUM_RATIO * 100).toFixed(1)}%`
  };
}

/**
 * 验证一个 agent 是否有合法投票权
 * (用于 dispatch.mjs 校验邀请名单)
 */
export function isEligibleVoter(agent) {
  if (!agent || !agent.layer) return false;
  if (!["group_soul", "tier_0", "tier_1"].includes(agent.layer)) return false;
  if (typeof agent.weight !== "number" || agent.weight <= 0) return false;
  return true;
}

/**
 * 计算给定议会的"通过基准线" (达到这个 yes_weight 才能过)
 */
export function quorumThreshold(votes) {
  const total = votes.reduce((s, v) => s + v.weight, 0);
  return total * QUORUM_RATIO;
}
