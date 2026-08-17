// engine/speak.test.mjs

import { test } from "node:test";
import assert from "node:assert";
import { speakInCharacter, speakReply } from "./speak.mjs";
import { derivePersona } from "./voice-persona.mjs";
import { loadIdols } from "./council-assembly.mjs";

const karina = loadIdols().find(i => i.slug === "aespa-karina");
const wonyoung = loadIdols().find(i => i.slug === "ive-wonyoung");
const nayeon = loadIdols().find(i => i.slug === "twice-nayeon");
const minji = loadIdols().find(i => i.slug === "nj-minji");
const sunmi = loadIdols().find(i => i.slug === "sunmi");
const soyeon = loadIdols().find(i => i.slug === "idle-soyeon");

[karina, wonyoung, nayeon, minji, sunmi, soyeon].forEach(i => assert.ok(i, "test fixture missing"));

test("speakInCharacter returns a first-person line for an idol", () => {
  const p = derivePersona({ ...karina, type: "idol" }, "futuristic dashboard", { tension: 1 });
  const line = speakInCharacter(p, { topic: "futuristic dashboard", stance: "agree" });
  assert.ok(line.includes("aespa"));
  assert.ok(line.includes("connect with æ"));
  assert.ok(line.length > 20);
});

test("agree/reserve/dissent produce different sentiments", () => {
  const p = derivePersona({ ...wonyoung, type: "idol" }, "princess landing page", { tension: 1 });
  const agree = speakInCharacter(p, { stance: "agree" });
  const reserve = speakInCharacter(p, { stance: "reserve" });
  const dissent = speakInCharacter(p, { stance: "dissent" });
  assert.ok(agree.includes("支持") || agree.includes("赞同") || agree.includes("赞成"));
  assert.ok(reserve.includes("保留") || reserve.includes("前提"));
  assert.ok(dissent.includes("反对") || dissent.includes("不能接受"));
});

test("different tones produce recognizably different lines", () => {
  const personas = [
    derivePersona({ ...karina, type: "idol" }, "landing page", { tension: 1 }),
    derivePersona({ ...nayeon, type: "idol" }, "landing page", { tension: 1 }),
    derivePersona({ ...sunmi, type: "idol" }, "landing page", { tension: 1 }),
    derivePersona({ ...minji, type: "idol" }, "landing page", { tension: 1 }),
    derivePersona({ ...soyeon, type: "idol" }, "landing page", { tension: 1 }),
  ];
  const lines = personas.map(p => speakInCharacter(p, { stance: "agree" }));
  const unique = new Set(lines);
  assert.equal(unique.size, lines.length, "generated lines should be distinct");
});

test("speakReply addresses the target member by name", () => {
  const karinaP = derivePersona({ ...karina, type: "idol" }, "landing page", { tension: 1 });
  const wonyoungP = derivePersona({ ...wonyoung, type: "idol" }, "landing page", { tension: 1 });
  const reply = speakReply(karinaP, wonyoungP, { topic: "landing page" });
  assert.ok(reply.includes("Wonyoung"));
  assert.ok(reply.includes("aespa"));
});

test("deterministic: same inputs produce same output", () => {
  const p = derivePersona({ ...minji, type: "idol" }, "landing page", { tension: 1 });
  const a = speakInCharacter(p, { topic: "landing page", stance: "reserve" });
  const b = speakInCharacter(p, { topic: "landing page", stance: "reserve" });
  assert.equal(a, b);
});

test("public stance aliases map correctly", () => {
  const p = derivePersona({ ...wonyoung, type: "idol" }, "princess landing page", { tension: 1 });
  const against = speakInCharacter(p, { stance: "against" });
  const question = speakInCharacter(p, { stance: "question" });
  const veto = speakInCharacter(p, { stance: "veto" });
  assert.ok(against.includes("反对") || against.includes("不能接受"));
  assert.ok(question.includes("保留") || question.includes("前提"));
  assert.ok(veto.includes("否决") || veto.includes("不能通过"));
});
