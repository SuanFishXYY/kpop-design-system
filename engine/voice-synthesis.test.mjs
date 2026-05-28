import { test } from "node:test";
import assert from "node:assert";
import { loadVoiceTemplate, synthesizeVoice, checkVetoTriggers } from "./voice-synthesis.mjs";

test("voice template loads from group frontmatter", () => {
  const voice = loadVoiceTemplate("ive");
  assert(voice);
  assert.equal(Array.isArray(voice.veto_triggers), true);
  assert(voice.identity.includes("IVE"));
});

test("veto trigger fires on exact hard keyword", () => {
  const voice = loadVoiceTemplate("ive");
  const result = checkVetoTriggers("ive", `proposal uses ${voice.veto_triggers[0]} heavily`);
  assert.equal(result.triggered, true);
  assert.deepEqual(result.triggered_keywords, [voice.veto_triggers[0]]);
});

test("proposal without trigger passes", () => {
  const prompt = synthesizeVoice("ive", { trait: "prestige", brief: "clean premium comeback" });
  assert(prompt.includes("IVE"));
  const result = checkVetoTriggers("ive", "clean premium comeback with restrained prestige");
  assert.equal(result.triggered, false);
});
