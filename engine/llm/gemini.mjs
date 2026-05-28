// engine/llm/gemini.mjs
// Google GenerativeLanguage provider.

export const name = "gemini";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.KPOP_LLM_API_KEY || "";
}

function apiUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey())}`;
}

export function isAvailable() {
  return Boolean(apiKey());
}

export async function call({ system = "", user = "", max_tokens = 600 } = {}) {
  if (!apiKey()) throw new Error("Gemini API key missing");
  const response = await fetch(apiUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: max_tokens },
    }),
  });
  if (!response.ok) throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("\n").trim() || "";
}
