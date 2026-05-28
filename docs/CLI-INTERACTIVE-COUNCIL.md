# Interactive CLI Council

Run an interactive council room:

```bash
node bin/council.mjs --brief="aespa next era visualization"
```

Use real LLM providers when API keys are configured:

```bash
node bin/council.mjs --brief="IVE comeback landing" --llm
```

## Keys

- `enter` — continue to the next round
- `s` — skip straight to vote
- `q` — quit
- `y` — user votes for
- `n` — user votes against
- `a` — abstain
- `v` — user veto
- `o` — user override

## Example transcript

```text
$ node bin/council.mjs --brief="aespa next era visualization"
╔══════════════════════════════════════════════════╗
║  🏛️  K-pop Interactive Council Room v3.4.0       ║
╚══════════════════════════════════════════════════╝
Brief: aespa next era visualization
Mode: stub
Council: aespa · red velvet · nct · Karina · Giselle · User

=== Voice identities ===
- aespa: aespa speaks from cyber couture identity
- redvelvet: Red Velvet anchors velvet-pop duality
- user: User: final taste authority with veto/override

=== R1 · Independent statements ===
- aespa: aespa: Proposal must preserve cyber identity...
press [enter] to continue to R2, [s] to skip to vote, [q] to quit:
=== R2 · Cross-questions ===
- aespa->redvelvet: which constraint is non-negotiable?
press [enter] to continue to R3, [s] to skip to vote, [q] to quit:
=== R3 · Final stances ===
- aespa: agree · preserve identity...
Your vote: [y] for / [n] against / [a] abstain / [v] veto / [o] override: y
Result: pass · for 6 / against 0 / abstain 1
Saved: verdict-mixed-abc123.md
```
