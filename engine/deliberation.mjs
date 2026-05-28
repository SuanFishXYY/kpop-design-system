// engine/deliberation.mjs
// v3.4.3 · Host-AI mode (zero-config).
// 
// Output structure is a SCRIPT for the host AI (Claude/Copilot/Cursor/etc) to execute.
// stub text in R1/R2/R3 is a TEMPLATE; the host AI naturally replaces it when running
// the skill protocol. No external LLM API is called from this module — by design.
//
// JS engine handles: council assembly · vote math · verdict formatting (deterministic).
// Host AI handles: member voice deliberation · cross-examination · stance synthesis.
import { synthesizeVoice } from "./voice-synthesis.mjs";

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

export function orchestrateDeliberation(council, brief) {
  const R1 = runR1IndependentStatements(council, brief);
  const R2 = runR2CrossExamination(council, R1);
  const R3 = runR3MergedDeclaration(council, R2);
  return deliberationResult(R1, R2, R3, "stub");
}

export { TOKEN_CAP, ROUND_LIMITS };
