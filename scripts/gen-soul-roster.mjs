// scripts/gen-soul-roster.mjs
// Generate docs/IDOL-SOULS.md — a one-line SOUL summary for every roster member.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadIdols } from "../engine/council-assembly.mjs";
import { derivePersona, buildGroupsMap, groupForMember } from "../engine/voice-persona.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const idols = loadIdols().sort((a, b) => a.slug.localeCompare(b.slug));
const groupsMap = buildGroupsMap();

function mdEscape(s) {
  return String(s || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function deriveSoul(idol, persona) {
  const group = groupForMember({ ...idol, type: "idol" }, groupsMap);
  const core = group?.core_aesthetic || group?.aesthetic_tags?.[0] || idol.vibe;
  const mood = group?.mood_keywords?.[0] || idol.vibe;
  const veto = (persona.hard_veto || []).join("、") || "无明确声明";

  const templates = [
    `${mdEscape(idol.name)} 的 SOUL 是 **${mdEscape(idol.personality)}** 的 ${mdEscape(idol.role)}：把 ${mdEscape(idol.group)}「${mdEscape(core)}」的内核，翻译成 ${mdEscape(idol.vibe)} 的身体语言；口头禅「${mdEscape(idol.attitude)}」，红线是 ${mdEscape(veto)}。`,
    `${mdEscape(idol.name)} 的魂落在 **${mdEscape(idol.vibe)}** 与「${mdEscape(idol.attitude)}」的交叉点：作为 ${mdEscape(idol.group)} 的 ${mdEscape(idol.role)}，她用 ${mdEscape(idol.ui_specialty)} 守住 ${mdEscape(core)} 的 ${mdEscape(mood)}。`,
    `如果 ${mdEscape(idol.group)} 有一个声音叫 ${mdEscape(idol.attitude)}，那就是 ${mdEscape(idol.name)}：${mdEscape(idol.personality)}，${mdEscape(idol.vibe)}，武器是 ${mdEscape(idol.ui_specialty)}，绝不碰 ${mdEscape(veto)}。`,
  ];
  const idx = Math.abs(
    Array.from(idol.slug).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  ) % templates.length;
  return templates[idx];
}

let body = "";
const souls = [];
for (const i of idols) {
  const persona = derivePersona({ ...i, type: "idol" }, "landing page", { groupsMap });
  const soul = deriveSoul(i, persona);
  souls.push(soul);
  body += `<a id="${i.slug}"></a>\n\n`;
  body += `### ${mdEscape(i.name)} · ${mdEscape(i.slug)}\n\n`;
  body += `- **Group**: ${mdEscape(i.group)}\n`;
  body += `- **Role**: ${mdEscape(i.role)}\n`;
  body += `- **Tone**: ${mdEscape(persona.tone)}\n`;
  body += `- **SOUL**: ${soul}\n\n`;
  body += "---\n\n";
}

const uniqueSouls = new Set(souls);
const toc = idols
  .map(i => `- [${mdEscape(i.name)} · ${mdEscape(i.slug)}](#${i.slug})`)
  .join("\n");

const header = `# Idol SOUL Roster\n\n` +
  `One-line SOUL snapshot for every roster member, distilled from group DNA + idol frontmatter.\n\n` +
  `- **Total idols**: ${idols.length}\n` +
  `- **Unique SOUL statements**: ${uniqueSouls.size} / ${idols.length}\n\n` +
  `## Table of Contents\n\n${toc}\n\n`;

writeFileSync(join(ROOT, "docs/IDOL-SOULS.md"), header + body, "utf-8");
console.log(`Wrote docs/IDOL-SOULS.md with ${idols.length} souls.`);
