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

test("loadAllAgents 加载 ≥52 souls + ≥186 idols + 7 judges", () => {
  const { souls, idols, judges } = loadAllAgents();
  console.log(`     souls=${souls.length}  idols=${idols.length}  judges=${(judges||[]).length}`);
  assert(souls.length >= 52, `expected ≥52 souls, got ${souls.length}`);
  assert(idols.length >= 186, `expected ≥186 idols, got ${idols.length}`);
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

test("dispatch 团代表不署名 → 一票否决", () => {
  const r = dispatchBrief("TWICE 风格 hero", (agent) => {
    if (agent.layer === "group_anchor" || agent.layer === "group_soul") return { vote: "no", is_veto: true, reason: "违反 9 色花束 DNA" };
    return { vote: "yes", reason: "ok" };
  });
  console.log(`     passed=${r.decision.passed}  reason=${r.decision.reason}`);
  assert(!r.decision.passed, "团代表不署名应让议会失败");
});

test("dispatch 多数反对 → 未达 2/3", () => {
  const r = dispatchBrief("TWICE 风格 hero", (agent) => ({
    vote: (agent.layer === "group_anchor" || agent.layer === "group_soul" || agent.layer === "panel" || agent.layer === "judge") ? "yes" : "no",
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

test("JYP 评审对 TWICE brief 一票否决 → 决议失败 (高于团代表)", () => {
  const r = dispatchBrief("TWICE 风格 hero", (agent) => {
    if ((agent.layer === "panel" || agent.layer === "judge") && agent.judge_slug === "jyp") {
      return { vote: "no", is_veto: true, reason: "noise level 不够" };
    }
    return { vote: "yes", reason: "ok" };
  });
  console.log(`     passed=${r.decision.passed}  reason=${r.decision.reason}`);
  assert(!r.decision.passed, "JYP 否决应让议会失败");
  assert(r.decision.reason.includes("评委否决") || r.decision.reason.includes("评审不署名") || r.decision.reason.includes("panel veto") || r.decision.reason.includes("judge"), 
    `应标注评审不署名, got: ${r.decision.reason}`);
});

test("评审 weight=5 高于团代表 weight=3 (vote 权重检查)", () => {
  const r = dispatchBrief("TWICE 风格 hero", () => ({ vote: "yes", reason: "ok" }));
  const judgeVote = r.votes.find(v => v.layer === "panel" || v.layer === "judge");
  console.log(`     panel weight=${judgeVote?.weight}`);
  assert(judgeVote, "应有评审投票");
  assert(judgeVote.weight === 5, `评审 weight 应=5, got ${judgeVote.weight}`);
});

test("NMIXX 补齐: ≥6 个 NMIXX idol (Lily+5)", () => {
  const c = summonCouncil("NMIXX 风格新案翻译");
  console.log(`     NMIXX idols=${c.invited.length}`);
  assert(c.invited.length >= 6, `应至少 6 个 NMIXX idol, got ${c.invited.length}`);
});

// === v1.3.0 热门团补齐 ===

test("MEOVV 补齐 5 人", () => {
  const c = summonCouncil("MEOVV 风格 hero");
  const meovvIdols = c.invited.filter(i => i.group === "MEOVV");
  console.log(`     MEOVV idols=${meovvIdols.length}`);
  assert(meovvIdols.length >= 5, `应至少 5 个 MEOVV idol, got ${meovvIdols.length}`);
});

test("KATSEYE 补齐 6 人 + 全球女团 cross-label 触发 HYBE", () => {
  const c = summonCouncil("KATSEYE 风格全球 brand");
  const katseyeIdols = c.invited.filter(i => i.group === "KATSEYE");
  const hybeJudge = c.judges.find(j => j.judge_slug === "bang-pd");
  console.log(`     KATSEYE idols=${katseyeIdols.length}  HYBE judge=${!!hybeJudge}`);
  assert(katseyeIdols.length >= 6, `应至少 6 个 KATSEYE idol, got ${katseyeIdols.length}`);
  assert(hybeJudge, "KATSEYE → 应自动召唤 HYBE/bang-pd 评委");
});

test("Kep1er 补齐 6 人 (选秀团) + Starship 评委到场", () => {
  const c = summonCouncil("Kep1er 风格出道即顶流");
  const kep1erIdols = c.invited.filter(i => i.group === "Kep1er");
  const starshipJudge = c.judges.find(j => j.judge_slug === "starship");
  console.log(`     Kep1er idols=${kep1erIdols.length}  Starship judge=${!!starshipJudge}`);
  assert(kep1erIdols.length >= 6, `应至少 6 个 Kep1er idol, got ${kep1erIdols.length}`);
  assert(starshipJudge, "Kep1er → 应自动召唤 Starship 评委");
});


test("loadAllAgents 加载 45 fandoms 粉丝团", () => {
  const { fandoms } = loadAllAgents();
  console.log(`     fandoms=${(fandoms||[]).length}`);
  if ((fandoms||[]).length !== 45) throw new Error(`expected 45 fandoms, got ${(fandoms||[]).length}`);
});

test("brief 提到 TWICE → 召集 ONCE 粉丝团", () => {
  const c = summonCouncil("帮 TWICE 设计新专辑封面");
  const once = (c.fandoms||[]).find(f => f.fandom_name === "ONCE");
  console.log(`     ONCE summoned=${!!once}`);
  if (!once) throw new Error("TWICE brief 应召集 ONCE 粉丝团");
});

test("dispatchBrief 含 audience 投票 user_proxy", () => {
  const r = dispatchBrief("BLACKPINK 限定快闪");
  const fandomVotes = r.votes.filter(v => v.layer === "audience" || v.layer === "fandom");
  console.log(`     audience votes=${fandomVotes.length}`);
  if (fandomVotes.length < 1) throw new Error("应至少 1 个 audience 投票");
  if (!fandomVotes.every(v => v.perspective === "user_proxy")) throw new Error("audience 必须 user_proxy");
});

import { loadStage, listStages, loadLineage, listLineages } from "./dispatch.mjs";

test("F · BLACKPINK + TWICE → rivalry 触发", () => {
  const c = summonCouncil("BLACKPINK 和 TWICE 联名快闪");
  console.log(`     rivalry pairs=${(c.rivalry_check.pairs||[]).length}`);
  if (!c.rivalry_check.has_rivalry) throw new Error("BLACKPINK + TWICE 应触发 rivalry");
  const pair = c.rivalry_check.pairs[0];
  if (!pair.narrative) throw new Error("rivalry pair 应含 narrative");
});

test("F · 单团 brief 不触发 rivalry", () => {
  const c = summonCouncil("TWICE 风格 hero");
  if (c.rivalry_check.has_rivalry) throw new Error("单团不应触发 rivalry");
});

test("F · dispatchBrief 含 rivalry_check 输出", () => {
  const r = dispatchBrief("aespa × IVE 联名");
  console.log(`     rivalry in summary=${r.council_summary.rivalry}`);
  if (!r.council_summary.rivalry) throw new Error("aespa+IVE 应在 summary 标 rivalry=true");
});

test("E · stages 列表 5 个", () => {
  const stages = listStages();
  console.log(`     stages=${stages.join(",")}`);
  if (stages.length !== 5) throw new Error(`expected 5 stages, got ${stages.length}`);
  for (const s of ["debut", "comeback", "concert", "collab", "landing"]) {
    if (!stages.includes(s)) throw new Error(`missing stage: ${s}`);
  }
});

test("E · loadStage(comeback) 返回 sample_brief", () => {
  const s = loadStage("comeback");
  if (!s) throw new Error("comeback stage not found");
  if (!s.sample_brief) throw new Error("comeback stage missing sample_brief");
});

test("D · lineages 列表 5 条", () => {
  const ls = listLineages();
  console.log(`     lineages=${ls.join(",")}`);
  if (ls.length !== 6) throw new Error(`expected 6 lineages, got ${ls.length}`);
});

test("D · loadLineage(main_vocal) 返回 soul", () => {
  const l = loadLineage("main_vocal");
  if (!l) throw new Error("main_vocal lineage not found");
  if (!l.soul) throw new Error("lineage missing soul");
});
console.log(`\n=== ${pass} passed · ${fail} failed ===\n`);
if (fail > 0) process.exit(1);
