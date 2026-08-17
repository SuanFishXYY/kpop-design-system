#!/usr/bin/env node
// bin/council.mjs
// v3.7.0 - Canonical Mixed Council room for standalone / embedding usage.

import readline from "node:readline";
import { parseArgs } from "node:util";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { assembleCouncil, applyUserOverrides, explainCouncil, resolveMemberSlug, deriveCouncilId, loadIdols } from "../engine/council-assembly.mjs";
import { loadGroups } from "../engine/relations.mjs";
import { synthesizeVoice } from "../engine/voice-synthesis.mjs";
import { orchestrateDeliberation } from "../engine/deliberation.mjs";
import { classifyClauses, tallyVote, produceVerdictDocument } from "../engine/verdict.mjs";
import { tallyWithUser, castUserVote } from "../engine/user-jury.mjs";
import { loadUserPrefs, saveUserPrefs, recordOverride, recordFavorite } from "../engine/user-prefs.mjs";
import { getReviewers } from "../engine/reviewers.mjs";
import { synthesizeDesignBrief } from "../engine/synthesize.mjs";
import { buildHostPrompt } from "../engine/host-prompt.mjs";
import { derivePersona } from "../engine/voice-persona.mjs";

const { values } = parseArgs({
  options: {
    brief: { type: "string" },
    "brief-file": { type: "string" },
    "council-size": { type: "string" },
    "strict-size": { type: "boolean" },
    review: { type: "boolean" },
    auto: { type: "boolean" },
    explain: { type: "boolean", short: "e" },
    add: { type: "string" },
    veto: { type: "string" },
    "output-dir": { type: "string" },
    json: { type: "boolean" },
    "list-idols": { type: "boolean" },
    "list-groups": { type: "boolean" },
    "no-save": { type: "boolean" },
    "design-brief": { type: "boolean" },
    "host-prompt": { type: "boolean" },
    rebuttals: { type: "boolean" },
    transcript: { type: "boolean" },
    version: { type: "boolean", short: "v" },
    help: { type: "boolean", short: "h" },
  },
  strict: false,
});

const reviewMode = values.review;
const helpMode = values.help;
const versionMode = values.version;
let briefFromFile = "";
if (values["brief-file"]) {
  try {
    briefFromFile = readFileSync(values["brief-file"].replace(/^"|"$/g, ""), "utf8").trim();
  } catch (err) {
    console.error(`❌ cannot read brief file: ${err.message}`);
    process.exit(1);
  }
}
const brief = values.brief?.replace(/^"|"$/g, "") || briefFromFile;
const requestedSize = Number(values["council-size"] || 0);
const jsonMode = values.json;
const listIdolsMode = values["list-idols"];
const listGroupsMode = values["list-groups"];
const noSave = values["no-save"];
const designBriefMode = values["design-brief"];
const hostPromptMode = values["host-prompt"];
const rebuttalsMode = values.rebuttals;
const transcriptMode = values.transcript;
const explainMode = values.explain;
const addSlugs = values.add ? values.add.split(",").map(s => s.trim()).filter(Boolean) : [];
const vetoSlugs = values.veto ? values.veto.split(",").map(s => s.trim()).filter(Boolean) : [];
const outputDir = values["output-dir"]?.replace(/^"|"$/g, "") || "";
const autoMode = values.auto || !process.stdin.isTTY || !process.stdout.isTTY || jsonMode || listIdolsMode || listGroupsMode || designBriefMode || hostPromptMode || rebuttalsMode || transcriptMode;
const strictSize = values["strict-size"] || false;

function printHelp() {
  console.log(`Usage: node bin/council.mjs --brief="aespa next era visualization" [options]

Options:
  --brief-file=PATH      read brief text from a file
  --council-size=5|7     cap council size
  --strict-size          --add/--veto cannot push council beyond the cap
  --review               run review mode instead of council mode
  --auto                 non-interactive mode
  --explain, -e          show why each member was selected
  --add=name1,name2      force-add idol/group by slug or stage/group name
  --veto=name1,name2     remove idol/group by slug or stage/group name
  --output-dir=PATH      directory for verdict/transcript files (created if missing)
  --no-save              do not write verdict/review transcript files
  --json                 emit machine-readable JSON to stdout
  --design-brief         generate a full design brief instead of a council verdict
  --host-prompt          emit a host-AI system prompt for the assembled council and exit
  --rebuttals            run R2b counter-replies after R2 cross-examination
  --transcript           write a full markdown transcript (R1/R2/R2b/R3/verdict/host prompt)
  --list-idols           print all idol slugs/names and exit
  --list-groups          print all group slugs/names and exit
  --version, -v          print version
  --help, -h             show this help

This CLI is for standalone / embedding usage. The primary mode is loading this skill into Claude/Copilot/Cursor where the host AI runs the deliberation natively.`);
}

if (versionMode) {
  console.log("kpop-council v3.7.0");
  process.exit(0);
}

if (helpMode) {
  printHelp();
  process.exit(0);
}

for (const token of addSlugs) {
  if (!resolveMemberSlug(token)) console.warn(`⚠️  --add token not resolved: ${token}`);
}
for (const token of vetoSlugs) {
  if (!resolveMemberSlug(token)) console.warn(`⚠️  --veto token not resolved: ${token}`);
}

if (listIdolsMode || listGroupsMode) {
  const idols = listIdolsMode ? loadIdols().map(i => ({ slug: i.slug, name: i.name, group: i.group })) : null;
  const groups = listGroupsMode ? loadGroups().map(g => ({ slug: g.slug, name: g.name, era: g.era })) : null;

  if (jsonMode) {
    const payload = {};
    if (idols) payload.idols = idols;
    if (groups) payload.groups = groups;
    console.log(JSON.stringify(payload, null, 2));
  } else {
    if (idols) for (const i of idols) console.log(`${i.slug}\t${i.name}\t${i.group}`);
    if (groups) for (const g of groups) console.log(`${g.slug}\t${g.name}\t${g.era || ""}`);
  }
  process.exit(0);
}

if (!brief) {
  printHelp();
  process.exit(1);
}

if (designBriefMode) {
  runDesignBriefMode();
  process.exit(0);
}

if (hostPromptMode) {
  runHostPromptMode();
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question, fallback = "") {
  if (autoMode) return Promise.resolve(fallback);
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim().toLowerCase())));
}
function print(line = "") { if (!jsonMode) console.log(line); }

function writeOutput(fileName, content) {
  const targetDir = outputDir || ".";
  mkdirSync(targetDir, { recursive: true });
  const targetPath = join(targetDir, fileName);
  writeFileSync(targetPath, content, "utf8");
  return targetPath;
}

function applyCouncilSize(council, size) {
  const requested = Number(size);
  const hasValidRequest = Number.isInteger(requested) && requested >= 2;
  const targetSize = hasValidRequest ? requested : (council.max_members || 5);
  const user = council.members.find(member => member.type === "user") || { type: "user", slug: "user", name: "User", vote: 1 };
  const nonUser = council.members.filter(member => member.type !== "user").slice(0, Math.max(1, targetSize - 1));
  return { ...council, members: [...nonUser, user], max_members: targetSize };
}

function voiceIdentity(member, briefText) {
  if (member.type === "group") {
    const trait = member.aesthetic_tags?.[0] || member.era || "identity";
    try { return synthesizeVoice(member.slug, { trait, brief: briefText }).split("\n")[0]; }
    catch { return `${member.name || member.slug}: group anchor identity`; }
  }
  if (member.type === "idol") return `${member.name || member.slug}: idol specialist for ${member.specialty || "visual strategy"}`;
  return "User: final taste authority with veto/override";
}

async function continuePrompt(nextRound) {
  const answer = await ask(`press [enter] to continue to ${nextRound}, [s] to skip to vote, [q] to quit: `, "");
  if (answer === "q") return "quit";
  if (answer === "s") return "vote";
  return "continue";
}

function printR1(R1) {
  print("\n=== R1 · Independent statements ===");
  for (const [key, row] of Object.entries(R1).filter(([key]) => !key.startsWith("_"))) print(`- ${key}: ${row.statement}`);
}
function printR2(R2) {
  print("\n=== R2 · Cross-examination ===");
  for (const [key, row] of Object.entries(R2).filter(([key]) => !key.startsWith("_"))) {
    print(`- ${key}`);
    print(`  prompt: ${row.question}`);
    if (row.reply) print(`  reply:  ${row.reply}`);
  }
}
function printR2b(R2b) {
  print("\n=== R2b · Counter-rebuttals ===");
  for (const [key, row] of Object.entries(R2b).filter(([key]) => !key.startsWith("_"))) {
    print(`- ${key}: ${row.counter}`);
  }
}
function printR3(R3) {
  print("\n=== R3 · Final stances ===");
  for (const [key, row] of Object.entries(R3).filter(([key]) => !key.startsWith("_"))) print(`- ${key}: ${row.stance} · ${row.declaration}`);
}
function voteFromStance(stance) {
  if (stance === "dissent") return "against";
  if (stance === "reserve") return "abstain";
  return "for";
}

function printCouncilExplanation(council, briefText) {
  print("\n=== Selection explanation ===");
  for (const item of explainCouncil(council, briefText)) {
    const tier = item.tier !== undefined ? ` · T${item.tier}` : "";
    const agency = item.agency ? ` · ${item.agency}` : "";
    print(`- ${item.name} (${item.type}${tier}${agency}): ${item.reasons.join("; ")}`);
  }
}

async function runReviewMode() {
  const transcript = [];
  const log = line => { print(line); transcript.push(line); };
  const reviewers = getReviewers(brief);

  log("╔═══════════════════════════════════════════════╗");
  log("║  🎙️  K-pop Council Review Mode v3.7.0        ║");
  log("╚═══════════════════════════════════════════════╝");
  log(`Brief: ${brief}`);
  log("");

  for (const reviewer of reviewers) {
    log(`${reviewer.name}: "${reviewer.opinion}" [verdict: ${reviewer.verdict}]`);
    const input = await ask("Your reaction (+1 / -1 / ? / enter): ", "");
    if (input === "?") {
      const q = await ask("  follow-up: ", "auto-mode follow-up skipped");
      log(`  You asked: ${q}`);
      log(`  ${reviewer.name}: keep the question tied to concrete brief evidence.`);
    } else if (input === "+1") log(`  You agreed with ${reviewer.name}`);
    else if (input === "-1") log(`  You pushed back on ${reviewer.name}`);
    log("");
  }

  log("=== User vote ===");
  const verdictRaw = (await ask("final verdict (pass / reject / abstain): ", "abstain")) || "abstain";
  const weightRaw = Number.parseInt((await ask("weight (1-3, default 1): ", "1")), 10) || 1;
  const reason = await ask("reason (optional): ", "review mode auto vote");
  const userVote = castUserVote(verdictRaw, weightRaw, reason);
  const result = tallyWithUser(reviewers.map(s => ({ voter: s.name, verdict: s.verdict })), userVote);

  log("\nVerdict document:");
  log(`  council verdict: ${result.council_verdict}`);
  log(`  user effect: ${result.user_effect} (weight ${result.user_weight})`);
  log(`  final verdict: ${result.final_verdict}`);
  log(`  tally: ${JSON.stringify(result.tally)}`);

  if (result.user_effect === "veto" || result.user_effect === "override") {
    const prefs = loadUserPrefs();
    recordOverride(prefs, { brief, council_verdict: result.council_verdict, user_verdict: verdictRaw, reason });
    saveUserPrefs(prefs);
    log("  preference override saved locally");
  }

  const fav = await ask("\nmark favorite? group/era (blank skips): ", "");
  if (fav.includes("/")) {
    const [group_slug, era_slug] = fav.split("/");
    const prefs = loadUserPrefs();
    recordFavorite(prefs, { group_slug, era_slug });
    saveUserPrefs(prefs);
    log(`  favorite saved: ${fav}`);
  }
  log("\n--- transcript end ---");

  const reviewId = deriveCouncilId(
    brief,
    reviewers.map(r => ({ type: "reviewer", slug: r.name })),
    reviewers.length
  );
  const transcriptFile = noSave
    ? null
    : writeOutput(`review-${reviewId}.md`, transcript.join("\n"));

  if (jsonMode) {
    console.log(JSON.stringify({
      mode: "review",
      brief,
      reviewers,
      user_vote: userVote,
      result,
      transcript_path: transcriptFile,
    }, null, 2));
    return;
  }

  if (transcriptFile) print(`Saved review transcript: ${transcriptFile}`);
}

async function runCouncilMode() {
  let council = assembleCouncil(brief);
  council = applyCouncilSize(council, requestedSize);
  council = applyUserOverrides(council, { addSlugs, vetoSlugs, strictSize, brief });
  // In soft mode, user overrides are explicit; if they push the council beyond the cap,
  // reflect the real size rather than pretending the cap still fits.
  if (!strictSize && council.members.length > council.max_members) {
    council = { ...council, max_members: council.members.length };
  }
  // Re-derive a deterministic id from the final council so the same CLI invocation
  // produces the same verdict file name across runs.
  council.council_id = deriveCouncilId(brief, council.members, council.max_members);

  print("╔══════════════════════════════════════════════════╗");
  print("║  🏛️  K-pop Interactive Council Room v3.7.0       ║");
  print("╚══════════════════════════════════════════════════╝");
  print(`Brief: ${brief}`);
  print(`Mode: host-AI script generator${autoMode ? " · auto" : ""}`);
  print("Primary mode: load the skill in Claude/Copilot/Cursor; the host AI runs deliberation natively.");
  print(`Council: ${council.members.map(member => member.name || member.slug).join(" · ")}`);

  if (explainMode) printCouncilExplanation(council, brief);

  print("\n=== Voice identities ===");
  for (const member of council.members) print(`- ${member.slug}: ${voiceIdentity(member, brief)}`);

  const deliberation = orchestrateDeliberation(council, brief, { rebuttals: rebuttalsMode });
  print(`\nDeliberation mode: ${deliberation.mode}`);

  printR1(deliberation.rounds.R1);
  let next = await continuePrompt("R2");
  if (next === "quit") return;
  if (next !== "vote") {
    printR2(deliberation.rounds.R2);
    if (rebuttalsMode && deliberation.rounds.R2b) {
      next = await continuePrompt("R2b");
      if (next === "quit") return;
      if (next !== "vote") printR2b(deliberation.rounds.R2b);
    }
    next = await continuePrompt("R3");
    if (next === "quit") return;
  }
  if (next !== "vote") printR3(deliberation.rounds.R3);

  print("\n=== Vote ===");
  const userMember = council.members.find(member => member.type === "user");
  for (const member of council.members) {
    if (member.type === "user") continue;
    const stance = deliberation.rounds.R3[member.slug]?.stance || "agree";
    member.vote_decision = voteFromStance(stance);
    print(`- ${member.slug}: ${stance} → ${member.vote_decision}`);
  }

  const rawVote = await ask("Your vote: [y] for / [n] against / [a] abstain / [v] veto / [o] override: ", "y");
  const userVote = rawVote === "n" ? { verdict: "against", reason: "interactive user vote" }
    : rawVote === "a" ? { verdict: "abstain", reason: "interactive user vote" }
    : { verdict: "for", reason: "interactive user vote" };
  const userVeto = rawVote === "v";
  const userOverride = rawVote === "o";
  if (userMember) userMember.vote_decision = userVote.verdict;
  const userEffect = userVeto ? "veto" : userOverride ? "override" : null;
  const userDisplay = userEffect ? `${userVote.verdict} (${userEffect})` : userVote.verdict;
  print(`- ${userMember?.slug || "user"}: user → ${userDisplay}`);

  const classified = classifyClauses(deliberation.rounds.R3);
  const tally = tallyVote(council, classified, null, userVeto, userOverride);
  if (!userVeto && !userOverride) tally.user_intervention = `user vote: ${userVote.verdict}`;
  else tally.user_intervention = `user ${userEffect}: ${userVote.verdict}`;
  const verdict = produceVerdictDocument(council, brief, classified, tally);
  const fileName = `verdict-${council.council_id}.md`;
  const filePath = noSave ? null : writeOutput(fileName, verdict);

  const userVoteRecord = { verdict: userVote.verdict, effect: userEffect };
  let transcriptPath = null;
  if (transcriptMode) {
    const transcriptMd = buildTranscriptMarkdown(council, brief, deliberation, classified, tally, userVoteRecord, rebuttalsMode);
    transcriptPath = noSave ? null : writeOutput(`transcript-${council.council_id}.md`, transcriptMd);
    if (transcriptPath && !jsonMode) print(`Transcript saved: ${transcriptPath}`);
  }

  if (jsonMode) {
    console.log(JSON.stringify({
      mode: "council",
      brief,
      council: {
        council_id: council.council_id,
        max_members: council.max_members,
        members: council.members.map(m => ({ slug: m.slug, name: m.name, type: m.type, vote_decision: m.vote_decision })),
      },
      explanations: explainCouncil(council, brief),
      deliberation: { mode: deliberation.mode, rounds: deliberation.rounds },
      tally,
      verdict_path: filePath,
      transcript_path: transcriptPath,
    }, null, 2));
    return;
  }

  print("\n=== Verdict ===");
  print(`Result: ${tally.verdict} · for ${tally.for} / against ${tally.against} / abstain ${tally.abstain}`);
  if (filePath) print(`Saved: ${filePath}`);
}

function formatLineup(lineup) {
  if (Array.isArray(lineup)) return lineup.map(l => `- ${l.role || l.name}: ${l.name || ""} ${l.reason ? `(${l.reason})` : ""}`);
  const lines = [];
  if (lineup.panel?.length) lines.push(`- Panel: ${lineup.panel.join(", ")}`);
  if (lineup.anchors?.length) lines.push(`- Anchors: ${lineup.anchors.join(", ")}`);
  if (lineup.audience?.length) lines.push(`- Audience: ${lineup.audience.join(", ")}`);
  if (lineup.performers) lines.push(`- Performers: ${lineup.performers}`);
  return lines;
}

function formatPalette(anchors) {
  return anchors.map(a => {
    const parts = [a.group || a.from || a.name, a.primary, a.secondary, a.accent].filter(Boolean);
    return `- ${parts.join(" / ")}`;
  });
}

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

function linesToMd(list) {
  return list.length ? list.map(l => `- ${l}`).join("\n") : "_none_";
}

function buildTranscriptMarkdown(council, briefText, deliberation, classified, tally, userVoteRecord, includeRebuttals) {
  const parts = [
    `# K-pop Council Transcript\n`,
    `- **Brief**: ${briefText}`,
    `- **Generated**: ${new Date().toISOString()}`,
    `- **Mode**: ${deliberation.mode}`,
    `- **Roster**: ${council.members.map(m => m.slug).join(", ")}`,
    `- **Token budget**: ${deliberation.token_tracking.total_tokens} / ${deliberation.token_tracking.cap} tokens`,
    `- **User vote**: ${userVoteRecord.verdict}${userVoteRecord.effect ? ` (${userVoteRecord.effect})` : ""}`,
    ``,
  ];

  parts.push(section("Roster & Tones", council.members.map(m => {
    const persona = derivePersona({ ...m, type: m.type || "idol" }, briefText);
    return `- **${m.slug}**${m.name ? ` (${m.name})` : ""} — ${persona.tone}`;
  }).join("\n")));

  parts.push(section("R1 — Independent Statements", Object.entries(deliberation.rounds.R1)
    .filter(([k]) => !k.startsWith("_"))
    .map(([_, row]) => `- ${row.statement}`).join("\n")));

  parts.push(section("R2 — Cross-examination", Object.entries(deliberation.rounds.R2)
    .filter(([k]) => !k.startsWith("_"))
    .map(([_, row]) => `**${row.from} → ${row.to}**\n\n- prompt: ${row.question}\n- reply: ${row.reply}`).join("\n\n")));

  if (rebuttalsMode && deliberation.rounds.R2b) {
    parts.push(section("R2b — Counter-rebuttals", Object.entries(deliberation.rounds.R2b)
      .filter(([k]) => !k.startsWith("_"))
      .map(([_, row]) => `- ${row.counter}`).join("\n")));
  }

  parts.push(section("R3 — Final Declarations", Object.entries(deliberation.rounds.R3)
    .filter(([k]) => !k.startsWith("_"))
    .map(([_, row]) => `- **${row.member}** (${row.stance}): ${row.declaration}`).join("\n")));

  parts.push(section("Clause Classification", [
    "### Consensus", linesToMd(classified.consensus.map(c => c.clause)),
    "### Compromise", linesToMd(classified.compromise.map(c => c.clause)),
    "### Dissent", linesToMd(classified.dissent.map(c => c.clause)),
  ].join("\n\n")));

  const verdictDoc = produceVerdictDocument(council, briefText, classified, tally);
  parts.push(section("Verdict", verdictDoc.split("\n").slice(1).join("\n")));

  const hostPrompt = buildHostPrompt(council, { brief: briefText, includeSampleLines: false });
  parts.push(section("Appendix: Host-AI System Prompt", ["```", hostPrompt, "```"].join("\n")));

  return parts.join("\n");
}

function runDesignBriefMode() {
  const dna = synthesizeDesignBrief(brief);
  const performers = (dna.performer_dna?.dna_list || []).map(p => ({ type: "idol", slug: p.slug, name: p.name, tags: p.tags }));
  const briefId = deriveCouncilId(brief, performers, performers.length || 1);

  const doc = [
    `# Design Brief · ${brief}`,
    ``,
    `## Lineup`,
    ...formatLineup(dna.lineup),
    ``,
    `## Palette`,
    ...formatPalette(dna.palette.anchors),
    `- All hex: ${dna.palette.all_hex.join(", ")}`,
    ``,
    `## Mood`,
    `- Intersection: ${dna.mood.intersection.join(", ") || "none"}`,
    `- Union: ${dna.mood.union.join(", ")}`,
    ``,
    `## Motion`,
    `- BPM: ${dna.motion.bpm_min}-${dna.motion.bpm_max} (avg ${dna.motion.bpm_avg})`,
    `- Tempo: ${dna.motion.hint?.tempo || ""}`,
    `- Easing: ${dna.motion.hint?.easing || ""}`,
    `- Duration: ${dna.motion.hint?.duration_ms || ""}`,
    `- Note: ${dna.motion.hint?.note || ""}`,
    ``,
    `## Typography`,
    ...dna.typography.suggested_stack.map(s => `- ${s}`),
    ``,
    `## Copy Tone`,
    ...dna.copy_tone.map(t => `- ${t}`),
    ``,
    `## Constraints`,
    ...dna.constraints.map(c => `- **${c.judge}** (${c.label}): ${c.style} — ${c.manifesto}`),
    ``,
    `## Audience`,
    ...dna.audience.map(a => `- ${a.fandom}: ${a.catchphrase}`),
    ``,
    `## Signals`,
    `- Rivalry: ${dna.signals.rivalry?.has_rivalry ? "yes" : "no"}`,
    `- Cross-label: ${dna.signals.cross_label?.is_cross_label ? "yes" : "no"}`,
    `- Fusion: ${dna.signals.fusion?.is_fusion ? "yes" : "no"}`,
    ``,
  ].join("\n");

  if (jsonMode) {
    console.log(JSON.stringify({ mode: "design-brief", brief, brief_id: briefId, document: doc, ...dna }, null, 2));
    return;
  }

  print(doc);
  if (!noSave) {
    const filePath = writeOutput(`design-brief-${briefId}.md`, doc);
    print(`Saved: ${filePath}`);
  }
}

function runHostPromptMode() {
  let council = assembleCouncil(brief);
  council = applyCouncilSize(council, requestedSize);
  council = applyUserOverrides(council, { addSlugs, vetoSlugs, strictSize, brief });
  const prompt = buildHostPrompt(council, { brief, includeSampleLines: true });
  if (jsonMode) {
    console.log(JSON.stringify({ mode: "host-prompt", brief, council_id: council.council_id, members: council.members.map(m => ({ slug: m.slug, name: m.name, type: m.type })), prompt }, null, 2));
    return;
  }
  print(prompt);
  if (!noSave) {
    const filePath = writeOutput(`host-prompt-${council.council_id}.md`, prompt);
    print(`Saved: ${filePath}`);
  }
}

(reviewMode ? runReviewMode() : runCouncilMode()).catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => rl.close());
