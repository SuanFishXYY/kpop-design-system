# Interactive CLI Council

The primary mode is loading this skill into Claude/Copilot/Cursor where the host AI runs the deliberation natively. This CLI remains for standalone / embedding usage, demos, and transcript generation.

```bash
node bin/council.mjs --brief="aespa next era visualization"
```

## Options

- `--brief="..."` — required brief text
- `--council-size=5|7` — hard cap the council size
- `--auto` — non-interactive mode (useful for CI / transcripts)
- `--explain`, `-e` — print why each member was selected
- `--add=name1,name2` — force-add idols/groups by slug or name (fuzzy matched)
- `--veto=name1,name2` — remove idols/groups by slug or name (fuzzy matched)
- `--strict-size` — when used with `--add`/`--veto`, trim non-override members so the final council never exceeds the cap
- `--review` — run review mode with default design reviewers
- `--output-dir=PATH` — write verdict / review transcripts to this directory (created if missing)
- `--no-save` — do not write verdict / review transcript files
- `--design-brief` — generate a full design-brief document instead of a council verdict
- `--host-prompt` — assemble the council, emit a host-AI system prompt, and exit (does not run deliberation)
- `--rebuttals` — run the optional R2b counter-reply round after R2 cross-examination
- `--transcript` — write a full markdown transcript (`transcript-mixed-<hash>.md`) with R1/R2/R2b/R3, clause classification, verdict, and host-AI system prompt appendix
- `--json` — emit machine-readable JSON to stdout (implies `--auto`)
- `--list-idols` — print all idol slugs/names and exit
- `--list-groups` — print all group slugs/names and exit
- `--brief-file=PATH` — read the brief text from a file instead of `--brief`
- `--version`, `-v` — print CLI version
- `--help`, `-h` — print usage

Verdict files are named `verdict-mixed-<hash>.md`; the hash is deterministic from the brief and final council members, so the same invocation produces the same file name across runs.

## Interactive keys

- `enter` - continue to the next round
- `s` - skip straight to vote
- `q` - quit
- `y` - user votes for
- `n` - user votes against
- `a` - abstain
- `v` - user veto
- `o` - user override

## Review mode

```bash
node bin/council.mjs --review --brief="TWICE Fancy era landing"
```

Reviewers are loaded from `engine/reviewers.mjs` and can be extended there.

## Host-AI prompt mode

Use this when you want to hand the assembled council to an external LLM (Claude / GPT / etc.) instead of running the local engine:

```bash
node bin/council.mjs --brief="aespa next era visualization" --host-prompt
```

Add `--json` to get the prompt as JSON, or pipe it to a file:

```bash
node bin/council.mjs --brief="aespa next era visualization" --host-prompt > host-prompt.txt
```

## Rebuttal round

To include the optional R2b counter-rebuttal round in a local deliberation:

```bash
node bin/council.mjs --brief="IVE comeback landing" --rebuttals --auto
```
