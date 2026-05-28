// engine/llm/stub.mjs
// Deterministic no-network LLM substitute for tests and offline demos.

function find(pattern, text, fallback = "") {
  return String(text || "").match(pattern)?.[1]?.trim() || fallback;
}

export const name = "stub";

export function isAvailable() {
  return true;
}

export async function call({ system = "", user = "" } = {}) {
  const text = `${system}\n${user}`;
  const member = find(/member[:=]\s*([^\n]+)/i, text, "council-member");
  const brief = find(/brief[:=]\s*([^\n]+)/i, text, "the brief");
  const from = find(/from[:=]\s*([^\n]+)/i, text, member);
  const to = find(/to[:=]\s*([^\n]+)/i, text, "peer");

  if (/\bR2\b|cross[- ]?question|question/i.test(text)) {
    return `${from} questions ${to}: are you sure about the constraint tradeoff for ${brief}?`;
  }
  if (/\bR3\b|final stance|merged declaration/i.test(text)) {
    return `${member} final stance: agree — preserve identity while documenting compromise for ${brief}.`;
  }
  return `I am ${member}, my stance on ${brief} is to protect the core visual identity while keeping the proposal usable.`;
}
