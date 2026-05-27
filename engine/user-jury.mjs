// engine/user-jury.mjs
// v3.1 Phase A · 用户票席引擎 (User Seat in Council)

const MAX_USER_WEIGHT = 3;

/**
 * 模拟一次 council 投票 + 用户投票合并 tally
 * @param {Array<{voter, verdict}>} council_votes  idol council verdicts: "pass" | "reject" | "abstain"
 * @param {{verdict, weight, reason}|null} user_vote 用户投票 (可选)
 * @returns {final_verdict, tally, user_effect, audit_trail}
 */
export function tallyWithUser(council_votes, user_vote = null) {
  const audit_trail = [];
  
  const tally = { pass: 0, reject: 0, abstain: 0 };
  for (const v of council_votes) {
    tally[v.verdict] = (tally[v.verdict] || 0) + 1;
    audit_trail.push({ source: "council", voter: v.voter, verdict: v.verdict });
  }
  
  // council-only verdict (2/3 multiplier from voting.mjs convention)
  const council_total = council_votes.length;
  const council_pass_ratio = council_total ? tally.pass / council_total : 0;
  const council_verdict = council_pass_ratio >= 2 / 3 ? "pass"
    : tally.reject > tally.pass ? "reject"
    : "abstain";
  
  // 加入用户票
  let user_effect = "none";
  let final_verdict = council_verdict;
  
  if (user_vote) {
    const w = Math.min(Math.max(user_vote.weight || 1, 1), MAX_USER_WEIGHT);
    tally[user_vote.verdict] = (tally[user_vote.verdict] || 0) + w;
    audit_trail.push({
      source: "user", verdict: user_vote.verdict, weight: w,
      reason: user_vote.reason || "(no reason)",
    });
    
    // 用户 veto: council pass 但 user reject
    if (council_verdict === "pass" && user_vote.verdict === "reject") {
      final_verdict = "user_veto";
      user_effect = "veto";
    }
    // 用户 override: council reject 但 user pass
    else if (council_verdict === "reject" && user_vote.verdict === "pass") {
      final_verdict = "user_override";
      user_effect = "override";
    }
    // 用户 abstain or 同向: 保持 council verdict
    else if (user_vote.verdict === council_verdict) {
      user_effect = "concur";
    }
  }
  
  return {
    final_verdict,
    council_verdict,
    tally,
    user_effect,
    user_weight: user_vote ? Math.min(user_vote.weight || 1, MAX_USER_WEIGHT) : 0,
    audit_trail,
  };
}

export function castUserVote(verdict, weight = 1, reason = "") {
  if (!["pass", "reject", "abstain"].includes(verdict)) {
    throw new Error(`invalid verdict: ${verdict}`);
  }
  return { verdict, weight: Math.min(Math.max(weight, 1), MAX_USER_WEIGHT), reason };
}

export { MAX_USER_WEIGHT };
