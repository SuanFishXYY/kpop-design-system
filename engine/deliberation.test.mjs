import { test } from "node:test";
import assert from "node:assert";
import { assembleCouncil } from "./council-assembly.mjs";
import { runR1IndependentStatements, runR2CrossExamination, runR2bRebuttals, runR3MergedDeclaration, orchestrateDeliberation } from "./deliberation.mjs";

const council = assembleCouncil("IVE comeback landing");

test("R1 produces statement per member", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  for (const member of council.members) assert(r1[member.slug]?.statement);
});

test("R2 produces cross-questions", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  const r2 = runR2CrossExamination(council, r1);
  assert(Object.keys(r2).some(k => k.includes("->")));
});

test("R3 produces final stances", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  const r2 = runR2CrossExamination(council, r1);
  const r3 = runR3MergedDeclaration(council, r2);
  for (const member of council.members) assert(r3[member.slug]?.stance);
});

test("conflict_flag detection", () => {
  const vetoCouncil = {
    brief: "landing with neon overload palette",
    members: [
      { type: "idol", slug: "veto-idol", name: "Veto Idol", group: "test-group", role: "main vocal", voice: { veto_triggers: ["neon overload"] } },
    ],
  };
  const r3 = runR3MergedDeclaration(vetoCouncil, {});
  assert.equal(r3._meta.conflict_flag, true);
});

test("R1 includes stance and tension per member", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  for (const member of council.members) {
    assert.ok(["agree", "reserve", "dissent"].includes(r1[member.slug]?.stance));
    assert.equal(typeof r1[member.slug]?.tension, "number");
  }
});

test("R2 questions adapt to dissent and reserve stances", () => {
  const r1 = runR1IndependentStatements(council, "IVE vs aespa battle");
  const dissenters = Object.values(r1).filter(v => v?.stance === "dissent");
  const r2 = runR2CrossExamination(council, r1);
  for (const d of dissenters) {
    const related = Object.values(r2).filter(q => q.to === d.member);
    assert.ok(related.some(q => /smallest change|flip you to support|oppose/i.test(q.question)), `no challenge for dissenter ${d.member}`);
  }
});

test("R2 produces in-character replies between members", () => {
  const r1 = runR1IndependentStatements(council, "IVE vs aespa battle");
  const r2 = runR2CrossExamination(council, r1);
  const pairs = Object.values(r2).filter(v => v?.from && v?.to);
  assert.ok(pairs.length > 0, "R2 should have member pairs");
  for (const p of pairs) {
    assert.ok(p.reply, `R2 reply missing for ${p.from}->${p.to}`);
    assert.ok(p.reply.includes(`${p.from} -> ${p.to}:`), `reply should label speaker and target`);
    assert.ok(p.speaker_tone, `R2 speaker tone missing for ${p.from}`);
    assert.ok(Array.isArray(p.target_lever), `R2 target lever missing for ${p.to}`);
  }
});

test("R2 replies are unique per directed pair", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  const r2 = runR2CrossExamination(council, r1);
  const replies = Object.values(r2)
    .filter(v => v?.from && v?.to)
    .map(v => v.reply);
  assert.equal(new Set(replies).size, replies.length, "each directed pair should have a distinct reply");
});

test("R3 exposes aggregate stance map and tension", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  const r2 = runR2CrossExamination(council, r1);
  const r3 = runR3MergedDeclaration(council, r2);
  assert.equal(typeof r3._meta.aggregate_tension, "number");
  assert.equal(Object.values(r3._meta.stance_map).reduce((a, b) => a + b, 0), council.members.length);
});

test("R1 and R3 include per-member persona", () => {
  const r1 = runR1IndependentStatements(council, "IVE comeback landing");
  const r2 = runR2CrossExamination(council, r1);
  const r3 = runR3MergedDeclaration(council, r2);
  for (const member of council.members) {
    assert.ok(r1[member.slug]?.persona?.tone, `R1 missing persona tone for ${member.slug}`);
    assert.ok(r3[member.slug]?.persona?.signature_phrase, `R3 missing persona phrase for ${member.slug}`);
  }
});

test("orchestrator allows only R1/R2/R3 and no R4", () => {
  const result = orchestrateDeliberation(council, "IVE comeback landing");
  assert.deepEqual(result.allowed_rounds, ["R1", "R2", "R3"]);
  assert.equal(result.rounds.R4, undefined);
  assert.equal(result.token_tracking.within_cap, true);
});

test("runR2bRebuttals generates counter-replies for every directed pair", () => {
  const r1 = runR1IndependentStatements(council, "IVE vs aespa battle");
  const r2 = runR2CrossExamination(council, r1);
  const r2b = runR2bRebuttals(council, r2);
  const counters = Object.values(r2b).filter(v => v?.from && v?.to);
  assert.ok(counters.length > 0, "R2b should have counter-replies");
  for (const c of counters) {
    assert.ok(c.counter, `R2b counter missing for ${c.from}->${c.to}`);
    assert.ok(c.counter.includes(`${c.from} -> ${c.to}:`), `counter should label speaker and target`);
    assert.ok(c.speaker_tone, `R2b speaker tone missing for ${c.from}`);
  }
});

test("orchestrator with rebuttals exposes R2b and updates allowed_rounds", () => {
  const result = orchestrateDeliberation(council, "IVE comeback landing", { rebuttals: true });
  assert.deepEqual(result.allowed_rounds, ["R1", "R2", "R2b", "R3"]);
  assert.ok(result.rounds.R2b, "R2b round should exist");
  assert.ok(result.token_tracking.total_tokens > (result.rounds.R1._meta.approx_tokens + result.rounds.R2._meta.approx_tokens + result.rounds.R3._meta.approx_tokens), "total tokens should include R2b");
});

test("orchestrator returns host-ai-script mode", () => {
  const result = orchestrateDeliberation(council, "IVE comeback landing");
  assert.equal(result.mode, "host-ai-script");
});

test("R3 stance is dissent when a veto trigger appears in the brief", () => {
  const vetoCouncil = {
    brief: "landing with neon overload palette",
    members: [
      { type: "idol", slug: "veto-idol", name: "Veto Idol", group: "test-group", role: "main vocal", voice: { veto_triggers: ["neon overload"] } },
    ],
  };
  const r3 = runR3MergedDeclaration(vetoCouncil, {});
  assert.equal(r3["veto-idol"].stance, "dissent");
});

test("rival groups with counterpoint_axis produce compromise declarations", () => {
  const rivalCouncil = {
    members: [
      { type: "group", slug: "ive", name: "IVE", rivals: ["aespa"], counterpoint_axis: "Princess prestige vs futurism" },
      { type: "group", slug: "aespa", name: "aespa", rivals: ["ive"], counterpoint_axis: "Princess prestige vs futurism" },
    ],
  };
  const r3 = runR3MergedDeclaration(rivalCouncil, {});
  const stances = Object.values(r3).filter(v => v?.stance);
  assert.ok(stances.some(row => row.stance === "compromise"), "expected at least one compromise stance");
  const compromiseRows = stances.filter(row => row.stance === "compromise");
  assert.ok(
    compromiseRows.some(row => row.declaration.includes("Princess prestige vs futurism")),
    "expected declaration to include counterpoint axis text"
  );
});
