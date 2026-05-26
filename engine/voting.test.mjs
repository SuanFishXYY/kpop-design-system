// engine/voting.test.mjs
// 单元测试: 投票引擎核心场景
import { tallyCouncilVotes, isEligibleVoter } from "./voting.mjs";

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    pass++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    fail++;
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || "assertion failed"); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg || "neq"}: got ${a}, expected ${b}`); }

console.log("\n=== voting.mjs unit tests ===\n");

test("空议会返回 not passed", () => {
  const r = tallyCouncilVotes([]);
  eq(r.passed, false);
});

test("团魂否决 → 一票否决", () => {
  const r = tallyCouncilVotes([
    { slug: "group-soul-twice", layer: "group_soul", weight: 3, vote: "no", is_veto: true, reason: "违反 9 色花束" },
    { slug: "twice-momo", layer: "tier_0", weight: 2, vote: "yes", reason: "动效不错" },
    { slug: "twice-sana", layer: "tier_0", weight: 2, vote: "yes", reason: "气氛在线" },
  ]);
  eq(r.passed, false);
  assert(r.reason.includes("团魂否决"), "应识别为团魂否决");
  eq(r.vetoed_by.length, 1);
});

test("加权通过 ≥ 2/3", () => {
  const r = tallyCouncilVotes([
    { slug: "group-soul-twice", layer: "group_soul", weight: 3, vote: "yes", reason: "符合 DNA" },
    { slug: "twice-momo", layer: "tier_0", weight: 2, vote: "yes", reason: "ok" },
    { slug: "twice-sana", layer: "tier_0", weight: 2, vote: "yes", reason: "ok" },
    { slug: "twice-mina", layer: "tier_0", weight: 2, vote: "no", reason: "黑白太冷" },
  ]);
  eq(r.passed, true);
  // yes=7, no=2, ratio=7/9=0.778 >= 0.667
  assert(r.yes_ratio >= 0.667);
});

test("加权未达 → 否决", () => {
  const r = tallyCouncilVotes([
    { slug: "group-soul-bp", layer: "group_soul", weight: 3, vote: "yes", reason: "ok" },
    { slug: "bp-jisoo", layer: "tier_0", weight: 2, vote: "no", reason: "太硬" },
    { slug: "bp-jennie", layer: "tier_0", weight: 2, vote: "no", reason: "太软" },
    { slug: "bp-rose", layer: "tier_0", weight: 2, vote: "no", reason: "不优雅" },
  ]);
  // yes=3, no=6, ratio=3/9=0.333 < 0.667
  eq(r.passed, false);
  assert(r.yes_ratio < 0.667);
});

test("abstain 不影响 ratio", () => {
  const r = tallyCouncilVotes([
    { slug: "group-soul-twice", layer: "group_soul", weight: 3, vote: "yes", reason: "ok" },
    { slug: "twice-momo", layer: "tier_0", weight: 2, vote: "yes", reason: "ok" },
    { slug: "twice-sana", layer: "tier_0", weight: 2, vote: "abstain", reason: "弃权" },
  ]);
  // yes=5, no=0, total=5, ratio=1.0
  eq(r.passed, true);
  eq(r.yes_ratio, 1);
});

test("by_layer tally 正确分层", () => {
  const r = tallyCouncilVotes([
    { slug: "group-soul-ive", layer: "group_soul", weight: 3, vote: "yes", reason: "ok" },
    { slug: "ive-yujin", layer: "tier_0", weight: 2, vote: "yes", reason: "ok" },
    { slug: "ive-wonyoung", layer: "tier_0", weight: 2, vote: "yes", reason: "ok" },
    { slug: "kep1er-yujin", layer: "tier_1", weight: 1.5, vote: "yes", reason: "ok" },
  ]);
  eq(r.by_layer.group_soul.yes, 1);
  eq(r.by_layer.tier_0.yes, 2);
  eq(r.by_layer.tier_1.yes, 1);
  eq(r.by_layer.tier_0.weight_yes, 4);
});

test("isEligibleVoter 校验", () => {
  assert(isEligibleVoter({ layer: "tier_0", weight: 2 }));
  assert(!isEligibleVoter({ layer: "spectator", weight: 1 }));
  assert(!isEligibleVoter({ layer: "tier_0", weight: 0 }));
  assert(!isEligibleVoter(null));
});

console.log(`\n=== ${pass} passed · ${fail} failed ===\n`);
if (fail > 0) process.exit(1);
