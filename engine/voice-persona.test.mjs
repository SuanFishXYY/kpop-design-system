// engine/voice-persona.test.mjs

import { test } from "node:test";
import assert from "node:assert";
import { derivePersona } from "./voice-persona.mjs";
import { loadIdols } from "./council-assembly.mjs";
import { loadGroups } from "./relations.mjs";

const karina = loadIdols().find(i => i.slug === "aespa-karina");
const aespa = loadGroups().find(g => g.slug === "aespa");

assert(karina, "test fixture missing: aespa-karina");
assert(aespa, "test fixture missing: aespa group");

test("derivePersona returns structured speaking guide for an idol", () => {
  const persona = derivePersona(karina, "futuristic dashboard", { tension: 2 });
  assert.equal(persona.member.slug, "aespa-karina");
  assert.ok(persona.tone);
  assert.ok(persona.speech_habits.length > 0);
  assert.equal(persona.conflict_posture, "defend");
  assert.ok(persona.negotiation_levers.length > 0);
  assert.ok(persona.signature_phrase);
  assert.ok(persona.hard_veto.length > 0);
  assert.ok(persona.brief_match);
});

test("derivePersona returns guide for a group", () => {
  const persona = derivePersona({ ...aespa, type: "group" }, "cyber landing page", { tension: 4, rivalsPresent: true });
  assert.equal(persona.member.type, "group");
  assert.equal(persona.conflict_posture, "attack");
  assert.ok(persona.signature_phrase.includes("aespa"));
  assert.ok(persona.negotiation_levers.length > 0, "group should have concrete negotiation levers");
  assert.ok(persona.speech_habits.length > 0, "group should have speech habits");
  assert.notEqual(persona.tone, "专业、冷静、以设计证据说话", "group should map to a non-default tone");
});

test("every group gets concrete levers and a non-default tone", () => {
  const defaultTone = "专业、冷静、以设计证据说话";
  for (const g of loadGroups().filter(g => g.slug)) {
    const persona = derivePersona({ ...g, type: "group" }, "landing page", { tension: 1 });
    assert.ok(persona.negotiation_levers.length > 0, `${g.slug} has no levers`);
    assert.ok(persona.speech_habits.length > 0, `${g.slug} has no speech habits`);
    assert.notEqual(persona.tone, defaultTone, `${g.slug} fell back to default tone`);
  }
});

test("higher tension flips posture to attack", () => {
  const calm = derivePersona(karina, "futuristic dashboard", { tension: 0 });
  const hot = derivePersona(karina, "futuristic dashboard", { tension: 3 });
  assert.equal(calm.conflict_posture, "collaborate");
  assert.equal(hot.conflict_posture, "attack");
});

test("rivalsPresent forces attack posture even at low tension", () => {
  const persona = derivePersona(karina, "soft pastel landing", { tension: 0, rivalsPresent: true });
  assert.equal(persona.conflict_posture, "attack");
});

test("every idol gets a non-default tone", () => {
  const defaultTone = "专业、冷静、以设计证据说话";
  const defaults = loadIdols().filter(i => derivePersona({ ...i, type: "idol" }, "landing page").tone === defaultTone);
  assert.equal(defaults.length, 0, `idols with default tone: ${defaults.slice(0, 5).map(i => i.slug).join(", ")}`);
});

test("signature phrase includes attitude hook for idols", () => {
  const persona = derivePersona(karina, "futuristic dashboard", { tension: 1 });
  assert.ok(persona.signature_phrase.includes("connect with æ"));
});

test("distinct tones exist across representative idols", () => {
  const slugs = ["aespa-karina", "ive-wonyoung", "twice-nayeon", "nj-minji", "sunmi", "idle-soyeon"];
  const tones = new Set(slugs.map(s => {
    const i = loadIdols().find(x => x.slug === s);
    assert.ok(i, `missing fixture ${s}`);
    return derivePersona({ ...i, type: "idol" }, "landing page").tone;
  }));
  assert.ok(tones.size >= 5, `expected diverse tones, got ${Array.from(tones).join(", ")}`);
});
