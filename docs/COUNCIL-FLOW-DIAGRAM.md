# Council A-Z Flow Diagram

```text
A. user brief -> B. relations engine -> C. council assembly -> D. voice synthesis -> E. deliberation script generated; host AI executes prompts -> F. verdict engine -> Z. verdict markdown + audit trail
```

| Step | Engine | API | Key output |
|---|---|---|---|
| B | Relations | `getAllSisterGroups(groupSlug)` | sister groups by generation, agency, aesthetic, counterpoint |
| C | Council assembly | `assembleCouncil(brief)` | mixed council members, invitation chain, council id |
| D | Voice synthesis | `synthesizeVoice(groupSlug, scenario)` | identity, position, question template, veto triggers |
| E | Deliberation | `orchestrateDeliberation(council, brief)` | R1/R2/R3 protocol script; host AI executes prompts |
| F | Verdict | `classifyClauses(R3)` + `tallyVote(...)` | consensus/compromise/dissent clauses and final verdict |

`engine/deliberation.mjs` runs deterministic scaffold rounds. In Claude/Copilot/Cursor, the host AI executes those prompts and replaces stub text with full member speech.
