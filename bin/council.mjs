#!/usr/bin/env node
// bin/council.mjs
// v3.4.0 · Interactive Mixed Council room.

import readline from "node:readline";
import { writeFileSync } from "node:fs";
import { assembleCouncil } from "../engine/council-assembly.mjs";
import { synthesizeVoice } from "../engine/voice-synthesis.mjs";
import { orchestrateDeliberation } from "../engine/deliberation.mjs";
import { classifyClauses, tallyVote, produceVerdictDocument } from "../engine/verdict.mjs";

const args = process.argv.slice(2);
const briefArg = args.find(arg => arg.startsWith("--brief="));
const brief = briefArg?.slice("--brief=".length).replace(/^"|"$/g, "");
const useLLM = args.includes("--llm");
const sizeArg = args.find(arg => arg.startsWith("--council-size="));
const requestedSize = Number(sizeArg?.split("=")[1] || 0);

if (!brief) {
  console.error("Usage: node bin/council.mjs --brief=\"aespa next era visualization\" [--llm] [--council-size=5|7]");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question) { return new Promise(resolve => rl.question(question, answer => resolve(answer.trim().toLowerCase()))); }
function print(line = "") { console.log(line); }

function applyCouncilSize(council, size) {
  const targetSize = [5, 7].includes(size) ? size : council.members.length + (council.members.some(member => member.type === "user") ? 0 : 1);
  const user = council.members.find(member => member.type === "user") || { type: "user", slug: "user", name: "User", vote: 1 };
  const nonUser = council.members.filter(member => member.type !== "user").slice(0, Math.max(1, targetSize - 1));
  return { ...council, members: [...nonUser, user], max_members: targetSize };
}

function voiceIdentity(member, briefText) {
  if (member.type === "group") {
    try { return synthesizeVoice(member.slug, { trait: member.core_aesthetic || member.era || "identity", brief: briefText }).split("\n")[0]; }
    catch { return `${member.name || member.slug}: group anchor identity`; }
  }
  if (member.type === "idol") return `${member.name || member.slug}: idol specialist for ${member.specialty || "visual strategy"}`;
  return "User: final taste authority with veto/override";
}

async function continuePrompt(nextRound) {
  const answer = await ask(`press [enter] to continue to ${nextRound}, [s] to skip to vote, [q] to quit: `);
  if (answer === "q") return "quit";
  if (answer === "s") return "vote";
  return "continue";
}

function printR1(R1) {
  print("\n=== R1 · Independent statements ===");
  for (const [key, row] of Object.entries(R1).filter(([key]) => !key.startsWith("_"))) print(`- ${key}: ${row.statement}`);
}

function printR2(R2) {
  print("\n=== R2 · Cross-questions ===");
  for (const [key, row] of Object.entries(R2).filter(([key]) => !key.startsWith("_"))) print(`- ${key}: ${row.question}`);
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

async function main() {
  const council = applyCouncilSize(assembleCouncil(brief), requestedSize);

  print("╔══════════════════════════════════════════════════╗");
  print("║  🏛️  K-pop Interactive Council Room v3.4.0       ║");
  print("╚══════════════════════════════════════════════════╝");
  print(`Brief: ${brief}`);
  print(`Mode: ${useLLM ? "LLM when available" : "stub"}`);
  print(`Council: ${council.members.map(member => member.name || member.slug).join(" · ")}`);

  print("\n=== Voice identities ===");
  for (const member of council.members) print(`- ${member.slug}: ${voiceIdentity(member, brief)}`);

  const deliberation = await orchestrateDeliberation(council, brief, { useLLM });
  print(`\nDeliberation mode: ${deliberation.mode}`);

  printR1(deliberation.rounds.R1);
  let next = await continuePrompt("R2");
  if (next === "quit") return;

  if (next !== "vote") {
    printR2(deliberation.rounds.R2);
    next = await continuePrompt("R3");
    if (next === "quit") return;
  }

  if (next !== "vote") printR3(deliberation.rounds.R3);

  print("\n=== Vote ===");
  for (const member of council.members) {
    const stance = deliberation.rounds.R3[member.slug]?.stance || "agree";
    member.vote_decision = voteFromStance(stance);
    print(`- ${member.slug}: ${stance} → ${member.vote_decision}`);
  }

  const rawVote = await ask("Your vote: [y] for / [n] against / [a] abstain / [v] veto / [o] override: ");
  const userVote = rawVote === "n" ? { verdict: "against", reason: "interactive user vote" }
    : rawVote === "a" ? { verdict: "abstain", reason: "interactive user vote" }
    : { verdict: "for", reason: "interactive user vote" };
  const userVeto = rawVote === "v";
  const userOverride = rawVote === "o";

  const classified = classifyClauses(deliberation.rounds.R3);
  const tally = tallyVote(council, classified, userVote, userVeto, userOverride);
  const verdict = produceVerdictDocument(council, brief, classified, tally);
  const file = `verdict-${council.council_id}.md`;
  writeFileSync(file, verdict, "utf8");

  print("\n=== Verdict ===");
  print(`Result: ${tally.verdict} · for ${tally.for} / against ${tally.against} / abstain ${tally.abstain}`);
  print(`Saved: ${file}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => rl.close());
