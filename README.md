# 🎤 KPOP Design System · The Idol Congress

> K-pop idol 议会 · 186 idol · 52 团魂 · 7 评委 · 4 大支柱 · 加权陪审团投票 · 第一个把 K-pop 工业视觉策略代码化的开源系统

[![version](https://img.shields.io/badge/version-3.1.0-pink.svg)](./CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![idols](https://img.shields.io/badge/idols-186-purple.svg)](#)
[![group_souls](https://img.shields.io/badge/group_souls-52-magenta.svg)](#)
[![eras](https://img.shields.io/badge/eras-35-violet.svg)](#)
[![tests](https://img.shields.io/badge/tests-86%2F86%20PASS-green.svg)](#)

---

## ✨ v3.1 亮点 · 4 大支柱 + 用户成为评委

### ❶ 🌌 Era Universe — 每张专辑都有独立视觉宇宙

```js
import { getEraLockedDNA } from "./engine/eras.mjs";

getEraLockedDNA("TWICE Fancy era 风格 landing");
// → {
//     palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" },
//     mood: ["冷感", "高级", "杂志", "都市孤独"],
//     mv_grammar: "工业空间 + 冷光 + 定格凝视",
//     forbidden: ["Y2K 贴纸", "高饱和粉", "校园元素"]
//   }
```

### ❷ 📅 Comeback Cycle — 30 天 7 节点 brief 日历

```js
import { dispatchComebackCycle } from "./engine/cycle.mjs";

const cycle = dispatchComebackCycle("twice", "fancy");
// → 7 stages: D-30 Logo Teaser → D-21 Concept Photo → D-7 MV Teaser
//             → D+0 MV Release → D+7 打歌 (4 周)
```

### ❸ 🎨 Multi-touchpoint Coherence — 5 媒介一致性 audit

```js
import { auditTouchpointCoherence } from "./engine/coherence.mjs";

const report = auditTouchpointCoherence("twice", "fancy", [
  { medium: "mv",         palette: {...} },
  { medium: "photocard",  palette: {...} },  // 自动 CMYK 补偿
  { medium: "lightstick", palette: {...} },  // 自动 LED 补偿
]);
// → { verdict: "PASS"|"WARN"|"FAIL", overall_score: 0-100 }
```

### ❹ 🧬 Generation Aesthetic Lint — 4 代审美错位检测

```js
checkGenerationAesthetic("ILLIT 用 Y2K 复古风", "illit");
// → { has_violation: true, violations: ["Y2K"],
//     suggestion: "Y2K 是 3代 语法; 5代 ILLIT 应走 暗黑科技 / AI 后人类" }
```

### 🧑‍⚖️ Bonus · User-as-Judge (v3.1)

用户与 idol 评审团并肩评议 · 拥有 **veto / override / 偏好学习** 三大权力。

```js
import { tallyWithUser, castUserVote } from "./engine/user-jury.mjs";

// council 全 pass, 但用户 veto
const result = tallyWithUser(councilVotes, castUserVote("reject", 2, "色调不符"));
// → { final_verdict: "user_veto", audit_trail: [...] }
```

---

## 🚀 一行安装

```bash
npx --yes github:SuanFishXYY/kpop-design-system
```

自动注册到 6 个 CLI:
- GitHub Copilot CLI (`~/.copilot/skills/`)
- Claude Code (`~/.claude/skills/`)
- Codex CLI / Gemini CLI / Antigravity / 通用 agents

装完即用, **无需手动 `/skill add`**。

---

## 🎯 全模式 Demo

```bash
git clone https://github.com/SuanFishXYY/kpop-design-system.git
cd kpop-design-system

# v3 4 大支柱
node examples/era-demo.mjs           # Era Universe
node examples/cycle-demo.mjs         # Comeback Cycle
node examples/coherence-demo.mjs     # 5 媒介一致性
node examples/generation-demo.mjs    # 代际审美 lint

# 核心引擎
node examples/voting-demo.mjs        # 加权投票 + veto
node examples/routing-demo.mjs       # brief → 召唤路由
node examples/user-jury-demo.mjs     # 用户成为评委 (v3.1)

# 交互式
node bin/review.mjs --brief="TWICE Fancy era landing"
```

---

## 📚 文档

| 文档 | 内容 |
|------|------|
| [`docs/ERA-UNIVERSE.md`](docs/ERA-UNIVERSE.md) | 52 团 / 35 era · Era 引擎手册 |
| [`docs/COMEBACK-CYCLE.md`](docs/COMEBACK-CYCLE.md) | 7 节点回归协议 |
| [`docs/TOUCHPOINT-COHERENCE.md`](docs/TOUCHPOINT-COHERENCE.md) | 5 媒介物理补偿表 |
| [`docs/GENERATION-AESTHETICS.md`](docs/GENERATION-AESTHETICS.md) | 4 代审美时间线 |
| [`docs/USER-AS-JUDGE.md`](docs/USER-AS-JUDGE.md) | 用户票席 / Override 协议 |

---

## 📊 测试

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
# → 40 PASS
```

**总计 86/86 PASS** · `dispatch 25 + voting 7 + routing 14 + eras 10 + cycle 5 + coherence 6 + generation 7 + user-jury 6 + user-prefs 6`

---

## 🏛️ 议会构成

```
┌─────────────────────────────────────────────────────┐
│          🎤 K-pop Design Congress                    │
├─────────────────────────────────────────────────────┤
│ 👥 186 idols       · 个体设计师 (tier_0/tier_1)     │
│ 🏛️ 52 group souls  · 团魂 (group_anchor 一票否决)   │
│ 🌌 35 curated eras · 12 顶级团每张专辑独立宇宙       │
│ 🧑‍⚖️ 7 entertainment judges · JYP/YG/SM/HYBE 等评委 │
│ 🎶 45 fandoms      · 粉丝团 audience proxy           │
│ 🧑 1 user seat     · 你 (v3.1 加入 council)         │
└─────────────────────────────────────────────────────┘
```

---

## 📜 协议

MIT · 来自 [SuanFishXYY](https://github.com/SuanFishXYY)

> **2026 update**: v3.0 K-pop 工业级视觉策略系统全套上线 · v3.1 用户成为评委
