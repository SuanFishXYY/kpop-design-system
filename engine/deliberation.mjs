// engine/deliberation.mjs
// v3.6.1 · In-character R1/R2/R2b/R3 deliberation (zero-config).
// 
// Output structure is a SCRIPT for the host AI (Claude/Copilot/Cursor/etc) to execute.
// stub text in R1/R2/R3 is a TEMPLATE; the host AI naturally replaces it when running
// the skill protocol. No external LLM API is called from this module — by design.
//
// JS engine handles: council assembly · vote math · verdict formatting (deterministic).
// Host AI handles: member voice deliberation · cross-examination · stance synthesis.
import { synthesizeVoice } from "./voice-synthesis.mjs";
import { classifyBriefSpecialties, classifyIdolSpecialty } from "./specialty.mjs";
import { loadGroups } from "./relations.mjs";
import { derivePersona } from "./voice-persona.mjs";
import { speakInCharacter, speakReply } from "./speak.mjs";

const TOKEN_CAP = 4550;
const ROUND_LIMITS = { R1: 200, R2: 300, R3: 150 };

function membersOf(council) { return Array.isArray(council) ? council : (council?.members || []); }
function roughTokens(text) { return Math.ceil(String(text || "").length / 4); }
function trimToTokens(text, max) { return String(text || "").split(/\s+/).slice(0, max).join(" "); }
function specialty(member) { return member.specialty || member.core_aesthetic || member.era || member.type || "design"; }

function normalized(str) { return String(str || "").toLowerCase(); }
function buildGroupsMap() {
  return new Map(loadGroups().map(g => [normalized(g.name), g]));
}

function memberGroup(member, groupsMap) {
  if (member.type === "group") return member;
  return groupsMap?.get(normalized(member.group));
}

function briefWantsConflict(brief) {
  return /\b(vs|rival|battle|conflict|tension|对抗|冲突|对决|宿敌)\b/i.test(String(brief || ""));
}

function hasRivalPresent(member, council, groupsMap) {
  if (member.type === "user") return false;
  const memberGroupObj = memberGroup(member, groupsMap);
  const memberGroupSlug = member.type === "group" ? member.slug : memberGroupObj?.slug;
  const rivals = new Set([
    ...(member.rivals || []),
    ...(member.personal_conflict || []),
    ...(memberGroupObj?.rivals || []),
  ].map(normalized));
  for (const other of council.members) {
    if (other === member || other.type === "user") continue;
    if (rivals.has(normalized(other.slug))) return true;
    const otherGroup = memberGroup(other, groupsMap);
    if (rivals.has(normalized(otherGroup?.slug))) return true;
  }
  return false;
}

function computeTension(member, council, brief, groupsMap) {
  if (member.type === "user") return 0;
  let tension = 0;

  // Specialty mismatch: member doesn't cover any design dimension the brief asks for.
  const briefSpecs = classifyBriefSpecialties(brief);
  if (briefSpecs.length && briefSpecs[0] !== "general") {
    const specs = classifyIdolSpecialty(member);
    const matches = specs.filter(s => briefSpecs.includes(s)).length;
    if (matches === 0) tension += 1;
  }

  // Conflicts with other council members.
  for (const other of council.members) {
    if (other === member || other.type === "user") continue;
    if (member.type === "group" && other.type === "group") {
      if ((member.rivals || []).includes(other.slug)) tension += 3;
      if ((other.rivals || []).includes(member.slug)) tension += 3;
    } else if (member.type === "idol" && other.type === "idol") {
      const a = new Set([...(member.rivals || []), ...(member.personal_conflict || [])]);
      const b = new Set([...(other.rivals || []), ...(other.personal_conflict || [])]);
      if (a.has(other.slug) || b.has(member.slug)) tension += 3;
    } else {
      const mg = memberGroup(member, groupsMap);
      const og = memberGroup(other, groupsMap);
      if (mg && og) {
        if ((mg.rivals || []).includes(og.slug) || (og.rivals || []).includes(mg.slug)) tension += 3;
      }
    }
  }

  // Brief explicitly asks for conflict → everyone gets a little hotter.
  if (briefWantsConflict(brief)) tension += 1;

  return tension;
}

function stanceFor(tension, memberType) {
  if (memberType === "user") return "reserve";
  if (tension >= 3) return "dissent";
  if (tension >= 1) return "reserve";
  return "agree";
}

function voiceFor(member, brief) {
  if (member.type === "group") {
    try { return synthesizeVoice(member.slug, { trait: specialty(member), brief }); }
    catch { return `${member.name || member.slug} anchors ${specialty(member)}.`; }
  }
  if (member.type === "idol") return `${member.name || member.slug} is an idol specialist for ${specialty(member)}.`;
  return "User seat keeps final taste authority and can veto or override.";
}

function statementFor(member, brief, stance, persona) {
  if (member.type === "user") return `User seat: keep final taste authority for ${brief}.`;
  const topic = brief || "这个方案";
  const line = speakInCharacter(persona, { topic, stance });
  return `${member.slug}: ${line}`;
}

function briefHitsVeto(brief, vetos) {
  const haystack = normalized(brief);
  return (vetos || []).some(v => haystack.includes(normalized(v)));
}

function resolveR3Stance(member, brief, r1Stance, persona, council, groupsMap) {
  if (member.type === "user") return "reserve";
  if (persona.hard_veto?.length && briefHitsVeto(brief, persona.hard_veto)) return "dissent";
  const group = memberGroup(member, groupsMap);
  if (hasRivalPresent(member, council, groupsMap) && group?.counterpoint_axis) return "compromise";
  if (r1Stance === "dissent" && briefWantsConflict(brief)) return "dissent";
  if (r1Stance === "reserve") return "reserve";
  return "agree";
}

function compromiseDeclaration(member, brief, persona, council, groupsMap) {
  const group = memberGroup(member, groupsMap);
  if (hasRivalPresent(member, council, groupsMap) && group?.counterpoint_axis) {
    const axis = String(group.counterpoint_axis);
    const [memberAnchor = "our identity", rivalAnchor = "the counterpoint"] = axis.split(/\s+vs\s+/i);
    const text = `I can accept "${brief || "这个方案"}" only if "${axis}" stays anchored on ${memberAnchor.trim()}; I will trade the ${rivalAnchor.trim()} layer down to accent.`;
    return trimToTokens(`${member.slug}: ${text}`, ROUND_LIMITS.R3);
  }
  if (persona.negotiation_levers?.length) {
    const lever = persona.negotiation_levers[0];
    const text = `I accept if ${lever} is locked and the opposing risk is capped.`;
    return trimToTokens(`${member.slug}: ${text}`, ROUND_LIMITS.R3);
  }
  const fallback = speakInCharacter(persona, { topic: brief || "这个方案", stance: "compromise" });
  return trimToTokens(`${member.slug}: ${fallback}`, ROUND_LIMITS.R3);
}

export function runR1IndependentStatements(council, brief) {
  const groupsMap = buildGroupsMap();
  const out = {};
  let tokens = 0;
  for (const member of membersOf(council)) {
    const tension = computeTension(member, council, brief, groupsMap);
    const stance = stanceFor(tension, member.type);
    const rivalsPresent = hasRivalPresent(member, council, groupsMap);
    const persona = derivePersona(member, brief, { tension, rivalsPresent, groupsMap });
    const text = trimToTokens(statementFor(member, brief, stance, persona), ROUND_LIMITS.R1);
    out[member.slug] = { member: member.slug, round: "R1", statement: text, stance, tension, persona, approx_tokens: roughTokens(text) };
    tokens += out[member.slug].approx_tokens;
  }
  out._meta = { round: "R1", approx_tokens: tokens, mode: "host-ai-script" };
  return out;
}

export function runR2CrossExamination(council, R1_output, brief = council?.brief || "") {
  const members = membersOf(council).filter(m => m.type !== "user");
  const groupsMap = buildGroupsMap();
  const out = {};
  let tokens = 0;
  for (let i = 0; i < members.length; i++) {
    const a = members[i];
    const b = members[(i + 1) % members.length];
    if (!b || a.slug === b.slug) continue;
    const key = `${a.slug}->${b.slug}`;
    const bStance = R1_output[b.slug]?.stance || "agree";
    const aStance = R1_output[a.slug]?.stance || "agree";
    let question;
    if (bStance === "dissent") {
      question = `${a.slug} challenges ${b.slug}: your R1 dissent flags identity risk; what is the smallest change that would flip you to support?`;
    } else if (bStance === "reserve") {
      question = `${a.slug} presses ${b.slug}: you reserved judgment; which constraint must be locked for you to vote for?`;
    } else if (aStance === "dissent") {
      question = `${a.slug} asks ${b.slug}: I oppose this direction; what tradeoff would you refuse to make?`;
    } else {
      question = `${a.slug} asks ${b.slug}: which constraint from your R1 stance is non-negotiable, and where can it bend without losing identity?`;
    }

    const aTension = computeTension(a, council, brief, groupsMap);
    const bTension = computeTension(b, council, brief, groupsMap);
    const aRivals = hasRivalPresent(a, council, groupsMap);
    const bRivals = hasRivalPresent(b, council, groupsMap);
    const speakerPersona = derivePersona(a, brief, { tension: aTension, rivalsPresent: aRivals, groupsMap });
    const targetPersona = derivePersona(b, brief, { tension: bTension, rivalsPresent: bRivals, groupsMap });
    const replyText = speakReply(speakerPersona, targetPersona, { topic: brief || "这个方案" });
    const reply = trimToTokens(`${a.slug} -> ${b.slug}: ${replyText}`, ROUND_LIMITS.R2);

    question = trimToTokens(question, ROUND_LIMITS.R2);
    out[key] = {
      from: a.slug,
      to: b.slug,
      question,
      reply,
      speaker_tone: speakerPersona.tone,
      target_lever: targetPersona.negotiation_levers,
      references: [R1_output[a.slug]?.statement, R1_output[b.slug]?.statement].filter(Boolean),
      approx_tokens: roughTokens(question) + roughTokens(reply),
    };
    tokens += out[key].approx_tokens;
  }
  out._meta = { round: "R2", approx_tokens: tokens, mode: "host-ai-script" };
  return out;
}

function detectConflictFromText(text) {
  return /\b(vs|rival|counterpoint|conflict|tension|veto|against|oppose)\b/i.test(String(text || ""));
}

export function runR3MergedDeclaration(council, R2_output, brief = council?.brief || "") {
  const groupsMap = buildGroupsMap();
  const out = {};
  let tokens = 0;
  const stanceMap = { agree: 0, reserve: 0, dissent: 0, compromise: 0 };
  let aggregateTension = 0;
  let hasConflict = false;
  for (const member of membersOf(council)) {
    const tension = member.type === "user" ? 0 : computeTension(member, council, brief, groupsMap);
    const r1Stance = member.type === "user" ? "reserve" : stanceFor(tension, member.type);
    const rivalsPresent = hasRivalPresent(member, council, groupsMap);
    const persona = derivePersona(member, brief, { tension, rivalsPresent, groupsMap });
    const vetoHit = member.type !== "user" && briefHitsVeto(brief, persona.hard_veto);
    if (rivalsPresent || vetoHit) hasConflict = true;
    const stance = resolveR3Stance(member, brief, r1Stance, persona, council, groupsMap);
    stanceMap[stance] = (stanceMap[stance] || 0) + 1;
    aggregateTension += tension;
    const declaration = stance === "compromise"
      ? compromiseDeclaration(member, brief, persona, council, groupsMap)
      : trimToTokens(`${member.slug}: ${speakInCharacter(persona, { topic: brief || "这个方案", stance })}`, ROUND_LIMITS.R3);
    out[member.slug] = { member: member.slug, round: "R3", stance, tension, persona, declaration, conflict_flag: hasConflict, approx_tokens: roughTokens(declaration) };
    tokens += out[member.slug].approx_tokens;
  }
  out._meta = { round: "R3", approx_tokens: tokens, conflict_flag: hasConflict, stance_map: stanceMap, aggregate_tension: aggregateTension, mode: "host-ai-script" };
  return out;
}

export function runR2bRebuttals(council, R2_output) {
  const members = membersOf(council).filter(m => m.type !== "user");
  const groupsMap = buildGroupsMap();
  const brief = council.brief || "";
  const out = {};
  let tokens = 0;
  for (const [key, row] of Object.entries(R2_output || {}).filter(([k]) => !k.startsWith("_"))) {
    if (!row?.from || !row?.to || row.from === row.to) continue;
    const speaker = members.find(m => m.slug === row.to);
    const target = members.find(m => m.slug === row.from);
    if (!speaker || !target) continue;
    const speakerTension = computeTension(speaker, council, brief, groupsMap);
    const targetTension = computeTension(target, council, brief, groupsMap);
    const speakerRivals = hasRivalPresent(speaker, council, groupsMap);
    const targetRivals = hasRivalPresent(target, council, groupsMap);
    const speakerPersona = derivePersona(speaker, brief, { tension: speakerTension, rivalsPresent: speakerRivals, groupsMap });
    const targetPersona = derivePersona(target, brief, { tension: targetTension, rivalsPresent: targetRivals, groupsMap });
    const counterText = speakReply(speakerPersona, targetPersona, { topic: brief || "这个方案", seed: hashString(`${row.reply}|counter`) });
    const counter = trimToTokens(`${speaker.slug} -> ${target.slug}: ${counterText}`, ROUND_LIMITS.R2);
    const counterKey = `${speaker.slug}->${target.slug}`;
    out[counterKey] = {
      from: speaker.slug,
      to: target.slug,
      counter,
      speaker_tone: speakerPersona.tone,
      target_lever: targetPersona.negotiation_levers,
      replying_to: key,
      approx_tokens: roughTokens(counter),
    };
    tokens += out[counterKey].approx_tokens;
  }
  out._meta = { round: "R2b", approx_tokens: tokens, mode: "host-ai-script" };
  return out;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function deliberationResult(R1, R2, R3, mode, R2b) {
  const total_tokens = (R1._meta?.approx_tokens || 0) + (R2._meta?.approx_tokens || 0) + (R3._meta?.approx_tokens || 0) + (R2b?._meta?.approx_tokens || 0);
  const rounds = { R1, R2, R3 };
  const per_round = { R1: R1._meta.approx_tokens, R2: R2._meta.approx_tokens, R3: R3._meta.approx_tokens };
  if (R2b) {
    rounds.R2b = R2b;
    per_round.R2b = R2b._meta.approx_tokens;
  }
  return {
    rounds,
    token_tracking: { total_tokens, cap: TOKEN_CAP, within_cap: total_tokens <= TOKEN_CAP, per_round },
    conflict_flag: Boolean(R3._meta.conflict_flag),
    allowed_rounds: R2b ? ["R1", "R2", "R2b", "R3"] : ["R1", "R2", "R3"],
    mode,
  };
}

export function orchestrateDeliberation(council, brief, opts = {}) {
  const mode = opts.mode || "host-ai-script";
  const R1 = runR1IndependentStatements(council, brief);
  const R2 = runR2CrossExamination(council, R1, brief);
  const R2b = opts.rebuttals ? runR2bRebuttals(council, R2) : undefined;
  const R3 = runR3MergedDeclaration(council, R2, brief);
  return deliberationResult(R1, R2, R3, mode, R2b);
}

export { TOKEN_CAP, ROUND_LIMITS };
