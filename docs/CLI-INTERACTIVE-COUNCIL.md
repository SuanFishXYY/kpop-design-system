# Interactive CLI Council

The primary mode is loading this skill into Claude/Copilot/Cursor where the host AI runs the deliberation natively. This CLI remains for standalone / embedding usage, demos, and transcript generation.

```bash
node bin/council.mjs --brief="aespa next era visualization"
```

## Keys

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
