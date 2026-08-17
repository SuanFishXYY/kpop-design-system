# KPOP Design System v3.6.1 — Prioritized Modification Plan

> Derived from `review-findings.md`  
> Goal: move the system from "conceptually rich scaffold" to "genuinely useful design tool"

---

## Decision Log

| Decision | Rationale | Alternatives rejected |
|---|---|---|
| Keep host-AI mode as the only runtime | Zero API key is the core value prop; re-adding LLM providers would re-introduce cost/config friction. | Re-introduce provider abstraction. |
| Make standalone CLI a "script + audit" tool, not a fake debate | The standalone engine cannot generate real member speech; it should be honest about being a scaffold. | Continue pretending CLI output is deliberation. |
| Centralize frontmatter parsing | Eliminates data-loss bugs and duplicated regexes across engines. | Patch each parser individually. |
| Deprecate `routing.mjs` as a runtime component | No caller exists in host-AI mode; keep as a cost-modeling helper if needed. | Delete entirely (would break existing examples/tests). |

---

## Phase 1 — Critical fixes (do first)

### 1.1 Build a single, correct frontmatter parser
- **New file:** `engine/frontmatter.mjs`
- **Must support:**
  - Top-level scalar fields (`key: "value"`, `key: value`)
  - Inline arrays (`key: ["a", "b"]`)
  - Multi-line YAML lists (`key:\n  - item`)
  - Nested objects (`palette: { primary: "#x", ... }`)
  - Repeated keys collected into an array (`counterpoint_axis`)
- **Replace parsers in:** `dispatch.mjs`, `council-assembly.mjs`, `relations.mjs`, `synthesize.mjs`, `voice-synthesis.mjs`, `eras.mjs`.
- **Validation:** Add tests that parse `groups/bp.md` and assert all 5 `counterpoint_axis` values are preserved and all palette fields are present.

### 1.2 Fix `synthesize.mjs` palette parsing
- **File:** `engine/synthesize.mjs`
- **Action:** After centralizing the parser, switch `parseRichFrontmatter` to use it.
- **Acceptance:** `synthesizeDesignBrief('LE SSERAFIM landing').palette.anchors[0]` must contain `primary`, `secondary`, and `accent`.

### 1.3 Redesign `deliberation.mjs` as an audit-driven script generator
- **File:** `engine/deliberation.mjs`
- **Actions:**
  - Remove generic idol statement; instead, generate prompts that cite each member's `specialty`, `core_aesthetic`, and `voice.position_statement`.
  - Pass the brief and member DNA into conflict detection so R3 can produce `dissent`/`compromise` when member identities clash.
  - Add a `mode` field that honestly reports `"deterministic script scaffold"` in standalone mode.
- **Acceptance:** Running the CLI on a cross-label/cross-rival brief produces at least one `compromise` or `dissent` stance in R3.

### 1.4 Harden `dispatch.mjs` cross-label gate
- **File:** `engine/dispatch.mjs`
- **Actions:**
  - Build the set of required labels from all summoned souls using a `group_slug → label` map.
  - Require each distinct label to have at least one judge present.
  - Do not label souls as `"unknown"` silently; if a label cannot be resolved, report it in `missing`.
- **Acceptance:** A brief mentioning TWICE + BLACKPINK must have both JYP and YG judges present or `gate_passed: false`.

---

## Phase 2 — Major improvements

### 2.1 Clean the data layer dead links
- **Files:** `agents/*.md`, `groups/*.md`, `judges/*.md`
- **Action:** Run a validation script that checks every `invited_helpers`, `rivals`, `fusion_compatible`, and `portfolio` entry against existing files/slugs.
- **Deliverable:** A one-time fix PR plus a CI/pre-commit check that fails on new dead links.
- **Sample fixes:**
  - `wjsn-cheng` → `wjsn-chengxiao` or `wjsn-exy`
  - `stayc-isa` → create `agents/stayc-isa.md` or change reference
  - `dreamcatcher` → `dc`
  - Remove `wonyoung-line`, `2pm`, `day6`, `monsta` unless group files are added

### 2.2 Unify voting semantics
- **Files:** `engine/voting.mjs`, `engine/verdict.mjs`, `engine/user-jury.mjs`
- **Options:**
  - **A.** Make `verdict.mjs` call `voting.mjs` for the weighted tally and only add user-jury logic on top.
  - **B.** Rename functions to make semantics explicit: `tallyWeightedVotes` vs `tallyUnitVotes`.
- **Recommendation:** Option A. Reuse the existing weighted engine.
- **Acceptance:** A council with the same votes produces the same verdict regardless of entry point.

### 2.3 Wire user preferences into council assembly
- **Files:** `engine/council-assembly.mjs`, `engine/user-prefs.mjs`
- **Actions:**
  - Before assembly, load user prefs and boost favorite groups/eras in ranking.
  - Skip or demote specialties that have been rejected ≥ threshold times.
  - Record rejected specialties when a user vetoes or votes against a direction.
- **Acceptance:** A second run with the same user sees their previous favorites/overrides influence member selection.

### 2.4 Fix the coherence demo
- **File:** `examples/coherence-demo.mjs`
- **Action:** Update the "broken photocard" example to use the correct era base role mapping (`primary: '#FF1493'`, `secondary: '#0A0A0A'`) and only deviate one channel (e.g., brightness).
- **Acceptance:** Demo output shows a clear single-medium failure instead of cascading false positives.

### 2.5 Replace the stranded routing engine
- **File:** `engine/routing.mjs`
- **Action:**
  - Remove fictional model names.
  - Reposition as a "host-AI cost estimator": given a council, estimate relative token/turn cost by tier.
  - Keep the existing tests but update expected model strings to real model families or generic placeholders.
- **Alternative (if no runtime use):** Mark as deprecated and move to `examples/` only.

### 2.6 Provide a conflict data injection path
- **File:** `engine/conflicts.mjs`
- **Action:**
  - Allow `PERSONAL_CONFLICTS` to be loaded from a user-managed JSON file (e.g., `~/.kpop-design/conflicts.json`).
  - Add `loadConflictRegistry(path?)` and `saveConflictEntry(...)` helpers.
- **Acceptance:** Users can add a conflict without editing source code.

---

## Phase 3 — Polish and documentation

### 3.1 Clean documentation artifacts
- **Files:** `docs/USER-AS-JUDGE.md`, `docs/ARCHITECTURE.md`, `README.md`
- **Actions:**
  - Remove or downgrade v3.4.0 LLM-provider references.
  - Add a "What runs where" section to `docs/ARCHITECTURE.md` explaining host-AI vs JS engine responsibilities.
  - Document that standalone CLI output is a scaffold, not final member speech.

### 3.2 Improve CLI help and messages
- **File:** `bin/council.mjs`, `installer/install.mjs`
- **Actions:**
  - Expand `printHelp()` to list all flags and explain `--review` / `--auto`.
  - Print `Deliberation mode: deterministic scaffold (host-AI renders speeches in skill mode)` at startup.
  - Fix installer strings: replace SuanFish references, use `/kpop` trigger phrase.

### 3.3 Normalize line endings
- **File:** `engine/dispatch.mjs`
- **Action:** Convert CRLF to LF and add a `.gitattributes` rule to prevent recurrence.

### 3.4 Fix suspicious regex in council assembly
- **File:** `engine/council-assembly.mjs:71`
- **Action:** Replace `/[2345]\s*?/` with explicit generation keyword detection (`2nd`, `3rd`, `4th`, `5th`, `cross-gen`, `multi-gen`).

### 3.5 Add missing tests
- **File:** `engine/synthesize.test.mjs` (new)
- **Coverage:**
  - `synthesizeDesignBrief` returns valid palette/mood/motion/typography for known briefs.
  - `aggregatePerformerDNA` clusters performers by specialty.
  - `getPerformersBySpecialty` returns the requested limit.

---

## Suggested Quick Wins (1-2 hours)

1. **Fix `synthesize.mjs` palette regex** — small change, high impact on design-DNA output.
2. **Fix installer strings** — copy-paste cleanup.
3. **Expand CLI `--help`** — immediate usability win.
4. **Fix coherence demo data** — restores demo credibility.
5. **Add `.gitattributes`** — prevent CRLF regressions.

---

## Suggested Architectural Bets

| Bet | Why | Risk |
|---|---|---|
| Centralized frontmatter parser | Solves most data-loss bugs at once | Requires touching many files |
| Host-AI-only deliberation | Aligns with zero-config promise | Standalone CLI becomes less impressive |
| Preference-aware assembly | Makes the system feel personal over time | Privacy/expectation management |
| Coherence/cycle as primary UX | These engines produce the most concrete value | Relegates council debate to secondary role |

---

## Exit Criteria for Implementation

- [ ] All Phase 1 items merged and tested
- [ ] `npm test` still 109/109 PASS (or more)
- [ ] CLI `node bin/council.mjs --brief="..." --auto` produces varied, identity-aware R3 stances
- [ ] `examples/coherence-demo.mjs` shows a believable single-medium failure
- [ ] No dead links in `agents/`, `groups/`, `judges/` reference lists
- [ ] `docs/ARCHITECTURE.md` explains host-AI vs engine split
