// engine/dispatch.test.mjs
// 集成测试: 真 brief → dispatch → 决议
import { dispatchBrief, summonCouncil, loadAllAgents } from "./dispatch.mjs";

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log(`  ✅ ${name}`); pass++; }
  catch (e) { console.log(`  ❌ ${name}: ${e.message}`); fail++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || "assertion failed"); }

console.log("\n=== dispatch.mjs integration tests ===\n");

test("loadAllAgents 加载 44 souls + 102 idols + 7 judges", () => {
  const { souls, idols, judges } = loadAllAgents();
  console.log(`     souls=${souls.length}  idols=${idols.length}  judges=${(judges||[]).length}`);
  assert(souls.length >= 40, `expected ~44 souls, got ${souls.length}`);
  assert(idols.length === 102, `expected 102 idols, got ${idols.length}`);
  assert((judges||[]).length >= 7, `expected ≥7 judges, got ${(judges||[]).length}`);
});

test("brief 提到 TWICE → 召集 TWICE 团魂 + 9 idol", () => {
  const c = summonCouncil("帮我做一个 TWICE 风格的化妆品官网 hero");
  console.log(`     souls=${c.souls.map(s=>s.group_slug)}  idols=${c.invited.length}`);
  assert(c.souls.some(s => s.group_slug === "twice"), "应召集 twice 团魂");
  assert(c.invited.length >= 5, "应至少召集 5 个 TWICE idol");
});

test("brief 提到 BLACKPINK + TWICE → 跨团融合", () => {
  const c = summonCouncil("BLACKPINK 和 TWICE 联名快闪");
  console.log(`     souls=${c.souls.map(s=>s.group_slug)}  fusion=${c.fusion_check.is_fusion}`);
  assert(c.souls.length >= 2, "应召集多个团魂");
  assert(c.fusion_check.is_fusion, "应识别为 fusion mode");
});

test("BLACKPINK × TWICE fusion 校验通过 (双向白名单)", () => {
  const c = summonCouncil("BLACKPINK x TWICE 联名");
  const incompat = c.fusion_check.incompatible || [];
  console.log(`     incompatible pairs=${incompat.length}`);
  assert(c.fusion_check.fully_compatible, `应完全兼容, 不兼容对: ${JSON.stringify(incompat)}`);
});

test("dispatch 全员 yes → passed", () => {
  const r = dispatchBrief("TWICE 风格 hero", () => ({ vote: "yes", reason: "ok" }));
  console.log(`     ratio=${r.decision.yes_ratio} passed=${r.decision.passed}`);
  assert(r.decision.passed, "全员 yes 应通过");
});

test("dispatch 团魂否决 → 一票否决", () => {
  const r = dispatchBrief("TWICE 风格 hero", (agent) => {
    if (agent.layer === "group_soul") return { vote: "no", is_veto: true, reason: "违反 9 色花束 DNA" };
    return { vote: "yes", reason: "ok" };
  });
  console.log(`     passed=${r.decision.passed}  reason=${r.decision.reason}`);
  assert(!r.decision.passed, "团魂否决应让议会失败");
});

test("dispatch 多数反对 → 未达 2/3", () => {
  const r = dispatchBrief("TWICE 风格 hero", (agent) => ({
    vote: agent.layer === "group_soul" || agent.layer === "judge" ? "yes" : "no",
    reason: "细节不行"
  }));
  console.log(`     ratio=${r.decision.yes_ratio} passed=${r.decision.passed}`);
  assert(!r.decision.passed, "多数反对应未通过");
});

// === v1.2.0 评委层 + 跨 label gate ===

test("brief 提到 TWICE → 自动召唤 JYP 评委 (旗下团)", () => {
  const c = summonCouncil("帮我做 TWICE 风格化妆品 hero");
  const jyp = c.judges.find(j => j.judge_slug === "jyp");
  console.log(`     judges=${c.judges.map(j=>j.judge_slug)}`);
  assert(jyp, "应自动召唤 JYP 评委 (TWICE 在 portfolio)");
});

test("brief 提 BLACKPINK + TWICE → JYP + YG 双评委到场 (跨 label)", () => {
  const c = summonCouncil("BLACKPINK 和 TWICE 联名快闪");
  const labels = c.judges.map(j => j.label);
  console.log(`     labels=${labels}  gate_passed=${c.cross_label_check.gate_passed}`);
  assert(c.cross_label_check.is_cross_label, "应识别为 cross-label");
  assert(c.cross_label_check.gate_passed, `gate 应通过, missing=${c.cross_label_check.missing}`);
});

test("JYP 评委对 TWICE brief 一票否决 → 决议失败 (高于团魂)", () => {
  const r = dispatchBrief("TWICE 风格 hero", (agent) => {
    if (agent.layer === "judge" && agent.judge_slug === "jyp") {
      return { vote: "no", is_veto: true, reason: "noise level 不够" };
    }
    return { vote: "yes", reason: "ok" };
  });
  console.log(`     passed=${r.decision.passed}  reason=${r.decision.reason}`);
  assert(!r.decision.passed, "JYP 否决应让议会失败");
  assert(r.decision.reason.includes("评委否决") || r.decision.reason.includes("judge"), 
    `应标注评委否决, got: ${r.decision.reason}`);
});

test("评委 weight=5 高于团魂 weight=3 (vote 权重检查)", () => {
  const r = dispatchBrief("TWICE 风格 hero", () => ({ vote: "yes", reason: "ok" }));
  const judgeVote = r.votes.find(v => v.layer === "judge");
  console.log(`     judge weight=${judgeVote?.weight}`);
  assert(judgeVote, "应有评委投票");
  assert(judgeVote.weight === 5, `评委 weight 应=5, got ${judgeVote.weight}`);
});

test("NMIXX 补齐: ≥6 个 NMIXX idol (Lily+5)", () => {
  const c = summonCouncil("NMIXX 风格新案翻译");
  console.log(`     NMIXX idols=${c.invited.length}`);
  assert(c.invited.length >= 6, `应至少 6 个 NMIXX idol, got ${c.invited.length}`);
});

console.log(`\n=== ${pass} passed · ${fail} failed ===\n`);
if (fail > 0) process.exit(1);
