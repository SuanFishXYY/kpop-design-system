// engine/llm/claude.mjs
// Anthropic Messages provider.

export const name = "claude";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

function apiKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.KPOP_LLM_API_KEY || "";
}

export function isAvailable() {
  return Boolean(apiKey());
}

export async function call({ system = "", user = "", max_tokens = 600 } = {}) {
  const key = apiKey();
  if (!key) throw new Error("Anthropic API key missing");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      system,
      max_tokens,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return (data?.content || []).map(part => part?.text || "").join("\n").trim();
}
