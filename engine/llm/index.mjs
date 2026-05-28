// engine/llm/index.mjs
// Provider router with deterministic stub fallback.

import * as deepseek from "./deepseek.mjs";
import * as claude from "./claude.mjs";
import * as gemini from "./gemini.mjs";
import * as stub from "./stub.mjs";

const providers = { deepseek, claude, gemini, stub };

function normalize(name) {
  return String(name || process.env.KPOP_LLM_PROVIDER || "deepseek").toLowerCase();
}

export function getLLMProvider(name) {
  const selected = providers[normalize(name)];
  return selected || providers.deepseek;
}

export function isLLMAvailable() {
  return [deepseek, claude, gemini].some(provider => provider.isAvailable());
}

export async function callLLM({ provider, system = "", user = "", max_tokens = 600 } = {}) {
  const selected = typeof provider === "object" ? provider : getLLMProvider(provider);
  const target = selected.isAvailable?.() ? selected : stub;
  try {
    return await target.call({ system, user, max_tokens });
  } catch (error) {
    if (target === stub) throw error;
    return stub.call({ system, user, max_tokens });
  }
}

export function resolvedProviderName(name) {
  const selected = getLLMProvider(name);
  return selected.isAvailable?.() ? selected.name : stub.name;
}

export { providers };
