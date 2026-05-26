---
name: kpop-design-system
description: "KPOP Design System v1.0 — KPOP女团圣人议会 · 97 idol agent · 4代际 36 团 · 哲学驱动多智能体UI设计语言体系 · Tier 0 全员 64 (8大热门+RV+MMM+ILLIT+BABYMON) · Tier 1 代际 leader 33 · 加权陪审团 2/3 表决 · Activate on '/kpop', '/女团', '/idol-congress', '/kpop-design'. Trigger phrases: '女团', 'kpop', 'idol', 'TWICE', 'BLACKPINK', 'IVE', 'NewJeans', 'aespa', '议会', 'congress'. Auto-loads on UI design/audit/refactor: hero/landing/dashboard/modal/animation/copywriting. bench-matcher 5 步召集 → 候选 → cap 15 邀请 → 议会 → 2/3 加权表决。"
version: 1.0.0
author: 算鱼工作室
license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, philosophy, onboarding, ui, modal, wizard, hero, animation, copywriting, brand-voice, ai-native, korean, chinese]
---

# 🎤 KPOP 设计系统 · The Idol Congress · v1.0

> 🎯 **快速召唤**: 在 Copilot / Claude / Codex / Gemini / Antigravity 任一 CLI 输入 /kpop 或 /女团 即可强制激活本 skill 进入议会模式。也可直接说 "用 TWICE 风格设计 XXX" / "召集女团议会" 等自然语言。

> *一个舞台, 九十七位 idol。从用户登录的前 3 秒, 到第 3000 次点击, 每一寸像素都是一场 comeback stage。*

## 🎙 议会构成

| Tier | 数量 | vote weight | 构成 |
|------|------|-------------|------|
| Tier 0 (全员议会) | 64 | 2 票 | 8 大热门团 全员 + RV/MAMAMOO/ILLIT/BABYMONSTER 全员 |
| Tier 1 (代际 leader) | 33 | 1.5 票 | 2-2.5代 16 团 + 3代其他 6 团 + 4代其他 3 团 + 5代其他 8 团 |

总计: **97 人 · 36 团 · 4 代际**

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

1. **bench-matcher 5 步召集**: 解析 BRIEF → 识别 UI 维度 → 匹配 idol UI specialty → 选出候选池
2. **候选池**: 通常 12-15 人 (cap 15)
3. **议会讨论**: 各 idol 从其 ui_specialty 视角发言
4. **陪审团表决**: 加权 ≥2/3 通过, 否则 REJECT
5. **决议**: 输出统一 UI 方案

## 📋 触发示例

- "用 momo 的节奏感设计动效" → 召唤 twice-momo (动效编排)
- "用 IVE 公主感设计 hero" → 召唤 ive-yujin + ive-wonyoung
- "用 BLACKPINK 极简奢华做 landing" → 召唤 bp-jisoo + bp-jennie + bp-rose
- "召集 KPOP 议会评审这个 design" → 全员议会

## 🌐 触发短语 (Activation Phrases)

/kpop · /女团 · /idol-congress · /kpop-design · "kpop", "女团", "idol", 各团英文名

## ⚙ 与算鱼设计系统的关系

KPOP 议会 v1.0 与 [suanfish-design-system](https://github.com/SuanFishXYY/suanfish-design-system) 共享同一架构 (圣人议会 + 加权陪审团 + 4 律跨学科扩展)。区别:

| 维度 | 算鱼 (suanfish) | KPOP (kpop) |
|------|-----------------|--------------|
| 圣人池 | 哲学家/艺术家/音乐家 | KPOP 女团 idol |
| 触发风格 | 学术性/哲学性 | 流行/娱乐/视觉强烈 |
| 适用场景 | 严肃 B 端 / SaaS / 工具类 | 娱乐 / C 端 / 内容平台 / 时尚 |

未来 v2.0 可联袂议会, 让黑格尔和 momo 同台辩论。

## 📦 安装

`ash
npx --yes github:SuanFishXYY/kpop-design-system
`

自动注册到 6 平台 CLI (Copilot/Claude/Codex/Gemini/Antigravity/通用 agents)。

## 📄 License

MIT · 算鱼工作室 · 2025