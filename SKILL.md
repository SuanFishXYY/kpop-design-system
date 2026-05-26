---
name: kpop-design-system
description: "KPOP Music Awards · 年度歌谣大赏设计系统 v1.6 · 116 舞台担当 + 45 团代表 + 7 评审团 + 45 现场投票 + 5 奖项类目 + 5 传承大奖 · weighted scoring + 评委不署名 veto + 跨社合作 gate + 年度对决 RIVALRY · 颁奖典礼叙事 (Awards Show Narrative) · 真打分引擎 (voting.mjs + dispatch.mjs · 25+7 PASS) · Activate on '/kpop', '/女团', '/idol-congress', '/kpop-awards', '/kpop-design'. Trigger phrases: '女团', 'kpop', 'idol', 'TWICE', 'BLACKPINK', 'IVE', '颁奖', 'awards', '歌谣大赏', 'comeback', 'debut'."
version: 1.6.0
author: 算鱼工作�?license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, philosophy, onboarding, ui, modal, wizard, hero, animation, copywriting, brand-voice, ai-native, korean, chinese]
---

# 🏆 KPOP 设计系统 · 年度歌谣大赏 · v1.6

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

## 🌐 触发短语 (Activation Phrases)

/kpop · /女团 · /idol-congress · /kpop-design · "kpop", "女团", "idol", 各团英文�?
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