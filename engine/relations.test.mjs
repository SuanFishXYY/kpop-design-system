import { test } from "node:test";
import assert from "node:assert";
import { getSameGeneration, getSameAgency, getSameAesthetic, getAestheticCounterpoint, getAllSisterGroups } from "./relations.mjs";

test("getSameGeneration derives from era field", () => {
  const peers = getSameGeneration("ive").map(r => r.target);
  assert(peers.includes("aespa"));
});

test("getSameAgency derives from agency field", () => {
  const peers = getSameAgency("twice").map(r => r.target);
  assert(peers.includes("itzy"));
});

test("getSameAesthetic derives from aesthetic_tags overlap", () => {
  const peers = getSameAesthetic("aespa").map(r => r.target);
  assert(peers.includes("bp"));
});

test("getAestheticCounterpoint derives from rivals + axis", () => {
  const cps = getAestheticCounterpoint("ive");
  assert.equal(cps[0].target, "aespa");
  assert.match(cps[0].evidence, /vs/);
});

test("getAllSisterGroups aggregates relation types", () => {
  const all = getAllSisterGroups("ive");
  const aespa = all.find(r => r.target === "aespa");
  assert(aespa);
  assert(aespa.relation_types.includes("same_generation"));
  assert(aespa.relation_types.includes("aesthetic_counterpoint"));
});
