# 🎤 KPOP Design System

> **"设计不是一个人拍板。是 218 个灵魂的议会合议。"**

[![version](https://img.shields.io/badge/version-3.1.0-pink.svg)](./CHANGELOG.md)
[![tests](https://img.shields.io/badge/tests-86%2F86%20PASS-green.svg)](#)
[![idols](https://img.shields.io/badge/idols-186-purple.svg)](#)
[![groups](https://img.shields.io/badge/groups-52-magenta.svg)](#)
[![eras](https://img.shields.io/badge/eras-35-violet.svg)](#)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

## 🌌 这是什么

这不是一个 UI 工具。

这是一个**世界观**——

把 K-pop 这个全球流行文化最严苛的视觉工业,
反向蒸馏成一套**可代码化的设计哲学**。

```
                  ┌─────────────────────────┐
                  │      你的 brief          │
                  └──────────┬──────────────┘
                             │
              ┌──────────────┴──────────────┐
              │      🏛️  议会召集            │
              │   parseBrief · summon       │
              └──────────────┬──────────────┘
                             │
   ┌─────────────────────────┼─────────────────────────┐
   ▼                         ▼                         ▼
┌────────┐              ┌────────┐               ┌────────┐
│ 🎙️ 评委 │              │ 🎤 团魂  │               │ ✨ idol │
│  7 人  │              │  52 人  │               │ 186 人 │
│ ×5 票  │              │ ×3 票   │               │×1.5-2 │
│ veto   │              │ veto    │               │ no veto│
└────┬───┘              └────┬───┘               └───┬────┘
     └──────────┬────────────┴──────────┬────────────┘
                │                       │
                ▼                       ▼
        ┌───────────────┐       ┌──────────────┐
        │ 📣 粉丝团 ×1   │       │ 🧑 用户 ×1-3 │
        │  45 audience  │       │ veto/override│
        └───────┬───────┘       └──────┬───────┘
                │                       │
                └──────────┬────────────┘
                           ▼
                  ┌─────────────────┐
                  │  陪审团 tally   │
                  │  ≥ 2/3 → PASS   │
                  │  veto → REJECT  │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │  decision 决议  │
                  │  + audit_trail  │
                  └─────────────────┘
```

---

## 🧠 五条哲学律

### ❶ 设计是**多主体的合议**,不是单作者的独白

LLM 容易给出一个"看起来对"的答案。
真实的设计决策从来不是一个人拍板——
它是 art director、brand strategist、motion designer、photography lead、market、粉丝、用户……
**多方角力的产物**。

本系统把这种"多主体性"原封不动地写进代码:
- 7 评审团 (JYP/YG/SM/HYBE...) · `weight × 5` · 持 portfolio_only veto
- 52 团魂 group_anchor · `weight × 3` · 持 group_soul veto
- 186 idol 担当 · `weight × 1.5–2` · 各自 own 一个设计维度
- 45 粉丝团 fandom · `weight × 1` · 观众视角
- 1 用户席 · `weight × 1–3` · 持 override / veto (v3.1)

**brief 不再是 prompt,brief 是召集令。**

### ❷ 设计有**时间维度**,不是平铺的色板

设计不是一张色卡可以概括的。
TWICE 的 *Cheer Up* (2016) 和 *Fancy* (2019) 是**两套完全不同的视觉宇宙**——
前者是粉嫩荧光的青春,后者是工业灰雾紫的冷感。

我们用 **Era Universe** 系统把这种时间性编码进引擎:
- 35 个被精挑细选的 era,每个含: palette / mood / mv_grammar / typography_keywords / forbidden
- 命中 era → 自动 lock 视觉语言, 禁止跨 era 串味

```js
getEraLockedDNA("TWICE Fancy era 化妆品 hero");
// → palette { #2E2E3E · #B8A0C9 · #D4AF7A }
//   mv_grammar "工业空间 + 冷光 + 定格凝视"
//   forbidden ["Y2K 贴纸", "高饱和粉", "校园元素"]
```

**era 不是元数据,era 是合约。**

### ❸ 设计是**时序结构**,不是一张 KV

一次 K-pop comeback 从来不是"出一张 hero 图就完了"——
它是 30 天 7 节点的视觉叙事:

```
D-30 ━━ Logo Teaser            (brand DNA 第一次露面)
D-21 ━━ Concept Photo 1        (色调宣言)
D-14 ━━ Concept Photo 2        (typography + 服装语法)
D-7  ━━ MV Teaser 1            (motion + brand)
D-3  ━━ MV Teaser 2            (motion 高潮预热)
D+0  ━━ MV Release             (全员上线)
D+7  ━━ Music Show (4 周)      (stage + 实时投票)
```

**Comeback Cycle** 把这套节奏写成 dispatch 协议——
每个节点优先召唤匹配的 ui_specialty 担当。
D-7 期的 brief 会自动注入 `mv_grammar`,保证 MV 期视觉语法不漂移。

**设计交付不是终点,是开播。**

### ❹ 设计要对**物理世界**负责

屏幕上的 `#2E2E3E` 印在 photocard 上是另一种灰,
搬到 lightstick LED 又是另一种灰,
打在舞台 par 灯下是第四种灰。

设计师如果只在 Figma 里调色,就是在欺骗物理。

**Multi-touchpoint Coherence** 编码了 5 个媒介的物理补偿:

| 媒介 | 物理性质 | 补偿系数 |
|------|---------|---------|
| MV | sRGB · 屏幕 | 基准 |
| SNS Post | sRGB · 压缩 | brightness +5 |
| Photocard | CMYK · 印刷 | saturation +12 |
| Lightstick | RGB LED · 高对比 | brightness +20 |
| Stage | par 灯 · 偏暖偏曝 | saturation +20, hue -5 |

audit 这五个媒介的设计稿,输出一致性分数 + 每媒介偏差建议。

**视觉不能背叛它要落地的介质。**

### ❺ 设计有**代际语法**,错位即失败

2007 年的 SNSD 不会用 5 代的暗黑科技,
2024 年的 ILLIT 用 Y2K 复古是一种**罪**——
除非她明确标注 retro homage。

```
2代 (~2007-2012)   鲜艳高饱和 + 粉嫩 + 大头特写
3代 (~2013-2018)   Y2K + 杂志大片 + 黑白对照
4代 (~2019-2022)   极简 + AI cyber + 公主 + 校园清爽并存
5代 (~2023+)       暗黑科技 + 监控感 + AI 后人类 + 去性别
```

**Generation Lint** 把这套代际语法编成检测律:
brief 关键词 vs 团 generation 错位 → 警告或拒绝。

```js
checkGenerationAesthetic("ILLIT 用 Y2K 复古风", "illit");
// → violation: "Y2K 是 3代 语法; 5代 ILLIT 应走 暗黑科技 / AI 后人类"
```

**审美有代际,不分清谁穿越谁,设计就是错的。**

---

## 🧑‍⚖️ 用户成为评委 (v3.1)

这套系统不是要把用户排除在外。

v3.1 引入 **User-as-Judge**——
用户与 idol 评审团并肩坐进 council:

- 默认占 1 席 (与团代表 anchor 同级)
- 可自抬权重至 3 票
- 即便 council 全 pass,用户可 **veto** → 强制返工
- 即便 council 全 reject,用户可 **override** → 标注 `user_override:true` 留痕
- 本地偏好学习 (`~/.kpop-design/user-prefs.json` · 不上传):
  - 记录最近 50 次 override
  - 偏好的 era / group / specialty
  - 反复拒绝的提案自动跳过

```js
import { tallyWithUser, castUserVote } from "./engine/user-jury.mjs";

const userVote = castUserVote("reject", 2, "色调和 era 不符");
const result = tallyWithUser(councilVotes, userVote);
// → { final_verdict: "user_veto", audit_trail: [...] }
```

**用户不是上帝,但也不是被告。用户是评委。**

---

## 🚀 一行召唤

```bash
npx --yes github:SuanFishXYY/kpop-design-system
```

自动注册到 6 个 CLI 平台 (Copilot · Claude · Codex · Gemini · Antigravity · 通用 agents)。

装完即用,无需手动 `/skill add`。

---

## 🎬 走进议会

```bash
git clone https://github.com/SuanFishXYY/kpop-design-system.git
cd kpop-design-system

# 五条哲学律的代码 demo
node examples/era-demo.mjs           # ❷ Era Universe
node examples/cycle-demo.mjs         # ❸ Comeback Cycle
node examples/coherence-demo.mjs     # ❹ Multi-touchpoint
node examples/generation-demo.mjs    # ❺ Generation Lint
node examples/user-jury-demo.mjs     # 🧑‍⚖️ User-as-Judge

# 真议会 (交互式)
node bin/review.mjs --brief="TWICE Fancy era landing"
```

---

## 📚 哲学手册

| 文档 | 内容 |
|------|------|
| [`docs/ERA-UNIVERSE.md`](docs/ERA-UNIVERSE.md) | 时间宇宙 · 35 era 大全 |
| [`docs/COMEBACK-CYCLE.md`](docs/COMEBACK-CYCLE.md) | 时序结构 · 30 天 7 节点 |
| [`docs/TOUCHPOINT-COHERENCE.md`](docs/TOUCHPOINT-COHERENCE.md) | 物理补偿 · 五媒介手册 |
| [`docs/GENERATION-AESTHETICS.md`](docs/GENERATION-AESTHETICS.md) | 代际语法 · 2/3/4/5 代时间线 |
| [`docs/USER-AS-JUDGE.md`](docs/USER-AS-JUDGE.md) | 用户票席 · Override 协议 |
| [`CHANGELOG.md`](CHANGELOG.md) | 哲学演进史 |

---

## 🧪 议会的可靠性

```
dispatch  ━━━━━━━━━━━━━  25 PASS
voting    ━━━━━━━━━━━━━   7 PASS
routing   ━━━━━━━━━━━━━  14 PASS
eras      ━━━━━━━━━━━━━  10 PASS
cycle     ━━━━━━━━━━━━━   5 PASS
coherence ━━━━━━━━━━━━━   6 PASS
generation━━━━━━━━━━━━━   7 PASS
user-jury ━━━━━━━━━━━━━   6 PASS
user-prefs━━━━━━━━━━━━━   6 PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          86 / 86
```

**0 fail · 0 skip · 0 todo**。议会决议是真打分,不是 LLM 装。

---

## 🏛️ 系统全貌

| Layer | 数量 | weight | veto |
|-------|------|--------|------|
| 🎙️ 评审团 (judges) | 7 | 5 | portfolio_only |
| 🎤 团魂 (group_anchors) | 52 | 3 | yes (group_soul) |
| ✨ 主推 (performer_t0) | 71 | 2 | no |
| 💫 助攻 (performer_t1) | 45 | 1.5 | no |
| 📣 粉丝团 (fandoms) | 45 | 1 | no |
| 🧑 用户席 (v3.1) | 1 | 1–3 | yes (veto/override) |
| **合计** | **221** | — | — |

35 era · 5 媒介 · 4 代审美 · 30 天 7 节点 · 86/86 tests

---

## 📜 来历

这套系统的**母体**是 [suanfish-design-system](https://github.com/SuanFishXYY/suanfish-design-system)——
一套以哲学家、艺术家、音乐家为 council 的"sage 议会"。

KPOP Design System 是它的**孪生**:
把 council 的人选从黑格尔、塞尚、巴赫换成 Jennie、Wonyoung、Karina,
把适用领域从严肃 B 端 / SaaS / 学术工具迁移到娱乐 / 内容平台 / 时尚消费。

底层架构同源 · 表达语言完全不同。

| 维度 | suanfish | kpop |
|------|----------|------|
| council 池 | 哲学家 / 艺术家 / 音乐家 | KPOP idol |
| 触发风格 | 学术 / 哲学 | 流行 / 视觉强烈 |
| 适用场景 | 严肃 B 端 / SaaS | 娱乐 / C 端 / 时尚 |

未来 v4.0 计划: **联袂议会** — 让黑格尔和 Jennie 同台辩论一个 brief。

---

## 📄 License

MIT · 算鱼工作室 · 2025-2026

> 设计哲学是可以被代码化的。
> 这只是一个开始。
