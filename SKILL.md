---
name: kpop-design-system
description: "K-pop 工业视觉策略系统 · 把 248 位女团 idol 组成会吵架、会质询、会投票否决的设计评审议会 · 零 API key · 宿主 AI 原生执行协议 · style-first idol council · 每位 idol 角色化发言 (tone/signature phrase/veto) · R1/R2/R2b/R3 四轮审议 + 冲突感知判决 · 用户即评委 (veto/override/偏好学习) · Skill 斜杠 / CLI / MCP 三入口 · era universe / comeback cycle / multi-touchpoint coherence / generation lint. Activate on /kpop, /idol-congress, /kpop-design, /kpop-era, 女团议会, idol council, kpop design."
version: 3.7.0
author: SuanFishXYY
license: MIT
language: zh-CN
flavor: kpop
philosophy: enabled
tags: [design-system, multi-agent, kpop, idol, era, comeback-cycle, touchpoint, generation-lint, user-as-judge, ui, brand, ai-native, zero-config]
---

# 🎤 KPOP Design System · The Idol Congress

> **一句话**：你给一句设计 brief，248 位 K-pop 女团 idol 自动召集议会，每人带人格发言、互相质询、投票否决，产出一份带审计轨迹的设计判决书。

🔌 **零配置 · 插宿主 AI 即用** —— 不需要任何 API key。你已经在 Claude / Copilot / Cursor 里了，宿主 AI 就是 LLM，本 skill 只负责确定性的结构（召集 / 计票 / 判决）。

---

## 🎬 何时触发

| 触发方式 | 示例 |
|---|---|
| 斜杠命令 | `/kpop` · `/idol-congress` · `/kpop-design` · `/kpop-era` |
| 自然语言 | "用 kpop 女团议会审一下这个 landing 设计" · "idol council review" |
| 设计场景 | 任何 K-pop 风格的视觉 / UI / 品牌 / 回归周期设计任务 |

---

## 🧩 它会做什么

收到一句 brief 后，自动跑完一条审议流水线：

1. **召集议会** —— 按设计专长（typography / motion / palette / hero / copy ...）给 248 位 idol 排名，名字/团体作辅助召回，拼出 5~7 人混合议会（含团代表 + idol + 用户票席）。
2. **合成人格** —— 每位成员拿到确定性语气、签名句、谈判筹码、硬否决（0 人落在默认 tone）。
3. **四轮审议**：
   - **R1 独立陈述** —— 每人第一人称表态（agree / reserve / dissent）
   - **R2 交叉质询** —— 每人点名下一位，带角色化回怼
   - **R2b 回击**（可选）—— 被质询者火力回敬
   - **R3 最终立场** —— 由成员 DNA + 对手在场共同决定，能产出真正的妥协 / 反对
4. **判决** —— 条款分类（共识 / 妥协 / 反对）+ 严格 >2/3 加权通过 + 完整审计轨迹。
5. **用户裁决** —— 你是并列评委，可 veto / override，偏好本地学习（永不上传）。

---

## 🚀 怎么用（三选一）

### ① Skill 斜杠命令（主模式）
在对话里直接：
```
/kpop  做一个 IVE 回归的官网首屏
```
宿主 AI 原生执行整个议会协议，不需要 provider key。

### ② CLI（独立运行 / transcript / CI）
```bash
node bin/council.mjs --brief="IVE comeback landing" --auto
node bin/council.mjs --brief="..." --auto --rebuttals --transcript   # 导出完整审议记录
node bin/council.mjs --brief="..." --host-prompt                     # 导出给外部 LLM 的系统提示
```
完整参数 → [`docs/CLI-INTERACTIVE-COUNCIL.md`](./docs/CLI-INTERACTIVE-COUNCIL.md)

### ③ MCP Server
```bash
node bin/mcp-server.mjs          # stdio
node bin/mcp-server.mjs --transport=http --port=3000
```
12 个工具 → [`docs/MCP-SERVER.md`](./docs/MCP-SERVER.md)

---

## 📦 产出物

- **判决书** `verdict-mixed-<hash>.md` —— brief / 议会构成 / 条款分类 / 最终决议 / 审计轨迹
- **完整 transcript** `transcript-mixed-<hash>.md` —— R1/R2/R2b/R3 全文 + 条款分类 + 判决 + host-AI 系统提示附录
- **设计 DNA 包** —— palette / mood / motion / typography / copy tone（`--design-brief`）
- **host-AI 系统提示** —— 可导出给外部 LLM 跑同一场议会（`--host-prompt`）

---

## 🧬 附加能力

| 能力 | 说明 |
|---|---|
| Era Universe | 同一团不同专辑独立视觉宇宙，52 团 + 35 curated era |
| Comeback Cycle | 30 天 7 节点视觉日历（D-30 teaser → D+28 打歌） |
| Multi-touchpoint Coherence | MV / SNS / Photocard / Lightstick / Stage 五媒介一致性审计 |
| Generation Lint | 2/3/4/5 代审美错位禁止（5 代团穿 3 代衣服会报警） |
| Aesthetic Counterpoint | 10 对宿敌张力轴（IVE↔aespa / BP↔TWICE ...），保留张力不抹平身份 |
| Cost-Aware Routing | 多任务分层模型路由，实测省 75~79% token |

---

## 🏗 设计原则

> **确定性引擎 + 宿主 AI 智能**：召集、计票、判决格式 = JS 引擎，确定性 + 可测试；成员发言 = 宿主 AI 原生执行。两边各司其职。

本仓库不自调外部 LLM。skill 用户本来就坐在宿主 AI 里，再造一层 provider 抽象是多余开销。

---

## 📚 配套资源

- 5 分钟上手 → [`docs/QUICKSTART.md`](./docs/QUICKSTART.md)
- 文档总索引 → [`docs/README.md`](./docs/README.md)
- 完整 README → [`README.md`](./README.md)
- 版本历史 → [`CHANGELOG.md`](./CHANGELOG.md)
