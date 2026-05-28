---
name: kpop-design-system
description: "K-pop industrial visual strategy system v3.4.3 · zero API key required · host AI executes protocol natively · mixed council, routing, strict verdicts, ~91 node tests PASS. Activate on /kpop, /idol-congress, /kpop-design, /kpop-era."
version: 3.4.3
author: SuanFishXYY
license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, era, comeback-cycle, touchpoint, generation-lint, user-as-judge, ui, brand, ai-native, zero-config]
---

# KPOP Design System - The Idol Congress - v3.4.3

🔌 **零配置·插宿主 AI 即用** · 不需要任何 API key · Claude/Copilot/Cursor 直接 `/kpop` 即可

## v3.4.3 - Host-AI Mode / Zero Config

- Mixed council: idol specialists + group representatives + user, one vote each.
- Deterministic assembly: 3-layer BFS, 5/7 cap, >=2 idols + >=2 groups when council has 4+ members.
- Voice templates with hard veto triggers; R1/R2/R3 deliberation; strict `> 2/3` verdict with user veto/override.
- Host AI handles member speech natively in Claude/Copilot/Cursor; JS engine keeps structure, vote math, and verdict closure deterministic.
- Test target: ~91 PASS / 0 FAIL.

## Usage

`/kpop` or `/idol-congress` in the host AI. For standalone transcripts: `node bin/council.mjs --brief="TWICE Fancy landing" --auto`.
