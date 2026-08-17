// engine/host-prompt.test.mjs

import { test } from "node:test";
import assert from "node:assert";
import { assembleCouncil } from "./council-assembly.mjs";
import { buildHostPrompt } from "./host-prompt.mjs";

test("buildHostPrompt includes brief, protocol, and all members", () => {
  const brief = "red velvet summer comeback landing page";
  const council = assembleCouncil(brief);
  const prompt = buildHostPrompt(council, { brief });
  assert.ok(prompt.includes(brief));
  assert.ok(prompt.includes("R1 Independent statements"));
  assert.ok(prompt.includes("R2 Cross-examination"));
  for (const m of council.members) {
    assert.ok(prompt.includes(m.slug), `prompt should mention ${m.slug}`);
  }
});

test("buildHostPrompt with sample lines includes agree/reserve/d dissent per member", () => {
  const brief = "minimalist girl group branding";
  const council = assembleCouncil(brief, { size: 3 });
  const prompt = buildHostPrompt(council, { brief, includeSampleLines: true });
  for (const m of council.members) {
    assert.ok(prompt.includes(`### ${m.slug}`));
  }
  assert.ok(prompt.includes("Sample agree:"));
  assert.ok(prompt.includes("Sample reserve:"));
  assert.ok(prompt.includes("Sample dissent:"));
});

test("buildHostPrompt stays in reasonable size without samples", () => {
  const brief = "y2k futuristic concept";
  const council = assembleCouncil(brief, { size: 5 });
  const prompt = buildHostPrompt(council, { brief });
  assert.ok(prompt.length < 20000, `prompt length ${prompt.length} too large`);
});
