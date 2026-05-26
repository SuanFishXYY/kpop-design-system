# 🎤 KPOP Design System · The Idol Congress

> KPOP 女团圣人议会 · 116 idol · 45 团魂 · 7 评委 · 4 层议会架构 · 真投票引擎 · 哲学驱动多智能体 UI 设计语言体系

[![version](https://img.shields.io/badge/version-1.3.0-pink.svg)](./CHANGELOG.md)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![idols](https://img.shields.io/badge/idols-116-purple.svg)](#)
[![group_souls](https://img.shields.io/badge/group_souls-45-magenta.svg)](#)
[![judges](https://img.shields.io/badge/judges-7-gold.svg)](#)
[![tests](https://img.shields.io/badge/tests-22%2F22%20PASS-green.svg)](#)

## ⚡ 一键安装

`ash
npx --yes github:SuanFishXYY/kpop-design-system
`

自动注册到 6 大 CLI:
- GitHub Copilot CLI (\~/.copilot/skills/\)
- Claude Code (\~/.claude/skills/\)
- Codex CLI / Gemini CLI / Antigravity / 通用 agents

装完即用, **无需手动 /skill add**。

## 📋 完整名单

- **👉 [116 Idol 大一览表 →](./docs/IDOL-ROSTER.md)** — 按 group 分组 · 完整 idol DNA 表
- **🔍 [按维度反查索引 →](./docs/SPECIALTY-INDEX.md)** — 10 设计维度 → 谁管 typography? 谁管 motion?

## 🎙 议会构成 · 4 层架构 (116 idol)

| Layer | 数量 | weight | veto |
|-------|------|--------|------|
| 🏛 评委 (judges/) | 7 | **5** | portfolio_only |
| 👯 团魂 (groups/) | 45 | 3 | yes |
| 🌟 Tier 0 (主力) | 71 | 2 | no |
| 💎 Tier 1 (辅助) | 45 | 1.5 | no |

### Tier 0 · 主力 idol (71)
8 大热门全员 + RV / MAMAMOO / ILLIT / BABYMONSTER / NMIXX / KATSEYE / MEOVV / Kep1er 等热门团主力

### Tier 1 · 辅助 idol (45)
- 2-2.5代 16 团 leader (SNSD/2NE1/KARA/f(x)/Apink/SISTAR/EXID/miss A 等)
- 3代/4代/5代 其他团 leader 与跨团助攻

### 🏛 评委层 (7)
- 🟢 **jyp** 朴轸永 — TWICE / ITZY / NMIXX
- 🖤 **yg** 杨贤硕 — BLACKPINK / 2NE1 / MEOVV
- 💎 **sm** 李秀满 — SNSD / RV / aespa
- 🌐 **bang-pd** 방시혁 (HYBE) — LE SSERAFIM / ILLIT / KATSEYE
- 🐰 **mhj** 민희진 (ADOR) — NewJeans
- 👑 **starship** 홍승성 — IVE / WJSN / Kep1er
- 🎛️ **teddy** Teddy Park — MEOVV / BP producer

## 🌐 触发方式

| 类型 | 示例 |
|------|------|
| 斜杠命令 | \/kpop\, \/女团\, \/idol-congress\ |
| 自然语言 | "用 momo 风格设计动效" / "召集 KPOP 议会" |
| 团名直呼 | "用 TWICE 配色" / "BLACKPINK 极简风" |

## 🗳 议会流程

1. **bench-matcher** 解析 BRIEF, 识别 UI 维度
2. 匹配 idol UI specialty, 选出 12-15 候选 (cap 15)
3. 各 idol 从其专长视角发言讨论
4. 加权陪审团 ≥2/3 通过决议
5. 输出统一方案

## 🎤 8 大全员议会团
- **TWICE** (9): Nayeon · Jeongyeon · Momo · Sana · Jihyo · Mina · Dahyun · Chaeyoung · Tzuyu
- **BLACKPINK** (4): Jisoo · Jennie · Rosé · Lisa
- **IVE** (6): Yujin · Gaeul · Rei · Wonyoung · Liz · Leeseo
- **NewJeans** (5): Minji · Hanni · Danielle · Haerin · Hyein
- **aespa** (4): Karina · Giselle · Winter · Ningning
- **ITZY** (5): Yeji · Lia · Ryujin · Chaeryeong · Yuna
- **LE SSERAFIM** (5): Chaewon · Sakura · Yunjin · Kazuha · Eunchae
- **(G)I-DLE** (5): Soyeon · Miyeon · Minnie · Yuqi · Shuhua
- **Red Velvet** (5): Irene · Seulgi · Wendy · Joy · Yeri
- **MAMAMOO** (4): Solar · Moonbyul · Wheein · Hwasa
- **ILLIT** (5): Yunah · Minju · Moka · Wonhee · Iroha
- **BABYMONSTER** (7): Ruka · Pharita · Asa · Ahyeon · Rami · Rora · Chiquita

## ⚙ 与算鱼设计系统 (suanfish-design-system) 的关系

| 维度 | 算鱼 (52) | KPOP (97) |
|------|----------|------------|
| 圣人池 | 哲学家/艺术家/音乐家 | KPOP 女团 idol |
| 触发风格 | 学术/哲学/严肃 | 流行/娱乐/视觉 |
| 适用场景 | B 端 SaaS · 工具 | C 端 · 娱乐 · 时尚 |

未来 v2.0 联袂议会 — 黑格尔 ⟷ momo 跨界辩论。

## 📦 安装命令一览

\\\ash
# 安装 (会自动创建 junction + 注册 skillDirectories)
npx --yes github:SuanFishXYY/kpop-design-system

# 更新
npx --yes github:SuanFishXYY/kpop-design-system update

# 卸载
npx --yes github:SuanFishXYY/kpop-design-system uninstall
\\\

## 📁 仓库结构

\\\
kpop-design-system/
├── SKILL.md           # 根 skill 定义 + 议会规则
├── README.md          # 本文件
├── package.json
├── installer/
│   └── install.mjs    # 6 平台一键 installer
├── agents/            # 97 个 idol agent .md
│   ├── twice-momo.md
│   ├── bp-jennie.md
│   ├── ive-yujin.md
│   └── ... (97 files)
├── workflows/         # 议会流程模板 (TODO)
├── references/        # 设计参考资料 (TODO)
└── examples/          # 使用示例 (TODO)
\\\

## 🔧 开发者

- 仓库: https://github.com/SuanFishXYY/kpop-design-system
- 姊妹项目: https://github.com/SuanFishXYY/suanfish-design-system
- 作者: 算鱼工作室 (SuanFishXYY)

## 📄 License

MIT · 2025