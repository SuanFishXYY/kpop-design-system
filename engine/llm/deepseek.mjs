// engine/llm/deepseek.mjs
// DeepSeek OpenAI-compatible chat provider.

export const name = "deepseek";

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

function apiKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.KPOP_LLM_API_KEY || "";
}

export function isAvailable() {
  return Boolean(apiKey());
}

export async function call({ system = "", user = "", max_tokens = 600 } = {}) {
  const key = apiKey();
  if (!key) throw new Error("DeepSeek API key missing");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens,
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}
