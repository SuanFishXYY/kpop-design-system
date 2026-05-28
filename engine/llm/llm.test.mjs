import { test } from "node:test";
import assert from "node:assert";
import { assembleCouncil } from "../council-assembly.mjs";
import { orchestrateDeliberation } from "../deliberation.mjs";
import { callLLM, getLLMProvider, isLLMAvailable, resolvedProviderName } from "./index.mjs";

const ENV_KEYS = ["KPOP_LLM_PROVIDER", "KPOP_LLM_API_KEY", "DEEPSEEK_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"];

function withEnv(values, fn) {
  const old = Object.fromEntries(ENV_KEYS.map(key => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, values);
  try { return fn(); }
  finally {
    for (const key of ENV_KEYS) {
      if (old[key] === undefined) delete process.env[key];
      else process.env[key] = old[key];
    }
  }
}

test("provider routing honors explicit name and default", () => withEnv({}, () => {
  assert.equal(getLLMProvider("claude").name, "claude");
  assert.equal(getLLMProvider().name, "deepseek");
}));

test("stub fallback when selected provider has no key", async () => withEnv({ KPOP_LLM_PROVIDER: "deepseek" }, async () => {
  const text = await callLLM({ system: "Round: R1", user: "member: ive\nbrief: IVE comeback" });
  assert.match(text, /I am ive/);
  assert.equal(resolvedProviderName(), "stub");
}));

test("isLLMAvailable detects configured API key", () => withEnv({ GEMINI_API_KEY: "test-key" }, () => {
  assert.equal(isLLMAvailable(), true);
  assert.equal(resolvedProviderName("gemini"), "gemini");
}));

test("multi-provider env override routes without network", () => withEnv({ KPOP_LLM_PROVIDER: "stub", ANTHROPIC_API_KEY: "test-key" }, () => {
  assert.equal(getLLMProvider().name, "stub");
  assert.equal(getLLMProvider("gemini").name, "gemini");
}));

test("deliberation tracks stub mode when LLM unavailable", async () => withEnv({ KPOP_LLM_PROVIDER: "deepseek" }, async () => {
  const council = assembleCouncil("IVE comeback landing");
  const result = await orchestrateDeliberation(council, "IVE comeback landing", { useLLM: true });
  assert.equal(result.mode, "stub");
  assert.equal(result.rounds.R1._meta.mode, "stub");
}));
