# KPOP Design System

🔌 **零配置·插宿主 AI 即用** · 不需要任何 API key · Claude/Copilot/Cursor 直接 `/kpop` 即可

K-pop industrial visual strategy as a tested mixed-council protocol. v3.4.3 is Pure protocol mode: zero external API, host-AI native deliberation, deterministic JS assembly/vote/verdict closure.

[![version](https://img.shields.io/badge/version-3.4.3-pink.svg)](./CHANGELOG.md)
[![tests](https://img.shields.io/badge/tests-91%2F91%20PASS-green.svg)](#)

**v3.4.3 highlights**: ✨ Pure protocol mode · zero external API · host-AI native deliberation · zero config.

## Quick start

- Works in Claude/Copilot/Cursor out of the box - zero API key, zero config. Load the skill and call `/kpop`.
- Verify locally:

```bash
npm test
node examples/council-ive-comeback.mjs
node bin/council.mjs --brief="IVE comeback landing" --auto
```

## Version history

| Version | Focus |
|---|---|
| v3.4.3 | Pure protocol mode · host-AI native execution · zero external API |
| v3.4 | Quickstart + canonical CLI `bin/council.mjs` + mixed council transcripts |
| v3.3 | Mixed Council: relations, assembly, voice synthesis, deliberation, verdict |

Historical note: v3.4.0 briefly experimented with DeepSeek/Claude/Gemini provider wrappers. v3.4.3 removed them because the primary skill runtime already has a host AI.

## Docs

- [QUICKSTART](./docs/QUICKSTART.md)
- [COUNCIL-FLOW-DIAGRAM](./docs/COUNCIL-FLOW-DIAGRAM.md)
- [ARCHITECTURE](./docs/ARCHITECTURE.md)
- [CLI-INTERACTIVE-COUNCIL](./docs/CLI-INTERACTIVE-COUNCIL.md)
- [scripts/README](./scripts/README.md)

## Verify

- `npm test`
- `node bin/council.mjs --brief="quick test" --auto`
