---
name: kpop-design-system
description: "K-pop industrial visual strategy system v3.4 - Quickstart + LLM bridge + interactive council, mixed council, routing, strict verdicts, 96/96 node tests PASS. Activate on /kpop, /idol-congress, /kpop-design, /kpop-era."
version: 3.4.0
author: 算鱼工作室
license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, era, comeback-cycle, touchpoint, generation-lint, user-as-judge, ui, brand, ai-native]
---

# KPOP Design System - The Idol Congress - v3.4

> 🎯 **快速召唤**: 在 Copilot / Claude / Codex / Gemini / Antigravity 任一 CLI 输入 `/kpop` 或 `/女团` 即可强制激活。
>
> *第一个把 K-pop 工业级视觉策略代码化的开源系统。186 idol × 52 团魂 × 35 era × 5 媒介 × 4 代审美。*

---

## v3.4 - Quickstart + LLM + Interactive Council

- Mixed council: idol specialists + group representatives + user, one vote each.
- Sister group invitation: same generation, same agency, same aesthetic, aesthetic counterpoint.
- Deterministic assembly: 3-layer BFS, 5/7 cap, >=2 idols + >=2 groups when council has 4+ members.
- Voice templates with hard veto triggers; R1/R2/R3 deliberation; strict `> 2/3` verdict with user veto/override.

---


## ✨ v3.1 · 4 大支柱 + 用户成为评委

| 支柱 | 引擎 | 一句话 |
|------|------|--------|
| ❶ 🌌 **Era Universe** | `engine/eras.mjs` | 每张专辑独立视觉宇宙 · 命中 era 自动 lock palette / mv_grammar / forbidden |
| ❷ 📅 **Comeback Cycle** | `engine/cycle.mjs` | 30 天 7 节点 brief 日历 (D-30 logo → D+0 MV → D+7 打歌) |
| ❸ 🎨 **Multi-touchpoint Coherence** | `engine/coherence.mjs` | 5 媒介一致性 audit (MV / SNS / Photocard / Lightstick / Stage) + 物理补偿 |
| ❹ 🧬 **Generation Lint** | `engine/generation.mjs` | 4 代审美错位检测 (2/3/4/5 代 禁忌词典) |
| 🎁 **User-as-Judge** | `engine/user-jury.mjs` + `engine/user-prefs.mjs` | 用户占 1 席 (可加权至 3) · veto / override · 本地偏好学习 |

---

## 🏛️ 议会构成 (218+ 角色)

| Layer | 数量 | weight | veto | 角色 |
|-------|------|--------|------|------|
| 🎙️ **评审团 (judges/)** | 7 | 5 | portfolio_only | JYP / YG / SM / HYBE / ADOR / Starship / THEBLACKLABEL |
| 🎤 **团代表 (groups/)** | 52 | 3 | yes | 每团 group_anchor · 含 palette + eras + rivals |
| ✨ **舞台担当 (Tier 0)** | 71 | 2 | no | 主推 idol |
| 💫 **舞台助攻 (Tier 1)** | 45 | 1.5 | no | 跨团助攻 |
| 📣 **现场投票 (fandoms/)** | 45 | 1 | no | ONCE / BLINK / DIVE... 观众视角 |
| 🧑 **用户席 (v3.1)** | 1 | 1-3 | yes (override/veto) | 你 |

---

## 🌌 ❶ Era Universe (v3.0)

每团每张专辑独立视觉宇宙。35 era 已编入 12 顶级团 frontmatter。

```js
import { getEraLockedDNA, listGroupEras } from "kpop-design-system/engine/eras.mjs";

const dna = getEraLockedDNA("TWICE Fancy era 风格 landing");
// {
//   era: { era_slug: "fancy", year: 2019, album: "Fancy You" },
//   palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" },
//   mood: ["冷感", "高级", "杂志", "都市孤独"],
//   mv_grammar: "工业空间 + 冷光 + 定格凝视",
//   forbidden: ["Y2K 贴纸", "高饱和粉", "校园元素"]
// }

listGroupEras("twice");
// → [{ era_slug: "cheer_up", year: 2016 }, { era_slug: "tt", year: 2016 },
//    { era_slug: "fancy", year: 2019 }, { era_slug: "feel_special", year: 2019 }]
```

**对比 v2.x**: 之前 "TWICE 风格" → 默认甜美粉; 现在 "TWICE Fancy era" → 锁定工业灰+雾紫+杂志感, 禁用 Y2K。

---

## 📅 ❷ Comeback Cycle (v3.0)

30 天 7 节点的 brief 日历, 每节点定向召唤 ui_specialty。

```js
import { dispatchComebackCycle, listCycleStages } from "kpop-design-system/engine/cycle.mjs";

const cycle = dispatchComebackCycle("twice", "fancy");
// → 7 stages:
//   D-30 logo_teaser     · 优先 brand
//   D-21 concept_photo_1 · 优先 photography
//   D-14 concept_photo_2 · 优先 photography + typography
//   D-7  mv_teaser_1     · 优先 motion + brand
//   D-3  mv_teaser_2     · 优先 motion
//   D+0  mv_release      · 全员
//   D+7  music_show      · 优先 motion + stage
```

每个 stage 自动注入 `mv_grammar` (D-7 至 D+0 阶段), 保证 MV 期视觉语法不漂移。

---

## 🎨 ❸ Multi-touchpoint Coherence (v3.0)

5 媒介一致性 audit + 物理补偿系数 (印刷 CMYK / LED / 舞台灯光)。

```js
import { auditTouchpointCoherence } from "kpop-design-system/engine/coherence.mjs";

const report = auditTouchpointCoherence("twice", "fancy", [
  { medium: "mv",         palette: { primary: "#2E2E3E" } },
  { medium: "sns_post",   palette: { primary: "#2E2E3E" } },
  { medium: "photocard",  palette: { primary: "#2E2E3E" } },  // 自动 saturation +12 (CMYK 补偿)
  { medium: "lightstick", palette: { primary: "#2E2E3E" } },  // 自动 brightness +20 (LED 补偿)
  { medium: "stage",      palette: { primary: "#2E2E3E" } },  // 自动 saturation +20 (舞台灯光)
]);
// → { verdict: "PASS"|"WARN"|"FAIL", overall_score: 0-100,
//     per_medium: { mv: 95, photocard: 88, ... },
//     deviations: [{ medium, hsl_delta, suggestion }] }
```

---

## 🧬 ❹ Generation Aesthetic Lint (v3.0)

| 代际 | 时期 | 标签 | 禁忌 |
|------|------|------|------|
| 2代 | 2007-2012 | 鲜艳高饱和 + 粉嫩 + 大头特写 | 暗黑科技 / cyber |
| 3代 | 2013-2018 | Y2K + 杂志大片 + 黑白对照 | 监控感 / 后人类 / 去性别 / 暗黑科技 |
| 4代 | 2019-2022 | 极简 + AI cyber + 公主 + 校园 | (无强禁) |
| 5代 | 2023+ | 暗黑科技 + 监控 + AI 后人类 + 去性别 | 复古 Y2K (除非 retro homage) |

```js
import { checkGenerationAesthetic } from "kpop-design-system/engine/generation.mjs";

checkGenerationAesthetic("ILLIT 用 Y2K 复古风", "illit");
// → { has_violation: true, violations: ["Y2K"],
//     suggestion: "Y2K 是 3代 语法; 5代 ILLIT 应走 暗黑科技 / AI 后人类",
//     allow_override: true }  // 加 "retro homage" 标记可放行
```

---

## 🎁 User-as-Judge (v3.1)

```js
import { tallyWithUser, castUserVote } from "kpop-design-system/engine/user-jury.mjs";
import { recordFavorite, topFavorites } from "kpop-design-system/engine/user-prefs.mjs";

// 1. 注入用户票 (默认 weight=1, 可加权至 3)
const userVote = castUserVote("reject", 2, "色调和 era 不符");

// 2. tally 时计入用户席
const result = tallyWithUser(councilVotes, userVote);
// → { final_verdict: "user_veto" | "user_override" | "pass" | "reject",
//     user_effect: "veto" | "override" | "concur" | "none",
//     audit_trail: [...] }

// 3. 偏好学习 (本地 ~/.kpop-design/user-prefs.json · 不上传)
recordFavorite("twice", "fancy");
topFavorites(3);  // → 用户最常调的 era 组合
```

**交互式 CLI**: `node bin/review.mjs --brief="TWICE Fancy landing"` → idol 担当轮流发言 → 用户实时 +1/-1/? → 自动出决议书。

---

## 🎬 5 大奖项类目 (stages · v1.5 保留)

| Slug | 类目 |
|------|------|
| 🎬 debut | 最佳新人 |
| 🔄 comeback | 年度回归 |
| 🎤 concert | 年度演唱会 KV |
| 🤝 collab | 最佳合作舞台 |
| 🌐 landing | 最佳官方品牌 KV |

## 🧬 5 大传承大奖 (lineages)

main_vocal · rap_line · visual_center · leader_dna · dance_machine

## ⚔️ 年度对决 (rivalry)

BLACKPINK ↔ TWICE · aespa ↔ IVE · NewJeans ↔ ILLIT · (G)I-DLE ↔ ITZY

---

## 💰 Cost-Aware Routing (v2.3+)

| 档位 | 推荐模型 | 用于 |
|------|---------|------|
| premium | claude-opus-4.7 / gpt-5.5 | panel (7 评审 · veto) |
| standard | claude-sonnet-4.6 / gpt-5.4 | group_anchor (52 团代表) |
| fast | claude-haiku-4.5 / gpt-5-mini | performer + audience |

实跑省钱: BLACKPINK × TWICE landing · 20 agents · 51 cost units vs naive 200 · **75% savings**。

```js
import { getRoutingPlan } from "kpop-design-system/engine/routing.mjs";
const { plan, summary } = getRoutingPlan(council, "claude");
```

---

## 🚀 安装

```bash
npx --yes github:SuanFishXYY/kpop-design-system
```

自动注册到 6 平台 CLI (Copilot / Claude / Codex / Gemini / Antigravity / 通用 agents)。

## 🧪 测试

```bash
node engine/dispatch.test.mjs       # 25 PASS
node engine/voting.test.mjs         # 7 PASS
node engine/routing.test.mjs        # 14 PASS
node --test --test-reporter=tap \
  engine/eras.test.mjs \
  engine/cycle.test.mjs \
  engine/coherence.test.mjs \
  engine/generation.test.mjs \
  engine/user-jury.test.mjs \
  engine/user-prefs.test.mjs
# → 40 PASS · 总计 86/86 PASS
```

## 📚 文档

- [`docs/ERA-UNIVERSE.md`](docs/ERA-UNIVERSE.md)
- [`docs/COMEBACK-CYCLE.md`](docs/COMEBACK-CYCLE.md)
- [`docs/TOUCHPOINT-COHERENCE.md`](docs/TOUCHPOINT-COHERENCE.md)
- [`docs/GENERATION-AESTHETICS.md`](docs/GENERATION-AESTHETICS.md)
- [`docs/USER-AS-JUDGE.md`](docs/USER-AS-JUDGE.md)

## 🌐 触发短语

`/kpop` · `/kpop design` · `/kpop awards` · `/kpop era` · `/女团` · `/idol-congress` · "TWICE Fancy era" · "IVE comeback 30 天" · "BLACKPINK 周边一致性" · "BABYMONSTER Y2K 风险"

## 📄 License

MIT · 算鱼工作室 · 2025-2026
