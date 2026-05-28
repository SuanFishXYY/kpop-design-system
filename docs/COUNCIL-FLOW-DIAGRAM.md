# Council A→Z Flow Diagram

```text
A. user brief
   |
   v
B. relations engine
   |
   v
C. council assembly
   |
   v
D. voice synthesis
   |
   v
E. deliberation R1/R2/R3
   |
   v
F. verdict engine
   |
   v
Z. output: verdict markdown + audit trail
```

## 5-engine table

| Step | Engine | API | Key input | Key output |
|---|---|---|---|---|
| B | Relations | `getAllSisterGroups(groupSlug)` | group slug | sister groups by generation, agency, aesthetic, counterpoint |
| C | Council assembly | `assembleCouncil(brief)` | user brief | mixed council members, invitation chain, council id |
| D | Voice synthesis | `synthesizeVoice(groupSlug, scenario)` | group slug + brief/trait | identity, position, question template, veto triggers |
| E | Deliberation | `orchestrateDeliberation(council, brief, options)` | council + brief + `{ useLLM }` | R1 statements, R2 questions, R3 stances, mode, token tracking |
| F | Verdict | `classifyClauses(R3)` + `tallyVote(...)` | R3 output + votes | consensus/compromise/dissent clauses and final verdict |

## B. Relations engine

`engine/relations.mjs` finds sister groups before the room is assembled. API: `getAllSisterGroups(groupSlug)`. Input is a group slug such as `ive`; output is a deduplicated relation list with evidence for same generation, same agency, same aesthetic tags, and aesthetic counterpoint.

## C. Council assembly

`engine/council-assembly.mjs` turns a brief into a bounded mixed council. API: `assembleCouncil(brief)`. Input is the full user brief; output includes `council_id`, `members`, `invitation_chain`, `declined`, and the summoner/DRI.

## D. Voice synthesis

`engine/voice-synthesis.mjs` injects group-specific identity into the room. API: `synthesizeVoice(groupSlug, scenario)`. Input is a group slug plus a scenario `{ trait, brief }`; output is a compact voice template with identity, position, a question template, and hard veto triggers.

## E. Deliberation engine

`engine/deliberation.mjs` runs three rounds: R1 independent statements, R2 cross-examination, and R3 final stance. API: `orchestrateDeliberation(council, brief, { useLLM })`. Input is the assembled council and brief; output is `rounds`, `token_tracking`, `conflict_flag`, `allowed_rounds`, and `mode` (`stub` or `llm:<provider>`).

## F. Verdict engine

`engine/verdict.mjs` converts R3 stances into clauses and tallies strict council votes. APIs: `classifyClauses(R3_output)`, `tallyVote(council, clauses, userVote, userVeto, userOverride)`, and `produceVerdictDocument(...)`. Inputs are R3 output, council member votes, and optional user intervention; output is a final verdict and markdown decision record.
