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

test("loadAllAgents 加载 44 souls + 97 idols", () => {
  const { souls, idols } = loadAllAgents();
  console.log(`     souls=${souls.length}  idols=${idols.length}`);
  assert(souls.length >= 40, `expected ~44 souls, got ${souls.length}`);
  assert(idols.length === 97, `expected 97 idols, got ${idols.length}`);
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
    vote: agent.layer === "group_soul" ? "yes" : "no",
    reason: "细节不行"
  }));
  console.log(`     ratio=${r.decision.yes_ratio} passed=${r.decision.passed}`);
  assert(!r.decision.passed, "多数反对应未通过");
});

console.log(`\n=== ${pass} passed · ${fail} failed ===\n`);
if (fail > 0) process.exit(1);
