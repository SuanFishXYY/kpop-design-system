import { test } from "node:test";
import assert from "node:assert";
import { assembleCouncil } from "./council-assembly.mjs";
import { runR1IndependentStatements, runR2CrossExamination, runR3MergedDeclaration, orchestrateDeliberation } from "./deliberation.mjs";

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
  const r3 = runR3MergedDeclaration(council, { "ive->aespa": { question: "princess vs cyber tension requires compromise" } });
  assert.equal(r3._meta.conflict_flag, true);
});

test("orchestrator allows only R1/R2/R3 and no R4", () => {
  const result = orchestrateDeliberation(council, "IVE comeback landing");
  assert.deepEqual(result.allowed_rounds, ["R1", "R2", "R3"]);
  assert.equal(result.rounds.R4, undefined);
  assert.equal(result.token_tracking.within_cap, true);
});
