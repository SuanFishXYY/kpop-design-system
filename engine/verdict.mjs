// engine/verdict.mjs
// v3.3.0 ? Mixed Council verdict clauses + strict >2/3 voting.

import { castUserVote, tallyWithUser } from "./user-jury.mjs";
import { tallyCouncilVotes } from "./voting.mjs";

function membersOf(council) { return Array.isArray(council) ? council : (council?.members || []); }
function chairSlug(council) { return council?.summoner?.slug || membersOf(council)[0]?.slug || ""; }
function normalizeVote(v) {
  if (v === "yes" || v === "for" || v === "pass") return "for";
  if (v === "no" || v === "against" || v === "reject") return "against";
  return "abstain";
}

export function classifyClauses(R3_output) {
  const entries = Object.entries(R3_output || {}).filter(([k]) => !k.startsWith("_"));
  const total = entries.length || 1;
  const buckets = { agree: [], compromise: [], dissent: [] };
  for (const [member, row] of entries) {
    const stance = row?.stance || "dissent";
    if (stance === "agree") buckets.agree.push(member);
    else if (stance === "compromise") buckets.compromise.push(member);
    else buckets.dissent.push(member);
  }
  const consensus = buckets.agree.length / total >= 2 / 3 ? [{ clause: "Preserve shared identity anchors", supporters: buckets.agree }] : [];
  const compromise = (buckets.agree.length + buckets.compromise.length) / total > 1 / 2 ? [{ clause: "Adopt negotiated tradeoffs", supporters: [...buckets.agree, ...buckets.compromise] }] : [];
  const dissent = buckets.dissent.map(member => ({ clause: `Dissent retained by ${member}`, supporters: [member], leave_to_user: true }));
  return { consensus, compromise, dissent };
}

export function tallyVote(council, clauses, userVote = null, userVeto = false, userOverride = false) {
  const members = membersOf(council);
  const chair = chairSlug(council);
  const audit_trail = [];
  const votes = [];
  for (const m of members) {
    const vote = normalizeVote(m.vote_decision || m.vote || "for");
    if (m.slug === chair && vote === "abstain") {
      return { verdict: "invalid", reason: "chair abstain invalid", for: 0, against: 0, abstain: 0, ratio: 0, passed_by: "none", user_intervention: "none", audit_trail: [{ voter: m.slug, vote }] };
    }
    votes.push({ voter: m.slug, vote });
    audit_trail.push({ source: "council", voter: m.slug, vote });
  }

  // Evidence reuse: call existing weighted engine with unit weights for compatibility audit.
  const compatibility = tallyCouncilVotes(votes.map(v => ({ slug: v.voter, layer: "performer_t0", weight: 1, vote: v.vote === "for" ? "yes" : v.vote === "against" ? "no" : "abstain", reason: "mixed council unit vote" })));

  if (userVote) {
    const uv = normalizeVote(typeof userVote === "string" ? userVote : userVote.verdict);
    votes.push({ voter: "user", vote: uv });
    audit_trail.push({ source: "user", voter: "user", vote: uv, reason: userVote.reason || "user vote" });
    // Evidence reuse: validate user vote shape through v3.1 adapter.
    tallyWithUser([], castUserVote(uv === "for" ? "pass" : uv === "against" ? "reject" : "abstain", 1, userVote.reason || "mixed council"));
  }

  if (userVeto) return { verdict: "user_veto", for: votes.filter(v => v.vote === "for").length, against: votes.filter(v => v.vote === "against").length, abstain: votes.filter(v => v.vote === "abstain").length, ratio: 0, passed_by: "user veto", user_intervention: "veto", audit_trail, compatibility };
  if (userOverride) return { verdict: "user_override", for: votes.filter(v => v.vote === "for").length, against: votes.filter(v => v.vote === "against").length, abstain: votes.filter(v => v.vote === "abstain").length, ratio: 1, passed_by: "user override", user_intervention: "override", audit_trail, compatibility };

  const yes = votes.filter(v => v.vote === "for").length;
  const no = votes.filter(v => v.vote === "against").length;
  const abstain = votes.filter(v => v.vote === "abstain").length;
  const denom = yes + no;
  const ratio = denom ? yes / denom : 0;
  const passed = ratio > 2 / 3;
  return { verdict: passed ? "pass" : "reject", for: yes, against: no, abstain, ratio: Number(ratio.toFixed(3)), passed_by: passed ? "strict >2/3" : "below strict >2/3", user_intervention: "none", audit_trail, compatibility };
}

export function produceVerdictDocument(council, brief, classified, tally) {
  const lines = [
    `# Mixed Council Verdict`,
    ``,
    `Brief: ${brief}`,
    `Chair: ${chairSlug(council)}`,
    `Verdict: ${tally.verdict} (${tally.for}/${tally.for + tally.against}, abstain ${tally.abstain})`,
    ``,
    `## Consensus`,
    ...(classified.consensus || []).map(c => `- ${c.clause}`),
    `## Compromise`,
    ...(classified.compromise || []).map(c => `- ${c.clause}`),
    `## Dissent`,
    ...(classified.dissent || []).map(c => `- ${c.clause}`),
  ];
  return lines.join("\n");
}
