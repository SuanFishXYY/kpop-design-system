// engine/deliberation.mjs
// v3.4.0 · R1/R2/R3 Mixed Council deliberation with optional LLM providers.

import { synthesizeVoice } from "./voice-synthesis.mjs";
import { callLLM, getLLMProvider, isLLMAvailable, resolvedProviderName } from "./llm/index.mjs";

const TOKEN_CAP = 4550;
const ROUND_LIMITS = { R1: 200, R2: 300, R3: 150 };

function membersOf(council) { return Array.isArray(council) ? council : (council?.members || []); }
function roughTokens(text) { return Math.ceil(String(text || "").length / 4); }
function trimToTokens(text, max) { return String(text || "").split(/\s+/).slice(0, max).join(" "); }
function specialty(member) { return member.specialty || member.core_aesthetic || member.era || member.type || "design"; }

function voiceFor(member, brief) {
  if (member.type === "group") {
    try { return synthesizeVoice(member.slug, { trait: specialty(member), brief }); }
    catch { return `${member.name || member.slug} anchors ${specialty(member)}.`; }
  }
  if (member.type === "idol") return `${member.name || member.slug} is an idol specialist for ${specialty(member)}.`;
  return "User seat keeps final taste authority and can veto or override.";
}

function statementFor(member, brief) {
  if (member.type === "user") return `User seat: keep final taste authority for ${brief}.`;
  if (member.type === "group") {
    const voice = voiceFor(member, brief).split("\n").slice(0, 2).join(" ");
    return `${member.slug}: ${voice} Proposal must preserve ${specialty(member)} and avoid dilution.`;
  }
  return `${member.slug}: as idol specialist for ${specialty(member)}, I recommend a precise visual system for ${brief}.`;
}

export function runR1IndependentStatements(council, brief) {
  const out = {};
  let tokens = 0;
  for (const member of membersOf(council)) {
    const text = trimToTokens(statementFor(member, brief), ROUND_LIMITS.R1);
    out[member.slug] = { member: member.slug, round: "R1", statement: text, approx_tokens: roughTokens(text) };
    tokens += out[member.slug].approx_tokens;
  }
  out._meta = { round: "R1", approx_tokens: tokens, mode: "stub" };
  return out;
}

export function runR2CrossExamination(council, R1_output) {
  const members = membersOf(council).filter(m => m.type !== "user");
  const out = {};
  let tokens = 0;
  for (let i = 0; i < members.length; i++) {
    const a = members[i];
    const b = members[(i + 1) % members.length];
    if (!b || a.slug === b.slug) continue;
    const key = `${a.slug}->${b.slug}`;
    const question = trimToTokens(`${a.slug} asks ${b.slug}: which constraint from your R1 stance is non-negotiable, and where can it bend without losing identity?`, ROUND_LIMITS.R2);
    out[key] = { from: a.slug, to: b.slug, question, references: [R1_output[a.slug]?.statement, R1_output[b.slug]?.statement].filter(Boolean), approx_tokens: roughTokens(question) };
    tokens += out[key].approx_tokens;
  }
  out._meta = { round: "R2", approx_tokens: tokens, mode: "stub" };
  return out;
}

function detectConflictFromText(text) {
  return /\b(vs|rival|counterpoint|conflict|tension|veto|against|oppose)\b/i.test(String(text || ""));
}

export function runR3MergedDeclaration(council, R2_output) {
  const out = {};
  let tokens = 0;
  const joined = Object.values(R2_output || {}).map(v => v.question || "").join("\n");
  const conflict = detectConflictFromText(joined);
  for (const member of membersOf(council)) {
    const stance = member.type === "user" ? "reserve" : (conflict ? "compromise" : "agree");
    const declaration = trimToTokens(`${member.slug}: ${stance}; preserve identity, document tradeoffs, and leave final user taste authority intact.`, ROUND_LIMITS.R3);
    out[member.slug] = { member: member.slug, round: "R3", stance, declaration, conflict_flag: conflict, approx_tokens: roughTokens(declaration) };
    tokens += out[member.slug].approx_tokens;
  }
  out._meta = { round: "R3", approx_tokens: tokens, conflict_flag: conflict, mode: "stub" };
  return out;
}

function deliberationResult(R1, R2, R3, mode) {
  const total_tokens = (R1._meta?.approx_tokens || 0) + (R2._meta?.approx_tokens || 0) + (R3._meta?.approx_tokens || 0);
  return {
    rounds: { R1, R2, R3 },
    token_tracking: { total_tokens, cap: TOKEN_CAP, within_cap: total_tokens <= TOKEN_CAP, per_round: { R1: R1._meta.approx_tokens, R2: R2._meta.approx_tokens, R3: R3._meta.approx_tokens } },
    conflict_flag: Boolean(R3._meta.conflict_flag),
    allowed_rounds: ["R1", "R2", "R3"],
    mode,
  };
}

function promptFor(round, member, brief, extra = {}) {
  return {
    system: [
      "You are a K-pop visual strategy council member. Stay concise, concrete, and brand-safe.",
      `Round: ${round}`,
      `Member: ${member.slug}`,
      `Specialty: ${specialty(member)}`,
      `Voice template:\n${voiceFor(member, brief)}`,
    ].join("\n"),
    user: [
      `brief: ${brief}`,
      `member: ${member.slug}`,
      extra.from ? `from: ${extra.from}` : "",
      extra.to ? `to: ${extra.to}` : "",
      extra.context ? `context: ${extra.context}` : "",
      round === "R1" ? "Write the member's independent stance." : "",
      round === "R2" ? "Write one cross-question that tests a non-negotiable constraint." : "",
      round === "R3" ? "Write final stance as agree, compromise, or dissent with one reason." : "",
    ].filter(Boolean).join("\n"),
  };
}

async function runR1LLM(council, brief, provider) {
  const out = {};
  let tokens = 0;
  for (const member of membersOf(council)) {
    const prompt = promptFor("R1", member, brief);
    const text = trimToTokens(await callLLM({ provider, ...prompt, max_tokens: ROUND_LIMITS.R1 }), ROUND_LIMITS.R1);
    out[member.slug] = { member: member.slug, round: "R1", statement: text, approx_tokens: roughTokens(text) };
    tokens += out[member.slug].approx_tokens;
  }
  out._meta = { round: "R1", approx_tokens: tokens };
  return out;
}

async function runR2LLM(council, brief, R1_output, provider) {
  const members = membersOf(council).filter(m => m.type !== "user");
  const out = {};
  let tokens = 0;
  for (let i = 0; i < members.length; i++) {
    const a = members[i];
    const b = members[(i + 1) % members.length];
    if (!b || a.slug === b.slug) continue;
    const key = `${a.slug}->${b.slug}`;
    const prompt = promptFor("R2", a, brief, { from: a.slug, to: b.slug, context: `${R1_output[a.slug]?.statement || ""}\n${R1_output[b.slug]?.statement || ""}` });
    const question = trimToTokens(await callLLM({ provider, ...prompt, max_tokens: ROUND_LIMITS.R2 }), ROUND_LIMITS.R2);
    out[key] = { from: a.slug, to: b.slug, question, references: [R1_output[a.slug]?.statement, R1_output[b.slug]?.statement].filter(Boolean), approx_tokens: roughTokens(question) };
    tokens += out[key].approx_tokens;
  }
  out._meta = { round: "R2", approx_tokens: tokens };
  return out;
}

async function runR3LLM(council, brief, R2_output, provider) {
  const out = {};
  let tokens = 0;
  const joined = Object.values(R2_output || {}).map(v => v.question || "").join("\n");
  const conflict = detectConflictFromText(joined);
  for (const member of membersOf(council)) {
    const prompt = promptFor("R3", member, brief, { context: joined });
    const declaration = trimToTokens(await callLLM({ provider, ...prompt, max_tokens: ROUND_LIMITS.R3 }), ROUND_LIMITS.R3);
    const detected = declaration.match(/\b(agree|compromise|dissent)\b/i)?.[1]?.toLowerCase();
    const stance = member.type === "user" ? "reserve" : (detected || (conflict ? "compromise" : "agree"));
    out[member.slug] = { member: member.slug, round: "R3", stance, declaration, conflict_flag: conflict, approx_tokens: roughTokens(declaration) };
    tokens += out[member.slug].approx_tokens;
  }
  out._meta = { round: "R3", approx_tokens: tokens, conflict_flag: conflict };
  return out;
}

async function orchestrateWithLLM(council, brief, options) {
  const provider = getLLMProvider(options.provider);
  const resolved = resolvedProviderName(options.provider);
  if (resolved === "stub" || !isLLMAvailable()) {
    const R1 = runR1IndependentStatements(council, brief);
    const R2 = runR2CrossExamination(council, R1);
    const R3 = runR3MergedDeclaration(council, R2);
    return deliberationResult(R1, R2, R3, "stub");
  }
  const mode = `llm:${resolved}`;
  const R1 = await runR1LLM(council, brief, provider);
  const R2 = await runR2LLM(council, brief, R1, provider);
  const R3 = await runR3LLM(council, brief, R2, provider);
  R1._meta.mode = mode;
  R2._meta.mode = mode;
  R3._meta.mode = mode;
  return deliberationResult(R1, R2, R3, mode);
}

export function orchestrateDeliberation(council, brief, options = {}) {
  if (options?.useLLM) return orchestrateWithLLM(council, brief, options);
  const R1 = runR1IndependentStatements(council, brief);
  const R2 = runR2CrossExamination(council, R1);
  const R3 = runR3MergedDeclaration(council, R2);
  return deliberationResult(R1, R2, R3, "stub");
}

export { TOKEN_CAP, ROUND_LIMITS };
