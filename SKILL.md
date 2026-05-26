---
name: kpop-design-system
description: "KPOP Design System v1.4 · KPOP女团圣人议会 · 116 idol + 45 团魂 + 7 评委 + 45 粉丝团 · 5 层议会架构 · 团色 HEX palette + signature_tracks 主打歌 · 哲学驱动多智能体 UI 设计语言体系 · Layer 5 评委(weight=5 portfolio veto) > 团魂(3 全 veto · 含 palette/tracks) > Tier 0(2) > Tier 1(1.5) > 粉丝团(1 user_proxy) · 加权陪审团 2/3 表决 · 真投票引擎 (voting.mjs + dispatch.mjs · 18+7 测试 PASS) · 跨团 fusion + 跨 label gate · Activate on '/kpop', '/女团', '/idol-congress', '/kpop-design'. Trigger phrases: '女团', 'kpop', 'idol', 'TWICE', 'BLACKPINK', 'IVE', 'NewJeans', 'aespa', '议会', 'congress'."
version: 1.4.0
author: 算鱼工作�?license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, philosophy, onboarding, ui, modal, wizard, hero, animation, copywriting, brand-voice, ai-native, korean, chinese]
---

# 🎤 KPOP 设计系统 · The Idol Congress · v1.4

> 🎯 **快速召唤**: 在 Copilot / Claude / Codex / Gemini / Antigravity 任一 CLI 输入 /kpop 或 /女团 即可强制激活本 skill 进入议会模式。
> *一个舞台, 116 个 idol + 45 团魂 + 7 评委 + 45 粉丝团。从用户登录的前 3 秒, 到第 3000 次点击, 每一寸像素都是一场 comeback stage。*

## 🎙 议会构成 · 5 层架构

| Layer | 数量 | vote weight | veto | 构成 |
|-------|------|-------------|------|------|
| 🏛 **评委 (judges/)** | 7 | **5** | portfolio_only | JYP / YG / SM / HYBE / ADOR / Starship / THEBLACKLABEL 经纪人 |
| 👯 **团魂 (groups/)** | 45 | 3 | yes | 每个 K-pop 团的"集体灵魂" · 含 palette(HEX) + signature_tracks |
| 🌟 Tier 0 (主力 idol) | 71 | 2 | no | 8 大热门全员 + 热门团主力 |
| 💎 Tier 1 (辅助 idol) | 45 | 1.5 | no | 各代 leader + 跨团 helpers |
| 💗 **粉丝团 (fandoms/)** ✨v1.4 | 45 | 1 | no | ONCE/BLINK/DIVE/BUNNIES/MY... · user_proxy 视角 |

总计: **7 评委 + 45 团魂 + 116 idol + 45 粉丝团** · 5 层议会

## 🎨 v1.4 新增 · A · 团色 HEX + C · 主打歌

每个团魂 frontmatter 现含:
- `palette: { primary, secondary, accent }` — 团代表色 HEX
- `mood_keywords: [...]` — 3 个气质词
- `signature_tracks: [3 首]` — 主打歌 (title/year/mood/bpm)

LLM 在 brief 决议时可直接消费这些字段输出视觉方案。

## ⚙️ 真投票引擎 (engine/)

- `engine/voting.mjs` — 加权陪审团 (≥2/3 通过 / 评委一票否决 > 团魂一票否决)
- `engine/dispatch.mjs` — brief → 召集 → fusion 校验 → 跨 label gate → 投票 (含 fandom)
- 测试: voting 7/7 + dispatch 18/18 = **25/25 PASS**

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