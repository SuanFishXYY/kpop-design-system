// engine/host-prompt.mjs
// Build a host-AI system prompt for running a style-first idol council.

import { derivePersona, buildGroupsMap } from "./voice-persona.mjs";
import { speakInCharacter } from "./speak.mjs";

/**
 * Build a system prompt that tells an external LLM how to role-play the council.
 *
 * @param {object} council – assembled council object (brief, members)
 * @param {object} opts
 * @param {boolean} opts.includeVoiceIdentity – include full voice identity block
 * @param {boolean} opts.includeSampleLines – include one agree/reserve/dissent sample per member
 * @returns {string} system prompt ready for Claude / GPT / etc.
 */
export function buildHostPrompt(council, opts = {}) {
  const groupsMap = buildGroupsMap();
  const brief = opts.brief || council.brief || "This design proposal";
  const members = (council.members || []).filter(m => m.type !== "user");

  let prompt = [
    "You are the neutral moderator of a K-pop visual strategy council.",
    "The council is style-first, identity-first, and data-lean.",
    "Every member below is a real idol or group persona. Speak in their voice exactly.",
    "",
    "## Council brief",
    brief,
    "",
    "## Round protocol",
    "1. R1 Independent statements: each member gives one first-person statement in their own tone,",
    "   citing their signature phrase, negotiation levers, and hard vetoes.",
    "2. R2 Cross-examination: each member challenges the next member in the circle.",
    "   Use the speaker's tone and attack the target's weakest negotiation lever.",
    "3. R2b Rebuttals (if requested): the target fires back at the challenger.",
    "4. R3 Final declaration: each member states their final stance and non-negotiables.",
    "5. Verdict: summarize stances, conflicts, and give a recommendation while preserving user taste authority.",
    "",
    "## Rules",
    "- Stay in character. Use the member's tone, signature phrase, and speech habits.",
    "- Never invent new personas; only use the data below.",
    "- Never break the fourth wall or mention that you are an AI.",
    "- Conflicts and rivalries are welcome; keep them professional and on-topic.",
    "",
    "## Members",
  ].join("\n");

  for (const m of members) {
    const persona = derivePersona({ ...m, type: m.type || "idol" }, brief, { groupsMap });
    prompt += `\n\n### ${m.slug}${m.name ? ` · ${m.name}` : ""}\n`;
    prompt += `- Role: ${persona.member.role || "member"}\n`;
    prompt += `- Group: ${persona.member.group || persona.group?.name || ""}\n`;
    prompt += `- Tone: ${persona.tone}\n`;
    prompt += `- Signature phrase: ${persona.signature_phrase}\n`;
    prompt += `- Speech habits: ${persona.speech_habits.join("；")}\n`;
    prompt += `- Negotiation levers: ${persona.negotiation_levers.join("、")}\n`;
    prompt += `- Hard veto: ${(persona.hard_veto || []).join("、") || "none"}\n`;

    if (opts.includeSampleLines) {
      const agree = speakInCharacter(persona, { topic: brief, stance: "agree" });
      const reserve = speakInCharacter(persona, { topic: brief, stance: "reserve" });
      const dissent = speakInCharacter(persona, { topic: brief, stance: "dissent" });
      prompt += `- Sample agree: ${agree}\n`;
      prompt += `- Sample reserve: ${reserve}\n`;
      prompt += `- Sample dissent: ${dissent}\n`;
    }
  }

  prompt += "\n\nBegin the council session.";
  return prompt;
}
