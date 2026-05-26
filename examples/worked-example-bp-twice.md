# 📋 Worked Example · BLACKPINK × TWICE 跨厂牌 comeback landing

真实跑通 `/kpop design` 工作流 · v2.2.0 · 输出可落地的设计 brief.

## 🎯 BRIEF (用户输入)

> "BLACKPINK × TWICE 跨厂牌 comeback landing 页 · 高端奢华 + 元气甜美双 hero"

## ⚙️ Phase 1 · 引擎调用 (synthesizeDesignBrief)

引擎实跑输出 (摘要):

```
Lineup
  panel:      [jyp, teddy, yg]
  anchors:    [BLACKPINK, TWICE]
  audience:   [BLINK, ONCE]
  performers: 13

Palette
  bp:    primary=#FF1493
  twice: primary=#FFCDD2
  all_hex: #FF1493, #FFCDD2

Mood
  union: [luxury, sharp, bold, bright, sweet, playful]

Motion
  bpm_avg: 132
  hint: explosive · spring+overshoot · 150-300ms · "高能爆炸 · 适合娱乐/活动页"

Typography (推荐栈)
  - display: Playfair Display / Cormorant (奢华衬线)  ← luxury 命中
  - headline: Inter Black / Helvetica Bold (锐感无衬线) ← sharp 命中
  - accent: Quicksand / Nunito (圆角无衬线·甜系)       ← cute 命中

Constraints
  jyp:   noise level + 真诚共鸣 + Half Korean swagger
  teddy: 硬核 hip-hop + 极致 mood + producer 视角 ("sound first")
  yg:    swag + 黑色滤镜 + 个人 charisma + hip-hop 底色

Signals
  rivalry: TRUE  (3 代两强 · 与师姐 2NE1 同社传承张力)
  cross_label: TRUE  (JYP × YG)
  fusion: TRUE
```

## 🎨 Phase 2 · LLM 设计 Brief 输出

### Palette (3 anchor 色 + 1 中性)

| Token | Hex | 来源 | 用途 |
|-------|-----|------|------|
| `--color-primary-bp` | `#FF1493` | bp.primary | BLACKPINK hero 主色 + CTA |
| `--color-primary-tw` | `#FFCDD2` | twice.primary | TWICE hero 主色 + 次级 CTA |
| `--color-accent-gold` | `#FFD700` | bp.accent (frontmatter) | 双 hero 中间分隔 / 奖项徽章 |
| `--color-bg-dark` | `#0A0A0A` | yg manifesto "黑色滤镜永不掉色" | bp 区背景 |
| `--color-bg-light` | `#FFFAF0` | twice mood "bright + sweet" | twice 区背景 |

### Typography Stack

- **Display (bp 区)**: `Playfair Display 800` — 奢华衬线对应 "luxury"
- **Headline (双区通用)**: `Inter Black` — 锐感无衬线对应 "sharp"
- **Accent (twice 区)**: `Quicksand 600` — 圆角无衬线对应 "sweet/playful"
- **Body**: `Inter 400` — 中性方案

### Motion

- **Tempo**: explosive (BPM 132 来自 "Kill This Love")
- **Easing**: `cubic-bezier(.34,1.56,.64,1)` (spring + overshoot)
- **Duration**: 150-300ms
- **关键交互**: hero 切换 250ms · CTA hover 150ms · 滚动视差 300ms

### IA / 组件清单 (双 hero 并峙)

```
┌─────────────────────────────────────────┐
│  Hero · 双区并峙 (左 BP / 右 TWICE)      │
│  - 中间垂直金色分隔线 (--accent-gold)    │
│  - 各自 CTA + 各自 KV                    │
├─────────────────────────────────────────┤
│  联袂 Section · "Together but Distinct"  │
│  - 不写"我们", 用"她们 × 她们"            │
├─────────────────────────────────────────┤
│  Track Showcase · 双方代表曲并列          │
│  - BP: Kill This Love / Pink Venom        │
│  - TW: Fancy / Feel Special               │
├─────────────────────────────────────────┤
│  Fandom 入口 · BLINK / ONCE 各自入口     │
└─────────────────────────────────────────┘
```

### Copy Tone

**bp 区**: 对决式 / "in your area" / 禁用"我们一起" / 用"我 × 你"  
**twice 区**: 治愈式 / "Feel Special" / 禁用攻击性词 / 保留"花束"意象  
**联袂区**: "Together but Distinct" / 不写"融合", 写"同台"  
**Headline 示范**:
- BP hero: "BLACKPINK in your area. Again."
- TW hero: "TWICE — Nine girls, one bouquet, full bloom."
- 联袂: "Two armies. One stage. No compromise."

### 信号约束附录

- **⚔️ Rivalry 触发** → 必须双 hero 并峙, 禁止合并视觉; 中间金色分隔线即"张力锚点"
- **🌐 Cross-label gate** → JYP + YG 双方 logo 在 footer 都需署名, 视觉地位均等
- **🔀 Fusion 触发** → 保留 fusion_rules: "对决式语言不可丢" ← 联袂区文案严格遵守

### 风险与权衡

| 风险 | 触发 | 缓解 |
|------|------|------|
| BLINK 觉得 BP 被甜化 | twice 色侵入 BP 区 | 严格分区, 中间金色分隔 |
| ONCE 觉得 TWICE 被压暗 | yg "黑色滤镜" 全局 | twice 区强制 light bg |
| 跨厂牌商务卡稿 | label 协议 | footer 等大 logo + 各自署名 |

## 🗳 Phase 3 · 议会投票 (模拟 voteSimulator)

LLM 替每个 agent 写票:

```
panel · jyp: YES (noise level ✓ · 真诚 ✓ · twice 部分保留 swagger)
panel · teddy: YES (sound 视角认可 BPM 132 explosive motion)
panel · yg: YES (黑色滤镜在 bp 区保留 · 双 hero 不让 bp 让步)
anchor · bp: YES (in your area DNA 保留 · 禁用"我们"已遵守)
anchor · twice: YES (花束意象保留 · light bg 守住 candy pop)
performer × 13: YES (各自 specialty 都有体现位)
audience · BLINK: YES (BP 视角买单率高)
audience · ONCE: YES (TWICE 视角买单率高)
```

加权得分: panel 15 + anchor 6 + performer ~26 + audience 2 = **~49**  
评审不署名: 0 · 团代表不署名: 0 → **PASS**

## ✅ Phase 4 · 最终决议

**通过** · 加权得分 ~49 · 零否决 · 可进入视觉稿阶段.

## 📝 Phase 5 · 沉淀

本档案作为「跨厂牌双 hero comeback landing」模板. 后续类似 BRIEF (e.g. aespa × IVE, NewJeans × LE SSERAFIM) 可复用 IA 框架, 替换 anchor DNA 即可.

---

> 这就是 `/kpop design` 的真实输出形态: **不止氛围, 是真能落地的 brief**. 引擎给数据 + LLM 给收敛, 各司其职。
