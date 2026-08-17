# 📚 KPOP Design System · 文档索引

> 按你想做的事找文档，不用从头读到尾。所有文档相对本目录（`docs/`）。

---

## 🚀 第一次来 / 想快速上手

| 文档 | 帮你干什么 |
|---|---|
| [项目 README](../README.md) | 3 秒看懂这是什么、为什么酷、怎么用 |
| [SKILL.md](../SKILL.md) | skill 本体说明书：何时触发、会做什么、产出什么 |
| [QUICKSTART](./QUICKSTART.md) | 5 分钟跑通第一场偶像议会 |
| [COUNCIL-FLOW-DIAGRAM](./COUNCIL-FLOW-DIAGRAM.md) | 一张图看懂 brief -> 判决的完整流程 |

---

## 🎭 想理解议会机制

| 文档 | 帮你干什么 |
|---|---|
| [MIXED-COUNCIL-PROTOCOL](./MIXED-COUNCIL-PROTOCOL.md) | 完整审议协议：召集规则 / R1~R3 / 判决阈值 |
| [EXAMPLE-COUNCIL-TRANSCRIPT](./EXAMPLE-COUNCIL-TRANSCRIPT.md) | 一场真实议会的完整记录（R1/R2/R2b/R3/判决/host 提示） |
| [USER-AS-JUDGE](./USER-AS-JUDGE.md) | 用户票席 / veto / override / 偏好学习 |
| [AESTHETIC-COUNTERPOINT-PAIRS](./AESTHETIC-COUNTERPOINT-PAIRS.md) | 10 对宿敌张力轴（IVE↔aespa / BP↔TWICE ...） |
| [group-soul-in-action](./group-soul-in-action.md) | 5 个真实 brief 对比：有团魂层 vs 没团魂层 |

---

## 🛠 想用起来（参考手册）

| 文档 | 帮你干什么 |
|---|---|
| [CLI-INTERACTIVE-COUNCIL](./CLI-INTERACTIVE-COUNCIL.md) | 全部 CLI 参数 + 交互键 |
| [MCP-SERVER](./MCP-SERVER.md) | 12 个 MCP 工具参考 + Claude Code 接入配置 |

---

## 👥 想查 idol / 团数据

| 文档 | 帮你干什么 |
|---|---|
| [FEMALE-IDOL-ROSTER](./FEMALE-IDOL-ROSTER.md) | 248 位女 idol 完整名单 + 设计属性（自动生成，最新权威） |
| [IDOL-VOICES](./IDOL-VOICES.md) | 每位 idol 的语气 / 签名句 / 谈判筹码（自动生成） |
| [IDOL-SOULS](./IDOL-SOULS.md) | idol 灵魂档案（自动生成） |
| [VOICE-COVERAGE-AUDIT](./VOICE-COVERAGE-AUDIT.md) | 248 位 idol 人格覆盖审计报告（自动生成） |
| [MASTER-ROSTER](./MASTER-ROSTER.md) | 旧版名册总表（自动生成，v2.7 时代，数字较旧，以 FEMALE-IDOL-ROSTER 为准） |
| [network-graph](./network-graph.md) | 6 个 hub idol 召集议会的网络可视化（早期） |
| [network-full](./network-full.md) | 全员网络图谱（早期 97 idol 时代，仅供历史参考） |

> 带「自动生成」标记的文档由脚本生成，请改数据源（`agents/*.md` / `groups/*.md`）后重跑脚本，不要直接编辑。

---

## 🧬 想用附加能力

| 文档 | 帮你干什么 |
|---|---|
| [../workflows/comeback-cycle](../workflows/comeback-cycle.md) | 30 天 7 节点回归视觉日历（D-30 -> D+28） |
| [../workflows/design-brief](../workflows/design-brief.md) | 用议会机制挖设计 brief 的 5 阶段工作流 |
| [../lineages/generation](../lineages/generation.md) | K-pop 2/3/4/5 代审美时间线 + 代际错位禁忌 |

---

## 🏗 想理解工程 / 贡献代码

| 文档 | 帮你干什么 |
|---|---|
| [ARCHITECTURE](./ARCHITECTURE.md) | 引擎依赖图 + 16 个引擎表 + host-AI vs standalone |
| [../scripts/README](../scripts/README.md) | 每个脚本的用途 / 运行策略 / 生命周期 |
| [../CHANGELOG](../CHANGELOG.md) | 完整版本历史 |

---

## 🗺 一句话地图

```
你 → README(看懂) → QUICKSTART(跑通) → SKILL.md(装进 AI 用)
                                    ↓
              想懂机制 → MIXED-COUNCIL-PROTOCOL + EXAMPLE-TRANSCRIPT
              想查数据 → FEMALE-IDOL-ROSTER
              想接系统 → CLI-INTERACTIVE-COUNCIL / MCP-SERVER
              想改代码 → ARCHITECTURE + scripts/README
```

---

<sub>文档有缺失或读不懂？提 [issue](https://github.com/SuanFishXYY/kpop-design-system/issues)。</sub>
