import { getAllSisterGroups } from "../engine/relations.mjs";
import { assembleCouncil } from "../engine/council-assembly.mjs";
import { synthesizeVoice, checkVetoTriggers } from "../engine/voice-synthesis.mjs";
import { orchestrateDeliberation } from "../engine/deliberation.mjs";
import { classifyClauses, tallyVote, produceVerdictDocument } from "../engine/verdict.mjs";

const brief = "IVE comeback landing with prestige princess identity";
const sisters = getAllSisterGroups("ive").slice(0, 3);
const council = assembleCouncil(brief);
const voice = synthesizeVoice("ive", { trait: "prestige", brief });
const veto = checkVetoTriggers("ive", brief);
const deliberation = orchestrateDeliberation(council, brief);
const classified = classifyClauses(deliberation.rounds.R3);

// Mock member votes (in real flow these come from R3 stances + LLM judgment).
// IVE chair = for · aespa = against (counterpoint by design) · everglow/karina/giselle = for.
const mockVotes = { "ive": "for", "aespa": "against", "everglow": "for", "aespa-karina": "for", "aespa-giselle": "for" };
council.members.forEach(m => { m.vote_decision = mockVotes[m.slug] || "for"; });

const tally = tallyVote(council, classified, { verdict: "for", reason: "user endorses prestige princess direction" });
const verdict = produceVerdictDocument(council, brief, classified, tally);

// Bonus scenario: user veto path
const vetoTally = tallyVote(council, classified, { verdict: "for" }, true);

console.log(JSON.stringify({ sisters, council, voice, veto, token_tracking: deliberation.token_tracking, tally, scenarios: { user_veto_path: vetoTally } }, null, 2));
console.log("\n--- Verdict Document ---\n");
console.log(verdict);
