import { test } from "node:test";
import assert from "node:assert";
import { classifyClauses, tallyVote } from "./verdict.mjs";

const baseCouncil = {
  summoner: { slug: "ive" },
  members: [
    { slug: "ive", type: "group", vote_decision: "for" },
    { slug: "aespa", type: "group", vote_decision: "for" },
    { slug: "ive-wonyoung", type: "idol", vote_decision: "for" },
  ],
};

test("consensus classification uses >=2/3 agree", () => {
  const c = classifyClauses({ a: { stance: "agree" }, b: { stance: "agree" }, c: { stance: "dissent" } });
  assert.equal(c.consensus.length, 1);
  assert.equal(c.dissent.length, 1);
});

test("strict threshold rejects exactly 2/3", () => {
  const council = { summoner: { slug: "a" }, members: [
    { slug: "a", vote_decision: "for" }, { slug: "b", vote_decision: "for" }, { slug: "c", vote_decision: "against" },
  ] };
  const tally = tallyVote(council, {});
  assert.equal(tally.ratio, 0.667);
  assert.equal(tally.verdict, "reject");
});

test("abstain not counted in denominator", () => {
  const council = { summoner: { slug: "a" }, members: [
    { slug: "a", vote_decision: "for" }, { slug: "b", vote_decision: "for" }, { slug: "c", vote_decision: "abstain" },
  ] };
  const tally = tallyVote(council, {});
  assert.equal(tally.ratio, 1);
  assert.equal(tally.verdict, "pass");
});

test("user veto and override are explicit interventions", () => {
  assert.equal(tallyVote(baseCouncil, {}, "against", true, false).verdict, "user_veto");
  assert.equal(tallyVote(baseCouncil, {}, "for", false, true).verdict, "user_override");
});

test("chair abstain invalid", () => {
  const council = { summoner: { slug: "ive" }, members: [{ slug: "ive", vote_decision: "abstain" }, { slug: "aespa", vote_decision: "for" }] };
  const tally = tallyVote(council, {});
  assert.equal(tally.verdict, "invalid");
});
