# Quickstart · 5 minutes

## 1. What is this?

KPOP Design System turns K-pop visual strategy into executable council engines: groups, idols, user taste, era constraints, and verdicts. It helps you draft and audit comeback/brand briefs without reading the whole repository first.

## 2. Install

```bash
git clone https://github.com/SuanFishXYY/kpop-design-system.git
```

## 3. Run first demo

```bash
npm test
node examples/council-ive-comeback.mjs
```

## 4. Understand the output

Annotated demo output:

```text
{
  "sisters": [ ... ],              # related groups invited by relation engine
  "council": {                    # assembled mixed council: groups + idols + user
    "council_id": "mixed-...",
    "members": ["ive", "aespa", "everglow", "..."]
  },
  "voice": "IVE ...",            # voice template synthesized for the chair group
  "veto": { "triggered": false }, # hard veto trigger check
  "token_tracking": {             # R1/R2/R3 deliberation budget evidence
    "total_tokens": 216,
    "within_cap": true
  },
  "tally": { "verdict": "pass" } # strict >2/3 council vote result
}

--- Verdict Document ---
# Mixed Council Verdict          # final markdown-ready decision record
```

## 5. Modify

Open `examples/council-ive-comeback.mjs` and change:

```js
const brief = "IVE comeback landing with prestige princess identity";
```

Try a different brief, for example:

```js
const brief = "aespa next era visualization with cyber couture tension";
```

Then rerun:

```bash
node examples/council-ive-comeback.mjs
```

## 6. Where to go next

- Protocol: [`docs/MIXED-COUNCIL-PROTOCOL.md`](./MIXED-COUNCIL-PROTOCOL.md)
- Interactive CLI: [`docs/CLI-INTERACTIVE-COUNCIL.md`](./CLI-INTERACTIVE-COUNCIL.md)
- Flow diagram: [`docs/COUNCIL-FLOW-DIAGRAM.md`](./COUNCIL-FLOW-DIAGRAM.md)
- Examples: [`examples/`](../examples/)
