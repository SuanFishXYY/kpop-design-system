---
name: kpop-design-system
description: "KPOP Music Awards · 年度歌谣大赏设计系统 v2.0 · 116 舞台担当 + 45 团代表 + 7 评审团 + 45 现场投票 + 5 奖项类目 + 5 传承大奖 · weighted scoring + 评委不署名 veto + 跨社合作 gate + 年度对决 RIVALRY · 颁奖典礼叙事 (Awards Show Narrative) · 真打分引擎 (voting.mjs + dispatch.mjs · 25+7 PASS) · Activate on '/kpop', '/女团', '/idol-congress', '/kpop-awards', '/kpop-design'. Trigger phrases: '女团', 'kpop', 'idol', 'TWICE', 'BLACKPINK', 'IVE', '颁奖', 'awards', '歌谣大赏', 'comeback', 'debut'."
version: 2.0.0
author: 算鱼工作�?license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, philosophy, onboarding, ui, modal, wizard, hero, animation, copywriting, brand-voice, ai-native, korean, chinese]
---

# 🏆 KPOP 设计系统 · 年度歌谣大赏 · v2.0

> 🎯 **快速召唤**: 在 Copilot / Claude / Codex / Gemini / Antigravity 任一 CLI 输入 /kpop 或 /女团 即可强制激活本 skill 进入**颁奖典礼模式**。
>
> *一座颁奖典礼舞台。116 舞台担当 + 45 团代表 + 7 评审团 + 45 现场投票席。从用户登录的前 3 秒, 到第 3000 次点击, 每一寸像素都在角逐年度大赏。*

## 🎙 不是议会, 是 **年度歌谣大赏** (Music Awards Show)

| 旧叙事 (议会) | 新叙事 (歌谣大赏) | 现实映射 |
|------|------|------|
| 议会 (council) | **舞台阵容 / Stage Lineup** | KBS 가요대축제 节目单 |
| 召集 (summon) | **编排上台 / setLineup** | 节目组定 lineup |
| 评委 (judges) | **评审团 / Awards Panel** | 经纪公司代表 |
| 团魂 (group_soul) | **团代表 / Group Anchor** | 队长上台发言 |
| idol | **舞台担当 / Performer** | 现场表演 |
| 粉丝团 (fandom) | **现场投票 / Audience Vote** | 场内+线上观众投票 |
| 投票 (vote) | **评审打分 / Score** | 评审打分 + 观众投票综合 |
| veto | **评委不署名 / No Award** | 评委拒绝背书 |
| pass | **奖项归属 / Award Granted** | 大奖颁出 |
| reject | **空奖位 / No Award** | "本奖项空缺" |
| fusion | **合作舞台 / Collab Stage** | MAMA 合作舞台 |
| rivalry | **年度对决 / Awards Showdown** | "三代两强同台对决" |
| stage 模板 | **奖项类目 / Award Category** | 最佳新人/年度专辑 |
| lineage | **传承大奖 / Legacy Lineage** | 传承奖提名链 |

## 🏆 5 层评分结构 (Awards Scoring)

| Layer | 数量 | weight | veto | 角色 |
|-------|------|--------|------|------|
| 🎙️ **评审团 (judges/)** | 7 | **5** | portfolio_only | JYP/YG/SM/HYBE/ADOR/Starship/THEBLACKLABEL |
| 🎤 **团代表 (groups/)** | 45 | 3 | yes | 每团出场代表 · 含 palette + tracks + rivals |
| ✨ **舞台担当 (Tier 0)** | 71 | 2 | no | 主推 idol · 真上台 |
| 💫 **舞台助攻 (Tier 1)** | 45 | 1.5 | no | 跨团助攻 |
| 📣 **现场投票 (fandoms/)** | 45 | 1 | no | ONCE/BLINK/DIVE... 观众视角 |

总计: **218 角色** · 真打分引擎 · 32/32 PASS

## 🎬 5 大奖项类目 (Award Categories · v1.5 stages 重命名)

`stages/` 5 个常见 brief 场景化预设, 对应 5 大奖项类目:

| Slug | 奖项类目 | 现实映射 |
|------|------|------|
| 🎬 debut | **最佳新人** Best New Artist | "今年出道哪个团最强" |
| 🔄 comeback | **年度回归** Best Comeback | 三专四专级别回归 |
| 🎤 concert | **年度演唱会** Best Concert KV | 演唱会主视觉大奖 |
| 🤝 collab | **最佳合作舞台** Best Collab | MAMA 合作舞台奖 |
| 🌐 landing | **最佳官方品牌** Best Brand KV | 官网/品牌主视觉 |

## 🧬 5 大传承大奖 (Legacy Lineage · v1.5 lineages)

| Slug | 类目 | 谱系 (2代→5代) |
|------|------|------|
| 🎤 main_vocal | **主唱传承奖** | SNSD-Taeyeon → TWICE-Jihyo → IVE-Wonyoung → ILLIT-Iroha |
| 🔥 rap_line | **Rap 传承奖** | 2NE1-CL → BLACKPINK-Jennie → aespa-Karina → BABYMONSTER-Asa |
| 💎 visual_center | **Visual 传承奖** | SNSD-Yoona → TWICE-Tzuyu → IVE-Wonyoung → NewJeans-Hanni |
| 👑 leader_dna | **Leader 传承奖** | SNSD-Taeyeon → TWICE-Jihyo → IVE-Yujin → BABYMONSTER-Ruka |
| 💃 dance_machine | **Dance 传承奖** | TWICE-Momo → ITZY-Yeji → aespa-Karina → BABYMONSTER-Rora |

## ⚔️ 年度对决 (Awards Showdown · v1.5 rivalry)

颁奖典礼最大看点: **同台对决**。16 个团代表互列 rival, 触发 `rivalry_check.pairs`:
- 三代两强: BLACKPINK ↔ TWICE
- 四代两强: aespa ↔ IVE
- HYBE 内战: NewJeans ↔ ILLIT
- (G)I-DLE ↔ ITZY (Self-Made vs JYP-Made)

**评分 guidance**: "颁奖典礼须保留对决张力, 禁止强行调和"

## 🎨 团代表数据资产 (Group Anchor Assets)

每个 anchor frontmatter 含:
- `palette: {primary, secondary, accent}` — 团代表色 HEX (上台舞美色)
- `signature_tracks: [3 首]` — 出场打歌主打 (title/year/mood/bpm)
- `mood_keywords` — 气质标签
- `rivals` + `rivalry_narrative` — 同台对决名单

## ⚙️ 真打分引擎 (engine/)

- `engine/voting.mjs` — 加权评分 (≥2/3 通过 / 评委不署名 > 团代表不署名)
- `engine/dispatch.mjs` — 提案 → 编排 lineup → 合作 check → 跨社 check → 对决 check → 评分 → 奖项归属
- **新别名 API** (v1.6 颁奖典礼叙事):
  - `setLineup(brief)` = `summonCouncil(brief)`
  - `judgeProposal(brief)` = `dispatchBrief(brief)`
  - `buildAwardsStage(brief)` / `scoreAwardsStage(brief)`
- 测试: voting 7/7 + dispatch 25/25 = **32/32 PASS**

## 🔀 跨团融合 + �?label gate

- 每团 `fusion_compatible` 白名�?+ `fusion_rules` 不可丢底�?- �?label brief (e.g. TWICE × BLACKPINK) �?**必须 JYP + YG 双评委同时到�?* 否则自动 block
## 🎤 8 大全员议会团
- **TWICE**: Nayeon, Jeongyeon, Momo, Sana, Jihyo, Mina, Dahyun, Chaeyoung, Tzuyu
- **BLACKPINK**: Jisoo, Jennie, Rosé, Lisa
- **IVE**: Yujin, Gaeul, Rei, Wonyoung, Liz, Leeseo
- **NewJeans**: Minji, Hanni, Danielle, Haerin, Hyein
- **aespa**: Karina, Giselle, Winter, Ningning
- **ITZY**: Yeji, Lia, Ryujin, Chaeryeong, Yuna
- **LE SSERAFIM**: Chaewon, Sakura, Yunjin, Kazuha, Eunchae
- **(G)I-DLE**: Soyeon, Miyeon, Minnie, Yuqi, Shuhua
- **Red Velvet**: Irene, Seulgi, Wendy, Joy, Yeri
- **MAMAMOO**: Solar, Moonbyul, Wheein, Hwasa
- **ILLIT**: Yunah, Minju, Moka, Wonhee, Iroha
- **BABYMONSTER**: Ruka, Pharita, Asa, Ahyeon, Rami, Rora, Chiquita

## 🗳 议会流程 (复用算鱼成熟机制)

1. **bench-matcher 5 步召�?*: 解析 BRIEF �?识别 UI 维度 �?匹配 idol UI specialty �?选出候选池
2. **候选池**: 通常 12-15 �?(cap 15)
3. **议会讨论**: �?idol 从其 ui_specialty 视角发言
4. **陪审团表�?*: 加权 �?/3 通过, 否则 REJECT
5. **决议**: 输出统一 UI 方案

## 📋 触发示例

- "�?momo 的节奏感设计动效" �?召唤 twice-momo (动效编排)
- "�?IVE 公主感设�?hero" �?召唤 ive-yujin + ive-wonyoung
- "�?BLACKPINK 极简奢华�?landing" �?召唤 bp-jisoo + bp-jennie + bp-rose
- "召集 KPOP 议会评审这个 design" �?全员议会

## 🎯 116 Performer 真激活 (v2.4.0 · 不是投票傀儡, 是 116 个专业视角)

v2.3 之前的盲点: **116 idols 都有 `ui_specialty` + `personality` + `vibe`, 引擎却只读 stage_name + attitude**——他们等于"投票计数器".

v2.4.0 全部激活. 每个 idol 是一个**设计维度的担当**.

### 新 API

```js
import { aggregatePerformerDNA, getPerformersBySpecialty } from "kpop-design-system/engine/synthesize.mjs";

// 把召唤的 performer 按 ui_specialty 关键词聚类
const perf = aggregatePerformerDNA(council);
// perf.by_specialty = { typography: [...], motion: [...], hero: [...], copy: [...], ... }

// LLM 写 brief 时: "我现在写 typography 段, 谁 own?"
const typoOwners = getPerformersBySpecialty(council, "typography", 3);
// [{ name: "Jennie", group: "BLACKPINK", ui_specialty: "Human Chanel · 极简奢华 typography", ... }]
```

### 10 个设计维度 (自动分类)

`typography` · `motion` · `palette` · `layout` · `brand` · `hero` · `interaction` · `illustration` · `photography` · `copy`

### 实跑示例 (BLACKPINK × TWICE landing)

| 维度 | 担当 (按 ui_specialty 关键词命中) |
|------|-----|
| typography | Jennie (Human Chanel · 极简奢华) |
| motion | Lisa (爆发力 hook) + Rosé (旋律 spacing) + Momo (微交互节拍) |
| hero | Jisoo (花路高级感) + Nayeon (兔牙 hero CTA) + Tzuyu (冷静 visual 锚) |
| copy | Chaeyoung (野性 tagline) + Jihyo (brand voice) + Sana (撒娇 microcopy) |
| layout | Jeongyeon (中性侠气 form layout · clean grid) |
| brand | Jihyo (议会主持 · brand voice 锚) |

### synthesizeDesignBrief 新增字段

`dna.performer_dna = { total, specialty_coverage, by_specialty, dna_list }`

LLM 写 brief 时可以按维度"派工"——typography 段交给 Jennie 的视角, motion 段交给 Lisa+Momo, hero 双 hero 用 Jisoo+Nayeon. **设计稿不再是 LLM 一个人的猜测**, 是 116 个专业视角的协同.

详见 [`examples/performer-demo.mjs`](examples/performer-demo.mjs).

## 💰 Cost-Aware Model Routing (v2.3.0 · 多任务别一锅烩用最贵的)

100+ agent 投票全用 Opus = 烧钱+慢; 全用 Haiku = panel veto 质量崩。**分层路由才是颗粒度**。

### 三档定义 (engine/routing.mjs)

| 档位 | 相对成本 | 推荐模型 | 用于 |
|------|---------|---------|------|
| **premium** | 10x | claude-opus-4.7 / gpt-5.5 / gemini-2.5-pro | **panel** (7 评审 · veto 权 · manifesto 复杂推理) |
| **standard** | 3x | claude-sonnet-4.6 / gpt-5.4 / gemini-2.5-flash | **group_anchor** (45 团代表 · DNA 包推理) |
| **fast** | 1x | claude-haiku-4.5 / gpt-5-mini / gemini-2.0-flash | **performer + audience** (116+45 · 一句话视角) |

### API

```js
import { getModelTier, getRecommendedModel, getRoutingPlan } from "kpop-design-system/engine/routing.mjs";

// 单个 agent
getModelTier({ layer: "panel" });              // → "premium"
getRecommendedModel({ layer: "audience" }, "claude"); // → "claude-haiku-4.5"

// 整个 council 出路由计划
const { plan, summary } = getRoutingPlan(council, "claude");
// plan = { premium: [...], standard: [...], fast: [...] }
// summary = { total_agents, cost_units, savings_pct }
```

### 实跑省钱效果

| BRIEF | total agents | smart cost | naive all-premium | 💰 savings |
|-------|------|------|------|------|
| BLACKPINK × TWICE landing | 20 | 51 | 200 | **75%** |
| IVE B 端 dashboard | 12 | 25 | 120 | **79%** |

### Frontmatter override

任何 agent 可以在 frontmatter 加 `model_tier: premium` 强制升档 (e.g. 某 t1 担当因有特殊话语权要给 premium).

### 在 Task tool / sub-agent harness 里用

```js
// Spawn 投票 sub-agents 时按 plan 分档
for (const a of plan.premium) {
  await Task({ agent_type: "general-purpose", model: a.model, prompt: votePrompt(a) });
}
for (const a of plan.fast) {
  await Task({ agent_type: "explore", model: a.model, prompt: votePrompt(a) });
}
```

详见 [`examples/routing-demo.mjs`](examples/routing-demo.mjs) (跑 3 个 BRIEF 看真实分桶).

## 🛠 Design Brief Discovery (v2.2.0 · 真设计工具)

`/kpop awards` 是叙事秀, **`/kpop design`** 是真工具——拿到可落地的 palette/typography/IA/motion/copy tone.

### 引擎层 · `synthesizeDesignBrief(brief)` (engine/synthesize.mjs)

```js
import { synthesizeDesignBrief } from "kpop-design-system/engine/synthesize.mjs";
const dna = synthesizeDesignBrief("BLACKPINK × TWICE comeback landing");
```

输出**「设计 DNA 包」**:
- `palette.all_hex` — 召唤 anchor 的 hex 汇总
- `mood.intersection / union / distribution` — 多 anchor 共有/全集/分布
- `motion.hint` — 基于 BPM 区间的 tempo/easing/duration 推荐
- `typography.suggested_stack` — 基于 mood 关键词的字体栈
- `copy_tone` — panel + anchor manifesto 提炼的口吻线索
- `constraints` — 评审 style + manifesto + veto_scope
- `signals` — rivalry/cross_label/fusion 三大触发

### LLM 设计层 (我 · 在 loop 里收敛 DNA → 出 brief)

LLM 读 DNA 包后产出:
1. **Palette token 表** (从 all_hex 选 3-5 色, 标注用途)
2. **Typography stack 收敛** (从 suggested_stack 选最终)
3. **Motion 方案** (沿用 hint 或微调)
4. **IA / 组件清单** (匹配 BRIEF 场景 + signals 约束)
5. **Copy tone + headline 示范**
6. **风险与权衡** (rivalry/cross_label 显式处理)

### 议会决议层 · `dispatchBrief(brief, voteSimulator)` (engine/dispatch.mjs)

LLM 替每个 agent 投票 (针对 Phase 2 设计稿) → 加权决议 → PASS / VETO.

### 完整工作流

详见 [`workflows/design-brief.md`](workflows/design-brief.md) (5 阶段协议 + 8 条 LLM 行为约束).  
真实跑通案例: [`examples/worked-example-bp-twice.md`](examples/worked-example-bp-twice.md).

### 何时该用 `/kpop design` vs `/kpop awards`

| 目的 | 选 |
|------|------|
| 真落地的设计 brief / 需求挖掘 | **`/kpop design`** |
| 戏剧性叙事秀 / 演示给客户 | `/kpop awards` |
| 跨流派碰撞挖需求 (rivalry/cross_label 信号) | **`/kpop design`** |

## 🎤 /kpop awards · 年度歌谣大赏典礼 (v2.1.0 LLM 驱动叙事)

当用户输入 `/kpop awards <BRIEF>` 或 `召开年度歌谣大赏 <BRIEF>` 时, 进入**颁奖典礼实时叙事模式**:

### 入场阶段 (Red Carpet)
- 介绍今晚的 BRIEF 主题, 选定的 **lineup** (用 `setLineup`/`summonCouncil` 召集 group_anchor + panel + audience)
- 列出今晚的 **annual showdown** (rivalry tension) — 如 BLACKPINK ↔ TWICE 同台
- 用 **舞台担当语气** 报幕, 不是工程师口吻

### 提名阶段 (Nomination)
- 每个 **panel** (7 评审) 给出提名理由 (从 portfolio_only 视角)
- 每个 **group_anchor** 给出团代表观点 (从 group_soul + palette + tracks 视角)
- 每个 **performer_t0/t1** 给出舞台担当视角发言

### 投票阶段 (Live Voting)
- 调用 `judgeProposal`/`dispatchBrief` 实跑投票
- 用 **现场播报口吻** 念出每一票: "🏆 panel · ux-master 投 yes, 理由是…"
- **veto 时机** = 评审不署名 / 团代表不署名 → 用红色警报口吻报出

### 颁奖阶段 (Award Ceremony)
- 5 大奖项 (debut / comeback / concert / collab / landing 任选匹配的 `award_category`)
- 传承大奖 (legacy_lineage: main_vocal / rap_line / visual_center / leader_dna / dance_machine 任选)
- 年度对决揭晓 (若 rivalry 触发, 宣布今晚的胜方)

### 闭幕 (Encore)
- 总结今晚的 5 层加权得分 (panel ×5 / group_anchor ×3 / performer_t0 ×2 / performer_t1 ×1.5 / audience ×1)
- 给出 **最终决议** (PASS / REJECT) + 一句 K-pop 风格的结语

### 行为约束
1. 全程不写工程师术语, 用"现场""灯光""掌声""红毯""担当""C 位"
2. 必须真实调用 engine (`buildAwardsStage` → `scoreAwardsStage`), 不能纯虚构
3. 输出格式: emoji 报幕行 + 引言块 + 短段落, 不堆 markdown 表格
4. 若 BRIEF 太短 / 不清楚, 先用 ask_user 问"今晚是什么舞台？" 再开场

## 🌐 触发短语 (Activation Phrases)

/kpop · /kpop design · /kpop awards · /女团 · /idol-congress · /kpop-design · 召开年度歌谣大赏 · 设计 brief 挖掘 · "kpop", "女团", "idol", 各团英文名
## �?与算鱼设计系统的关系

KPOP 议会 v1.0 �?[suanfish-design-system](https://github.com/SuanFishXYY/suanfish-design-system) 共享同一架构 (圣人议会 + 加权陪审�?+ 4 律跨学科扩展)。区�?

| 维度 | 算鱼 (suanfish) | KPOP (kpop) |
|------|-----------------|--------------|
| 圣人�?| 哲学�?艺术�?音乐�?| KPOP 女团 idol |
| 触发风格 | 学术�?哲学�?| 流行/娱乐/视觉强烈 |
| 适用场景 | 严肃 B �?/ SaaS / 工具�?| 娱乐 / C �?/ 内容平台 / 时尚 |

未来 v2.0 可联袂议�? 让黑格尔�?momo 同台辩论�?
## 📦 安装

`ash
npx --yes github:SuanFishXYY/kpop-design-system
`

自动注册�?6 平台 CLI (Copilot/Claude/Codex/Gemini/Antigravity/通用 agents)�?
## 📄 License

MIT · 算鱼工作�?· 2025