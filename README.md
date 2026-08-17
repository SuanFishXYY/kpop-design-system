# 🎤 KPOP Design System

### 把 248 位 K-pop 女团 idol 变成一个会吵架、会质询、会投票否决的设计评审议会。

> _You drop a one-line design brief. 248 idols assemble a council, each speaks in their own voice, cross-examines the next member, and votes out a verdict. Zero API key. Zero config._

[![version](https://img.shields.io/badge/version-3.7.0-pink.svg)](./CHANGELOG.md)
[![tests](https://img.shields.io/badge/tests-170%20PASS-green.svg)](#-质量与可信度)
[![CI](https://github.com/SuanFishXYY/kpop-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/SuanFishXYY/kpop-design-system/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-pink.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](./package.json)

**零配置 · 插宿主 AI 即用** —— 不需要任何 API key，在 Claude / Copilot / Cursor 里直接 `/kpop` 就能开议会。

---

## 🎬 30 秒看懂这是什么

你写过一句设计 brief，比如：

> _"做一个 Y2K × 未来感女团回归官网首屏"_

普通 AI 会给你一份平庸的方案。这个系统会**先召集一个偶像议会**来审你这句话：

- **aespa Karina**（冷峻未来感）说："接近可行，但我反对纯甜美校园、反对没有元宇宙语法。"
- **IVE Wonyoung**（高贵仪式感）说："方向是对的，克制是最高级的表达。"
- **2NE1 CL**（锋利压迫感）直接点名 Soyeon："你的宣言不够狠，现在太 predictable。"
- **(G)I-DLE Soyeon** 回怼 CL："CL 的反叛 tagline 没亮到让观众记住。"
- 质询、回击、最终立场、投票、判决书 —— 一份带审计轨迹的设计决议就这么出炉了。

**一句话定位**：K-pop 工业视觉策略，被代码化成了一个可运行、可测试、带人格的多智能体审议协议。

---

## ✨ 为什么需要这个

| 痛点 | KPOP Design System 怎么解 |
|---|---|
| AI 给的设计方案"正确但平庸"，没有立场 | 248 位 idol 各自带**审美 DNA、签名句、否决权**，会为了一个配色互相质询 |
| 多智能体系统通常要配一堆 API key | **零 key 零配置**——宿主 AI（Claude/Copilot/Cursor）就是 LLM，JS 引擎只管结构和投票 |
| 智能体发言常常千人一面、OOC | 每位 idol 有**确定性人格**：语气、口头禅、谈判筹码、硬否决，0 人落在默认 tone |
| 设计评审没有留痕、没法复现 | 完整 R1→R2→R2b→R3 审议链 + 条款分类 + 判决书，可导出 markdown transcript |
| 用户只能被动接受结果 | 用户是**并列评委**，有 veto / override / 偏好学习权 |

---

## 🧩 核心特性

```
 🎭 风格优先召集     任意 idol 凭设计专长被召集，显式名字/团体仅作辅助召回
 🗣 人格化发言       248 位 idol 全部有确定性语气、签名句、谈判筹码、硬否决
 ⚔️ 四轮审议协议     R1 独立陈述 → R2 交叉质询 → R2b 回击 → R3 最终立场
 🤝 冲突感知立场     R3 由成员 DNA + 对手在场共同决定，能产出真正的 dissent / compromise
 🧑‍⚖️ 用户即评委       veto / override / 偏好学习（本地 JSON，永不上传）
 🧬 设计 DNA 聚合     palette / mood / motion / typography / copy 一键合成 brief
 🔌 零配置三入口      Skill 斜杠命令 · CLI · MCP Server，全不需要 API key
 🧪 工程化保证       179+ 测试 · CI Node 18/20/22 · 死链校验器
```

---

## 🚀 快速开始（三种入口，任选其一）

### 入口 ① · Skill 斜杠命令（最推荐）

把本仓库装成 Claude / Copilot / Cursor 的 skill，然后在对话里直接：

```
/kpop  做一个 IVE 回归的官网首屏
```

宿主 AI 会原生执行整个议会协议——**不需要任何 provider key**。

### 入口 ② · CLI（独立运行 / 生成 transcript / CI）

```bash
git clone https://github.com/SuanFishXYY/kpop-design-system.git
cd kpop-design-system
npm test                                          # 验证 179+ 测试全绿
node examples/council-ive-comeback.mjs            # 跑一个示例议会
node bin/council.mjs --brief="IVE comeback landing" --auto
```

常用 flag 速查：

```bash
node bin/council.mjs --brief="..." --auto --explain              # 解释为什么选这些成员
node bin/council.mjs --brief="..." --auto --add=Karina --veto=jennie
node bin/council.mjs --brief="..." --auto --rebuttals --transcript  # 导出完整审议记录
node bin/council.mjs --brief="..." --auto --json                 # 机器可读输出
node bin/council.mjs --brief="..." --host-prompt                 # 导出给外部 LLM 的系统提示
node bin/council.mjs --review --brief="..." --auto               # 评审面板模式
node bin/council.mjs --list-idols                                # 列出全部 idol
```

完整 CLI 参考 → [`docs/CLI-INTERACTIVE-COUNCIL.md`](./docs/CLI-INTERACTIVE-COUNCIL.md)

### 入口 ③ · MCP Server（接任何 MCP 客户端）

```bash
node bin/mcp-server.mjs                                   # stdio 默认
node bin/mcp-server.mjs --transport=http --port=3000      # HTTP+SSE
```

Claude Code / Claude Desktop 配置：

```json
{
  "mcpServers": {
    "kpop-design-system": {
      "command": "node",
      "args": ["/path/to/kpop-design-system/bin/mcp-server.mjs"]
    }
  }
}
```

12 个工具：`kpop_assemble_council` · `kpop_run_deliberation` · `kpop_generate_design_brief` · `kpop_review_design` · `kpop_list_roster` · `kpop_search_roster` · `kpop_compare_idols` · `kpop_get_member_persona` · `kpop_conflicts` · `kpop_synthesize_voice` · `kpop_speak_in_character` · `kpop_build_host_prompt`

完整 MCP 文档 → [`docs/MCP-SERVER.md`](./docs/MCP-SERVER.md)

---

## 🎭 它是怎么工作的

```text
A. 一句 brief
   ↓
B. Relations 引擎 ─── 找出姐妹团 / 宿敌 / 跨厂牌关系
   ↓
C. Council 召集 ──── 按设计专长排名 + 名字辅助召回，拼出 5~7 人混合议会
   ↓
D. Voice 人格合成 ── 每位成员拿到：语气 / 签名句 / 谈判筹码 / 硬否决
   ↓
E. Deliberation 审议 ─ R1 独立陈述 → R2 交叉质询 → R2b 回击 → R3 最终立场
   ↓                 （宿主 AI 负责发言，JS 引擎保证结构/投票/判决确定性）
F. Verdict 判决 ──── 条款分类（共识/妥协/反对）+ >2/3 加权通过 + 审计轨迹
   ↓
Z. 判决书 markdown + 完整 transcript
```

### 真实议会片段（节选自 [EXAMPLE-COUNCIL-TRANSCRIPT](./docs/EXAMPLE-COUNCIL-TRANSCRIPT.md)）

**R2 交叉质询** —— CL 直接点名 Soyeon：

> **2ne1-cl → idle-soyeon**
> _prompt_: you reserved judgment; which constraint must be locked for you to vote for?
> _reply_: "CL 的 The Baddest Female · 反叛 tagline 不够狠，直接说问题。"

**R2b 回击** —— Soyeon 火力回敬：

> **idle-soyeon → 2ne1-cl**: "CL 的反叛 tagline 没有亮到让观众记住。"

**R3 最终立场** —— Karina 给出带条件的妥协：

> **aespa-karina** _(compromise)_: 我可以接受这个 brief，前提是 "Classic SM duality vs future SM metaverse" 锚定在 Classic SM duality 上，未来感层降级为 accent。

**判决**：`pass (3/3, abstain 4)` —— 每一票都留痕。

---

## 👥 名册规模

| 层级 | 数量 | 权重 | 否决权 | 说明 |
|---|---|---|---|---|
| 🏛 评审团（经纪人/制作人） | 7 | ×5 | portfolio only | JYP / YG / SM / Bang PD / 闵熙珍 / Starship / Teddy |
| 👑 团代表（团魂） | 45 | ×3 | ✅ | TWICE / BP / IVE / aespa / NJ / ITZY / RV / LSF / IDLE ... |
| ⭐ Tier 0 主力 idol | 71 | ×2 | ❌ | 各团核心成员 |
| 🌸 Tier 1 辅助 idol | 45 | ×1.5 | ❌ | 代际补充 |
| 🧑‍⚖️ 用户 | 1 | ×1~3 | veto/override | 你也是评委 |

**248 位女团 idol · 跨 2~5 代 · 36 团**，覆盖 SNSD / 2NE1 / Wonder Girls / KARA / miss A / TWICE / BLACKPINK / IVE / aespa / NewJeans / ITZY / Red Velvet / LE SSERAFIM / (G)I-DLE / ILLIT / MEOVV / KATSEYE / Kep1er / STAYC / MAMAMOO ... 还有 BoA / IU / Sunmi / Hyuna / Chungha / Somi / Lee Hyori 七大solo。

完整名册 → [`docs/FEMALE-IDOL-ROSTER.md`](./docs/FEMALE-IDOL-ROSTER.md)

---

## 🏗 架构：确定性引擎 + 宿主 AI 智能

本仓库**不自己调 LLM**。skill 用户本来就坐在 Claude / Copilot / Cursor 里——**宿主 AI 就是 LLM**。JS 引擎只负责必须确定的部分：

| 引擎 | 职责 |
|---|---|
| `council-assembly.mjs` | 风格优先召集、姐妹团关系、议会拼装 |
| `voice-persona.mjs` | 每位 idol 的语气 / 签名句 / 谈判筹码 / 硬否决 |
| `speak.mjs` | 角色化台词 + 交叉质询回怼生成 |
| `deliberation.mjs` | R1/R2/R2b/R3 协议脚本 + 冲突感知立场 |
| `verdict.mjs` | 条款分类 + >2/3 加权通过 + 严格判决 |
| `user-jury.mjs` / `user-prefs.mjs` | 用户投票 + 本地偏好学习 |
| `eras.mjs` / `cycle.mjs` / `coherence.mjs` / `generation.mjs` | Era 宇宙 / 回归周期 / 多触点一致性 / 代际审美 lint |

> **设计原则**：召集、计票、判决格式 = 确定性 + 可测试；成员发言 = 宿主 AI 原生执行。两边各司其职。

完整架构图 → [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

---

## ✅ 质量与可信度

- **170 测试全部 PASS** -- `npm test`
- **CI 矩阵**：Node 18 / 20 / 22，每次 push/PR 跑全量测试 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- **死链校验器**：`npm run validate-links` 校验全部 idol/group/judge 之间的交叉引用，无残留死链
- **人格覆盖审计**：`npm run audit-voice` 确认 248 位 idol 0 人落在默认 tone

---

## 📚 文档索引

| 文档 | 内容 |
|---|---|
| [QUICKSTART](./docs/QUICKSTART.md) | 5 分钟上手 |
| [COUNCIL-FLOW-DIAGRAM](./docs/COUNCIL-FLOW-DIAGRAM.md) | A→Z 议会流程图 |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | 引擎依赖图 + 引擎表 |
| [CLI-INTERACTIVE-COUNCIL](./docs/CLI-INTERACTIVE-COUNCIL.md) | 完整 CLI 参数 + 交互键 |
| [MCP-SERVER](./docs/MCP-SERVER.md) | MCP 12 工具参考 |
| [FEMALE-IDOL-ROSTER](./docs/FEMALE-IDOL-ROSTER.md) | 248 位 idol 完整名册 |
| [EXAMPLE-COUNCIL-TRANSCRIPT](./docs/EXAMPLE-COUNCIL-TRANSCRIPT.md) | 真实议会完整记录 |
| [CHANGELOG](./CHANGELOG.md) | 完整版本历史 |

---

## 📈 版本亮点

| 版本 | 重点 |
|---|---|
| **v3.7.0** | 冲突感知 R3 立场（真正的 dissent/compromise）+ 死链校验器 |
| v3.6.2 | CLI `--transcript` 一键导出完整审议记录 |
| v3.6.1 | R2 角色化回怼 + R2b 回击链 + host-AI 系统提示生成器 |
| v3.6.0 | 248 位 idol 全部有确定性人格，0 人落在默认 tone |
| v3.5.0 | 风格优先召集 + 名册扩到 248 人 + MCP server |
| v3.4.3 | 架构转向 host-AI 模式，移除外部 LLM 依赖，零 key 零配置 |
| v3.3 | 混合议会：idol + 团代表 + 用户，各一票 |

> 历史注记：v3.4.0 曾短暂实验 DeepSeek/Claude/Gemini provider 封装，v3.4.3 移除了它们——因为 skill 运行时本来就自带宿主 AI。

完整历史 → [`CHANGELOG.md`](./CHANGELOG.md)

---

## 🤝 致谢与 License

**MIT License** © 2025 算鱼工作室 (SuanFishXYY)

安装器架构、检测算法、防误装机制衍生自姊妹项目 [suanfish-design-system](https://github.com/SuanFishXYY/suanfish-design-system)。248 位 idol 的人格数据为算鱼工作室原创策展作品。

详见 [`LICENSE`](./LICENSE)。

---

<p align="center">
  <sub>🎤 第一个把 K-pop 工业视觉策略代码化的开源系统。</sub><br>
  <sub>从 "186 idol × 1 套 palette" 升维为 "248 idol × N era × 5 媒介 × 4 代审美 × 会吵架的议会"。</sub>
</p>
