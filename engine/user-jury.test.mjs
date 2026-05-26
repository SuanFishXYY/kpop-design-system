// engine/user-jury.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { tallyWithUser, castUserVote, MAX_USER_WEIGHT } from "./user-jury.mjs";

test("council 全 pass, 无用户 → final_verdict = pass", () => {
  const r = tallyWithUser([
    { voter: "a", verdict: "pass" },
    { voter: "b", verdict: "pass" },
    { voter: "c", verdict: "pass" },
  ]);
  assert.equal(r.final_verdict, "pass");
  assert.equal(r.user_effect, "none");
});

test("用户 veto: council pass + user reject → user_veto", () => {
  const r = tallyWithUser(
    [{ voter: "a", verdict: "pass" }, { voter: "b", verdict: "pass" }, { voter: "c", verdict: "pass" }],
    castUserVote("reject", 1, "不喜欢色调"),
  );
  assert.equal(r.final_verdict, "user_veto");
  assert.equal(r.user_effect, "veto");
  assert(r.audit_trail.some(t => t.source === "user" && t.reason === "不喜欢色调"));
});

test("用户 override: council reject + user pass → user_override", () => {
  const r = tallyWithUser(
    [{ voter: "a", verdict: "reject" }, { voter: "b", verdict: "reject" }],
    castUserVote("pass", 3, "我就要这个"),
  );
  assert.equal(r.final_verdict, "user_override");
  assert.equal(r.user_effect, "override");
  assert.equal(r.user_weight, 3);
});

test("用户权重上限 = MAX_USER_WEIGHT (3)", () => {
  const v = castUserVote("pass", 99);
  assert.equal(v.weight, MAX_USER_WEIGHT);
});

test("用户同向 council pass → concur (无 override)", () => {
  const r = tallyWithUser(
    [{ voter: "a", verdict: "pass" }, { voter: "b", verdict: "pass" }, { voter: "c", verdict: "pass" }],
    castUserVote("pass", 1),
  );
  assert.equal(r.final_verdict, "pass");
  assert.equal(r.user_effect, "concur");
});

test("invalid verdict 抛 error", () => {
  assert.throws(() => castUserVote("maybe"));
});
