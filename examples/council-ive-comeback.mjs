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
const tally = tallyVote(council, classified, "for");
const verdict = produceVerdictDocument(council, brief, classified, tally);

console.log(JSON.stringify({ sisters, council, voice, veto, token_tracking: deliberation.token_tracking, tally }, null, 2));
console.log("\n--- Verdict Document ---\n");
console.log(verdict);
