// scripts/gen-council-transcript.mjs
// Generate docs/EXAMPLE-COUNCIL-TRANSCRIPT.md — a readable full-council session.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assembleCouncil, loadIdols } from "../engine/council-assembly.mjs";
import { orchestrateDeliberation } from "../engine/deliberation.mjs";
import { buildHostPrompt } from "../engine/host-prompt.mjs";
import { derivePersona, buildGroupsMap } from "../engine/voice-persona.mjs";
import { classifyClauses, tallyVote, produceVerdictDocument } from "../engine/verdict.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const BRIEF = "Y2K-meets-futuristic girl group comeback landing page with a memorable visual hook";
const SIZE = 7;
const INCLUDE_REBUTTALS = true;
const INCLUDE_HOST_PROMPT = true;

const FORCE_SLUGS = ["aespa-karina", "ive-wonyoung", "nj-hanni", "twice-nayeon", "2ne1-cl", "idle-soyeon", "sunmi"];
const allIdols = loadIdols();
const forced = FORCE_SLUGS.map(slug => allIdols.find(i => i.slug === slug)).filter(Boolean);
const baseCouncil = assembleCouncil(BRIEF, { size: SIZE });
const baseMembers = baseCouncil.members.filter(m => !forced.some(f => f.slug === m.slug));
const council = {
  ...baseCouncil,
  members: [...forced, ...baseMembers].slice(0, SIZE),
};
const deliberation = orchestrateDeliberation(council, BRIEF, { rebuttals: INCLUDE_REBUTTALS });
const groupsMap = buildGroupsMap();

function deriveStanceVote(stance) {
  if (stance === "agree" || stance === "compromise") return "for";
  if (stance === "dissent") return "against";
  return "abstain";
}

const councilWithVotes = {
  ...council,
  members: council.members.map(m => {
    const r3 = deliberation.rounds.R3[m.slug];
    return { ...m, vote_decision: deriveStanceVote(r3?.stance || "reserve") };
  }),
};

const classified = classifyClauses(deliberation.rounds.R3);
const tally = tallyVote(councilWithVotes, classified, null, false, false);

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

function linesToMd(list) {
  return list.length ? list.map(l => `- ${l}`).join("\n") : "_none_";
}

let md = `# Example K-pop Council Transcript\n\n`;
md += `- **Brief**: ${BRIEF}\n`;
md += `- **Generated**: ${new Date().toISOString()}\n`;
md += `- **Mode**: ${deliberation.mode}\n`;
md += `- **Roster**: ${council.members.map(m => m.slug).join(", ")}\n`;
md += `- **Token budget**: ${deliberation.token_tracking.total_tokens} / ${deliberation.token_tracking.cap} tokens\n\n`;

md += section("Roster & Tones", council.members.map(m => {
  const persona = derivePersona({ ...m, type: m.type || "idol" }, BRIEF, { groupsMap });
  return `- **${m.slug}**${m.name ? ` (${m.name})` : ""} — ${persona.tone}`;
}).join("\n"));

md += section("R1 — Independent Statements", Object.entries(deliberation.rounds.R1)
  .filter(([k]) => !k.startsWith("_"))
  .map(([_, row]) => `- ${row.statement}`).join("\n"));

md += section("R2 — Cross-examination", Object.entries(deliberation.rounds.R2)
  .filter(([k]) => !k.startsWith("_"))
  .map(([_, row]) => `**${row.from} → ${row.to}**\n\n- prompt: ${row.question}\n- reply: ${row.reply}`).join("\n\n"));

if (INCLUDE_REBUTTALS && deliberation.rounds.R2b) {
  md += section("R2b — Counter-rebuttals", Object.entries(deliberation.rounds.R2b)
    .filter(([k]) => !k.startsWith("_"))
    .map(([_, row]) => `- ${row.counter}`).join("\n"));
}

md += section("R3 — Final Declarations", Object.entries(deliberation.rounds.R3)
  .filter(([k]) => !k.startsWith("_"))
  .map(([_, row]) => `- **${row.member}** (${row.stance}): ${row.declaration}`).join("\n"));

md += section("Clause Classification", [
  "### Consensus", linesToMd(classified.consensus.map(c => c.clause)),
  "### Compromise", linesToMd(classified.compromise.map(c => c.clause)),
  "### Dissent", linesToMd(classified.dissent.map(c => c.clause)),
].join("\n\n"));

md += section("Verdict", produceVerdictDocument(councilWithVotes, BRIEF, classified, tally).split("\n").slice(1).join("\n"));

if (INCLUDE_HOST_PROMPT) {
  const hostPrompt = buildHostPrompt(council, { brief: BRIEF, includeSampleLines: false });
  md += section("Appendix: Host-AI System Prompt", ["```", hostPrompt, "```"].join("\n"));
}

const outPath = join(ROOT, "docs/EXAMPLE-COUNCIL-TRANSCRIPT.md");
writeFileSync(outPath, md, "utf-8");
console.log(`Wrote ${outPath} (${deliberation.token_tracking.total_tokens} tokens, ${council.members.length} members).`);
