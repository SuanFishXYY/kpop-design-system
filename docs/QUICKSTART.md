# 🚀 Quickstart · 5 分钟跑通第一场偶像议会

> 没读过 README 也行。跟着这 5 步走，你能亲眼看一场 K-pop 女团为你的设计 brief 吵架、投票、出判决。

---

## 0:00 · 这是什么（30 秒）

你给一句设计 brief，系统自动召集 5~7 位 K-pop 女团 idol 组成议会：每人带人格发言 → 互相质询 → 投票否决 → 出一份带审计轨迹的判决书。

**零 API key**：你在 Claude / Copilot / Cursor 里，宿主 AI 就是 LLM，本系统只管确定性的召集/计票/判决。

---

## 0:30 · 装

```bash
git clone https://github.com/SuanFishXYY/kpop-design-system.git
cd kpop-design-system
```

要求：Node ≥ 18。无需 `npm install`（纯标准库，零依赖）。

---

## 1:00 · 验证能跑

```bash
npm test
```

看到 `170 PASS / 0 FAIL` 就 OK。这一步证明引擎完好。

---

## 1:30 · 跑第一个 demo（亲眼看议会吵架）

```bash
node examples/council-ive-comeback.mjs
```

你会看到：brief → 召集议会 → 每位 idol 角色化发言 → 交叉质询 → 判决书。这是最快建立直觉的方式。

再来一个你自己的 brief：

```bash
node bin/council.mjs --brief="aespa next era futuristic landing" --auto --explain
```

- `--auto` 非交互模式（CI 友好）
- `--explain` 顺便解释为什么选了这几位 idol

想看完整审议记录（含 R2b 回击 + host-AI 系统提示）：

```bash
node bin/council.mjs --brief="Y2K meets futuristic girl group comeback landing" --auto --rebuttals --transcript
```

跑完会在当前目录生成 `transcript-mixed-<hash>.md`，打开就是一场完整议会记录。

---

## 2:30 · 在 Claude / Copilot / Cursor 里用（主模式）

这才是设计的核心用法 -- **宿主 AI 原生执行议会**，JS 引擎退居幕后管结构。

1. 把本仓库装成 skill（各平台见下方安装器说明）
2. 在对话里直接：

```
/kpop  做一个 IVE 回归的官网首屏，要有记忆点
```

宿主 AI 会：召集议会 → 用每位 idol 的语气真·发言 → 质询 → 给你带判决的设计方案。**全程不需要任何 provider key。**

> 装机脚本：`node installer/install.mjs`（自动检测 6 平台、注册 skillDirectories，复用姊妹项目 [suanfish-design-system](https://github.com/SuanFishXYY/suanfish-design-system) 的成熟装机逻辑）。

---

## 3:30 · 看懂输出

一份判决书长这样（节选）：

```
Brief: Y2K meets futuristic girl group comeback landing
Chair: bp-jisoo
Verdict: pass (3/3, abstain 4)

## Dissent
- Dissent retained by 2ne1-cl        ← CL 保留了反对意见
- Dissent retained by idle-soyeon
```

关键字段：

| 字段 | 含义 |
|---|---|
| `Verdict: pass/reject` | 严格 >2/3 加权通过才 pass |
| `Consensus / Compromise / Dissent` | 条款三分类，反对意见会被显式保留 |
| `abstain N` | 弃权数，不计入分母 |
| `Chair` | 主持人（不投票） |

每位成员的发言都是**第一人称、带语气、带签名句、带硬否决**的。比如 CL 会说"我明确反对：5 代监控感、过度赛博。没有商量。"

---

## 4:30 · 你也是评委

你不只是看客 -- 你有 veto / override / 偏好学习权：

```bash
node bin/council.mjs --review --brief="TWICE Fancy era landing"
```

交互流程：idol 轮流发言 → 你 `+1 / -1 / ?` → 最终投票（带权重和理由）→ 决议书 + 自动记偏好。

- **veto**：议会一致通过但你否决 → `user_veto`
- **override**：议会一致否决但你力推 → `user_override`
- **偏好**：存在本地 `~/.kpop-design/user-prefs.json`，永不上传

完整协议 -> [`docs/USER-AS-JUDGE.md`](./USER-AS-JUDGE.md)

---

## 5:00 · 下一步去哪

| 想干这个 | 去这 |
|---|---|
| 理解整套审议协议 | [MIXED-COUNCIL-PROTOCOL](./MIXED-COUNCIL-PROTOCOL.md) |
| 看流程图 | [COUNCIL-FLOW-DIAGRAM](./COUNCIL-FLOW-DIAGRAM.md) |
| 看真实完整记录 | [EXAMPLE-COUNCIL-TRANSCRIPT](./EXAMPLE-COUNCIL-TRANSCRIPT.md) |
| 查全部 248 位 idol | [FEMALE-IDOL-ROSTER](./FEMALE-IDOL-ROSTER.md) |
| 理解引擎架构 | [ARCHITECTURE](./ARCHITECTURE.md) |
| 查全部 CLI 参数 | [CLI-INTERACTIVE-COUNCIL](./CLI-INTERACTIVE-COUNCIL.md) |
| 接 MCP 客户端 | [MCP-SERVER](./MCP-SERVER.md) |
| 文档总索引 | [docs/README](./README.md) |

---

<sub>卡住了？先 `npm test` 确认引擎完好，再 `node bin/council.mjs --help` 看全部参数。</sub>
