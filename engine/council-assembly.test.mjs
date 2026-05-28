import { test } from "node:test";
import assert from "node:assert";
import { assembleCouncil, determineDRI } from "./council-assembly.mjs";

test("basic expansion starts from group DRI and invites sister groups", () => {
  const council = assembleCouncil("IVE comeback landing");
  assert.equal(determineDRI("IVE comeback").slug, "ive");
  assert(council.members.some(m => m.slug === "ive"));
  assert(council.invitation_chain.some(i => i.from === "ive" && i.to !== "ive"));
});

test("default council enforces 5-member cap", () => {
  const council = assembleCouncil("IVE comeback landing");
  assert(council.members.length <= 5);
  assert.equal(council.max_members, 5);
});

test("cross-generation or cross-agency brief upgrades cap to 7", () => {
  const council = assembleCouncil("IVE aespa TWICE cross-gen HYBE SM YG agency comeback");
  assert.equal(council.max_members, 7);
  assert(council.members.length <= 7);
});

test("council with four or more members keeps at least two idols and two groups", () => {
  const council = assembleCouncil("IVE comeback landing");
  const groups = council.members.filter(m => m.type === "group").length;
  const idols = council.members.filter(m => m.type === "idol").length;
  assert(council.members.length >= 4);
  assert(groups >= 2, `groups=${groups}`);
  assert(idols >= 2, `idols=${idols}`);
});

test("cycle defense prevents duplicate members during BFS", () => {
  const council = assembleCouncil("IVE aespa rivalry council");
  const keys = council.members.map(m => `${m.type}:${m.slug}`);
  assert.equal(new Set(keys).size, keys.length);
});
