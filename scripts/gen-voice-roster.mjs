// scripts/gen-voice-roster.mjs
// Generate docs/IDOL-VOICES.md — a per-idol voice persona reference.

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadIdols } from "../engine/council-assembly.mjs";
import { derivePersona, buildGroupsMap } from "../engine/voice-persona.mjs";
import { speakInCharacter } from "../engine/speak.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOPIC = "future-facing girl-group comeback landing page";

const idols = loadIdols().sort((a, b) => a.slug.localeCompare(b.slug));
const groupsMap = buildGroupsMap();

const fallbackTones = ["专业、冷静、以设计证据说话", "理性、结构化、爱用比喻"];
let fallbackCount = 0;
const linesSet = new Set();

function mdEscape(s) {
  return String(s || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

let body = "";
for (const i of idols) {
  const persona = derivePersona({ ...i, type: "idol" }, TOPIC, { groupsMap });
  const agree = speakInCharacter(persona, { topic: TOPIC, stance: "agree" });
  const reserve = speakInCharacter(persona, { topic: TOPIC, stance: "reserve" });
  const dissent = speakInCharacter(persona, { topic: TOPIC, stance: "dissent" });
  linesSet.add(agree);
  if (fallbackTones.includes(persona.tone)) fallbackCount++;

  body += `<a id="${i.slug}"></a>\n\n`;
  body += `### ${mdEscape(i.name)} (${mdEscape(i.slug)})\n\n`;
  body += `- **Group**: ${mdEscape(i.group)}\n`;
  body += `- **Role**: ${mdEscape(i.role)}\n`;
  body += `- **Era**: ${mdEscape(i.era)}\n`;
  body += `- **Personality**: ${mdEscape(i.personality)}\n`;
  body += `- **Vibe**: ${mdEscape(i.vibe)}\n`;
  body += `- **Attitude**: ${mdEscape(i.attitude)}\n`;
  body += `- **UI Specialty**: ${mdEscape(i.ui_specialty)}\n`;
  body += `- **Tone**: ${mdEscape(persona.tone)}\n`;
  body += `- **Signature Phrase**: ${mdEscape(persona.signature_phrase)}\n`;
  body += `- **Speech Habits**: ${persona.speech_habits.map(h => mdEscape(h)).join("；")}\n`;
  body += `- **Hard Veto**: ${(persona.hard_veto || []).map(v => mdEscape(v)).join("、") || "—"}\n\n`;
  body += `**Agree**: ${mdEscape(agree)}\n\n`;
  body += `**Reserve**: ${mdEscape(reserve)}\n\n`;
  body += `**Dissent**: ${mdEscape(dissent)}\n\n`;
  body += "---\n\n";
}

const toc = idols
  .map(i => `- [${mdEscape(i.name)} (${mdEscape(i.group)})](#${i.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-")})`)
  .join("\n");

const header = `# Idol Voice Roster\n\n` +
  `Auto-generated reference for every roster member's deterministic speaking persona.\n\n` +
  `- **Total idols**: ${idols.length}\n` +
  `- **Unique in-character lines** (agree stance): ${linesSet.size} / ${idols.length}\n` +
  `- **Generic fallback tones**: ${fallbackCount}\n` +
  `- **Topic used for samples**: “${TOPIC}”\n\n` +
  `Each persona is derived from the idol's own frontmatter (personality / vibe / attitude / ui_specialty / role) plus their group's voice DNA (core_aesthetic, mood_keywords, aesthetic_tags, fusion_rules, rivals, counterpoint_axis).\n\n` +
  `## Table of Contents\n\n${toc}\n\n`;

writeFileSync(join(ROOT, "docs/IDOL-VOICES.md"), header + body, "utf-8");
console.log(`Wrote docs/IDOL-VOICES.md with ${idols.length} idols.`);
