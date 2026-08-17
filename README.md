# 🎤 KPOP Design System

### 把 248 位 K-pop 女团 idol 变成一个会吵架、会质询、会投票否决的设计评审议会。

> _You drop a one-line design brief. 248 idols assemble a council, each speaks in their own voice, cross-examines the next member, and votes out a verdict. Zero API key. Zero config._

[![version](https://img.shields.io/badge/version-3.7.0-pink.svg)](./CHANGELOG.md)
[![tests](https://img.shields.io/badge/tests-170%20PASS-green.svg)](#-质量与可信度)
[![CI](https://github.com/SuanFishXYY/kpop-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/SuanFishXYY/kpop-design-system/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-pink.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](./package.json)

**零配置 · 插宿主 AI 即用** -- 不需要任何 API key，在 Claude / Copilot / Cursor 里直接 `/kpop` 就能开议会。

---

## 🎬 30 秒看懂这是什么

你写过一句设计 brief，比如：

> _"做一个 Y2K × 未来感女团回归官网首屏"_

普通 AI 会给你一份平庸的方案。这个系统会**先召集一个偶像议会**来审你这句话：

- **aespa Karina**（冷峻未来感）说："接近可行，但我反对纯甜美校园、反对没有元宇宙语法。"
- **IVE Wonyoung**（高贵仪式感）说："方向是对的，克制是最高级的表达。"
- **2NE1 CL**（锋利压迫感）直接点名 Soyeon："你的宣言不够狠，现在太 predictable。"
- **(G)I-DLE Soyeon** 回怼 CL："CL 的反叛 tagline 没亮到让观众记住。"
- 质询、回击、最终立场、投票、判决书 -- 一份带审计轨迹的设计决议就这么出炉了。

**一句话定位**：K-pop 工业视觉策略，被代码化成了一个可运行、可测试、带人格的多智能体审议协议。

---

## ✨ 为什么需要这个

| 痛点 | KPOP Design System 怎么解 |
|---|---|
| AI 给的设计方案"正确但平庸"，没有立场 | 248 位 idol 各自带**审美 DNA、签名句、否决权**，会为了一个配色互相质询 |
| 多智能体系统通常要配一堆 API key | **零 key 零配置**--宿主 AI（Claude/Copilot/Cursor）就是 LLM，JS 引擎只管结构和投票 |
| 智能体发言常常千人一面、OOC | 每位 idol 有**确定性人格**：语气、口头禅、谈判筹码、硬否决，0 人落在默认 tone |
| 设计评审没有留痕、没法复现 | 完整 R1->R2->R2b->R3 审议链 + 条款分类 + 判决书，可导出 markdown transcript |
| 用户只能被动接受结果 | 用户是**并列评委**，有 veto / override / 偏好学习权 |

### 它和"直接让 ChatGPT 设计"有什么本质区别

普通 AI 设计 = **一个模型一次性输出**，正确但平庸，没有立场、没有对抗、没有留痕。

KPOP Design System 把设计评审从"一次性生成"变成**一场有结构、有对抗、有判决的审议过程**：

- **多人格**：248 种审美 DNA 同台，不是同一张脸换皮
- **有否决权**：团代表能一票否决违反集体 DNA 的主张，不是所有人投票折中
- **有审计轨迹**：每一票谁投的、为什么、哪一轮被怼回来，全程 markdown 可查
- **可复现**：相同 brief 召集相同议会、产出相同判决（确定性 council_id + seed）

> 本质：把"K-pop 工业 17 年沉淀的集体身份 + 厂牌张力 + 代际审美"这层**人类策略知识**，代码化成可运行、可测试的审议协议，而不是又塞给 LLM 一段提示词。

---

## 🧩 核心特性

```
 🎭 风格优先召集     任意 idol 凭设计专长被召集，显式名字/团体仅作辅助召回
 🗣 人格化发言       248 位 idol 全部有确定性语气、签名句、谈判筹码、硬否决
 ⚔️ 四轮审议协议     R1 独立陈述 -> R2 交叉质询 -> R2b 回击 -> R3 最终立场
 🤝 冲突感知立场     R3 由成员 DNA + 对手在场共同决定，能产出真正的 dissent / compromise
 👑 团魂层治理       团代表 vote=3 > idol，可一票否决违反集体 DNA 的主张
 🤝 宿敌张力轴       10 对 counterpoint pairs 让议会保留有用张力、不抹平身份
 🧑‍⚖️ 用户即评委       veto / override / 偏好学习（本地 JSON，永不上传）
 🧬 设计 DNA 聚合     palette / mood / motion / typography / copy 一键合成 brief
 🗓 30 天回归日历     D-30 -> D+28 七节点视觉策略层层递进
 🧬 代际审美 lint     2/3/4/5 代审美禁忌检测，5 代团穿 3 代衣服会被警告
 🎨 5 媒介一致性      MV/SNS/Photocard/Lightstick/Stage 物理补偿
 🔌 零配置三入口      Skill 斜杠命令 · CLI · MCP Server，全不需要 API key
 🧪 工程化保证       170 测试 · CI Node 18/20/22 · 死链校验器
```

---

## 🚀 快速开始（三种入口，任选其一）

### 入口 ① · Skill 斜杠命令（最推荐）

把本仓库装成 Claude / Copilot / Cursor 的 skill，然后在对话里直接：

```
/kpop  做一个 IVE 回归的官网首屏
```

宿主 AI 会原生执行整个议会协议--**不需要任何 provider key**。

### 入口 ② · CLI（独立运行 / 生成 transcript / CI）

```bash
git clone https://github.com/SuanFishXYY/kpop-design-system.git
cd kpop-design-system
npm test                                          # 验证 170 测试全绿
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

完整 CLI 参考 -> [`docs/CLI-INTERACTIVE-COUNCIL.md`](./docs/CLI-INTERACTIVE-COUNCIL.md)

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

完整 MCP 文档 -> [`docs/MCP-SERVER.md`](./docs/MCP-SERVER.md)

---

## ⚖️ 四轮审议协议：议会到底怎么吵的

一场议会不是"大家投个票"--是 **R1 -> R2 -> R2b -> R3 -> 判决** 的结构化审议链。每一轮干什么、产出什么，都写死在引擎里。

| 轮次 | 干什么 | 产出 | 引擎 |
|---|---|---|---|
| **R1 独立陈述** | 每位成员基于自己的人格 DNA（语气/签名句/谈判筹码）独立表态 | `agree` / `reserve` / `dissent` + tension 分 + 角色化台词 | `deliberation.mjs` + `speak.mjs` |
| **R2 交叉质询** | 成员之间定向点名提问，每个 directed pair 产出一条带人设的回怼 | speaker 语气 + target 谈判筹码的定向 challenge | `speak.mjs#speakReply` |
| **R2b 回击链** _(可选 `--rebuttals`)_ | 被质询者火力回敬 | 用确定性 seed 派生的反击，可复现 | `deliberation.mjs#runR2bRebuttals` |
| **R3 最终立场** | 冲突感知：成员 DNA（veto 触发词 + 专长 + 对位轴）+ 对手在场共同决定 | 真正的 `dissent`（反对）/ `compromise`（妥协）/ `agree` | `deliberation.mjs#resolveR3Stance` |
| **判决** | 条款分类 + 加权计票 + 审计轨迹 | `pass` / `reject` / `user_veto` / `user_override` + markdown transcript | `verdict.mjs` |

**判决阈值**：`> 2/3` 加权通过；团代表一票否决违反集体 DNA 的条款；abstain 不计入分母。

### 真实议会片段（节选自 [EXAMPLE-COUNCIL-TRANSCRIPT](./docs/EXAMPLE-COUNCIL-TRANSCRIPT.md)）

**R2 交叉质询** -- CL 直接点名 Soyeon：

> **2ne1-cl -> idle-soyeon**
> _prompt_: you reserved judgment; which constraint must be locked for you to vote for?
> _reply_: "CL 的 The Baddest Female · 反叛 tagline 不够狠，直接说问题。"

**R2b 回击** -- Soyeon 火力回敬：

> **idle-soyeon -> 2ne1-cl**: "CL 的反叛 tagline 没有亮到让观众记住。"

**R3 最终立场** -- Karina 给出带条件的妥协：

> **aespa-karina** _(compromise)_: 我可以接受这个 brief，前提是 "Classic SM duality vs future SM metaverse" 锚定在 Classic SM duality 上，未来感层降级为 accent。

**判决**：`pass (3/3, abstain 4)` -- 每一票都留痕，可导出完整 markdown transcript。

> 完整协议规则（召集/阈值/否决优先级/用户票席）-> [`docs/MIXED-COUNCIL-PROTOCOL.md`](./docs/MIXED-COUNCIL-PROTOCOL.md)

---

## ⚔️ 宿敌张力轴：议会为什么吵得起来

248 位 idol 不是一团和气--系统内置 **10 对审美 counterpoint pairs**，让议会有真实的张力来源。这些对是 **counterpoints，不是 enemies**：保留有用的审美张力，不抹平各自身份。

| 宿敌对 | 张力轴 |
|---|---|
| IVE ↔ aespa | 公主仪式感 vs 未来主义 |
| TWICE ↔ BLACKPINK | 糖果甜美 vs 致命锋芒 |
| NewJeans ↔ ILLIT | 自然清新 vs 校园甜美 |
| Red Velvet ↔ aespa | 经典 SM 双面 vs 未来 SM 元宇宙 |
| BLACKPINK ↔ 2NE1 | 奢华打磨 vs 反叛原点 |
| (G)I-DLE ↔ ITZY | 自制剧场 vs 少年力量 |
| LE SSERAFIM ↔ BLACKPINK | 电影级无畏 vs 奢华战斗 |
| TWICE ↔ SNSD | 三代花束 vs 二代国民模板 |
| BABYMONSTER ↔ BLACKPINK | 原始接班能量 vs 既定奢华锋芒 |
| MAMAMOO ↔ BLACKPINK | 声乐自信 vs 视觉统治 |

**R3 冲突感知**：当对位团同时在场、且有 `counterpoint_axis` 标注时，引擎会产出 **axis-aware compromise**--妥协宣言里直接点名张力轴（如 Karina 的 "Classic SM duality vs future SM metaverse"），而不是空泛地"各退一步"。

> 完整张力轴文档 -> [`docs/AESTHETIC-COUNTERPOINT-PAIRS.md`](./docs/AESTHETIC-COUNTERPOINT-PAIRS.md)

---

## 👑 团魂层：集体 brand guideline

K-pop 的核心不是个体，是**集体身份**。系统在 idol 之上加了一层 **团魂（group soul）**：每个团一句 DNA 宣言（如 TWICE 的"我们是 9 个不同的女孩组成的一束花"），团代表 `vote=3 > Tier 0=2 > Tier 1=1.5`，能一票否决违反集体 DNA 的个人主张。

### 同一个 brief，有团魂 vs 没团魂

**Brief**：_"帮我做一个 TWICE 风格的化妆品官网 hero"_

| | ❌ 没团魂层（v1.0.1） | ✅ 有团魂层（v1.0.2+） |
|---|---|---|
| 召集 | 9 个 TWICE idol 各执一词 | 团魂先宣读"9 色花束"宣言 |
| 主张 | Nayeon 粉色 wink / Mina 黑白极简 / Dahyun tofu 贴纸 / Tzuyu 全屏大特写 … | Dahyun 全屏贴纸 ❌ 违反"群像感" / Tzuyu 大特写 ❌ 单人 carry / Mina 黑白 ❌ 违反"多元色彩" / Momo 9 色依次绽放 ✅ |
| 结果 | 9 方向无收敛 -> 折中 = 粉色+黑白+涂鸦堆砌 = **风格灾难** | 9 色等比例编队 + 群像 hero + 9 色 member 微交互 = **忠于 TWICE 灵魂** |

### 团魂层带来的 4 个实战差异

| 维度 | 没团魂 | 有团魂 |
|---|---|---|
| 风格收敛 | 9 idol 9 方向 -> 折中灾难 | 团魂宣言锚定 -> idol 在框架内提供细节 |
| 优先级 | 全员平权，无法仲裁 | 团魂 vote=3 > Tier 0=2 > Tier 1=1.5 |
| 跨团融合 | 风格生硬叠加 -> 油水不溶 | 联席会议 + `fusion_compatible` 双向校验 -> 真正"并置" |
| 品牌护城河 | "TWICE 风格"靠拼凑 | 一句"9 色花束"全员收敛，可解释、可复用 |

> 一句话：**团魂是"集体 brand guideline"，idol 是"执行细则"。** 5 个真实 brief 对比 -> [`docs/group-soul-in-action.md`](./docs/group-soul-in-action.md)

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
E. Deliberation 审议 ─ R1 独立陈述 -> R2 交叉质询 -> R2b 回击 -> R3 最终立场
   ↓                 （宿主 AI 负责发言，JS 引擎保证结构/投票/判决确定性）
F. Verdict 判决 ──── 条款分类（共识/妥协/反对）+ >2/3 加权通过 + 审计轨迹
   ↓
Z. 判决书 markdown + 完整 transcript
```

> **设计原则**：召集、计票、判决格式 = 确定性 + 可测试；成员发言 = 宿主 AI 原生执行。两边各司其职。

---

## 🧬 超越单场议会：四套附加引擎

议会本身只是核心。系统还内置四套引擎，覆盖 K-pop 工业从"单张 KV"到"60 天回归周期"的完整视觉策略链路。

### 🗓 Comeback Cycle · 30 天 7 节点回归日历

一次 comeback 不是出 1 张 KV，是 **D-30 倒计时 -> D-DAY 释放 -> 4 周打歌** 的完整营销日历。引擎按节点自动切换召集的 council（teaser 期召唤 photography+typography idol，MV 期召唤 motion+brand idol）。

| Day | 节点 | 主权 specialty | 输出 |
|---|---|---|---|
| D-30 | Logo Teaser | typography + brand | 隐藏视觉线索的极简 social card |
| D-21 | Concept Photo 1 | photography + palette | era palette 首发 |
| D-14 | Concept Photo 2 | photography + palette + brand | 翻转 mood / diptych 对比 |
| D-7 | MV Teaser 1 | motion + hero | 关键镜头 verse 段 |
| D-3 | MV Teaser 2 | motion + hero + brand | hook 半句 + point dance 第 1 拍 |
| D-DAY | MV 正片 + 数字专辑 | 全 specialty | 5 媒介齐发 |
| D+7~D+28 | 打歌 4 周 | motion + hero + interaction | stage 变体 + 灯光 +20% 浓度补偿 |

```js
import { dispatchComebackCycle, getStageBrief } from "kpop-design-system/engine/cycle.mjs";
dispatchComebackCycle("twice", "fancy");        // 一次性出 7 个 stage briefs
getStageBrief("twice", "fancy", "d-day-mv-release");  // 单节点查询
```

> 协议文档 -> [`workflows/comeback-cycle.md`](./workflows/comeback-cycle.md)

### 🧬 Generation Lint · 4 代审美禁忌

每 5 年 K-pop 视觉语法整体迭代一次。让 5 代团穿 3 代衣服 = 时代错位，工业内会笑话。引擎内置 2/3/4/5 代审美卡片，检测 brief 是否触犯团所属代的禁忌。

| 代 | 代表团 | 视觉签名 | 禁忌（不准穿别人的衣服） |
|---|---|---|---|
| 2 代 (~07-12) | SNSD · KARA · WG · f(x) | 高饱和糖果色 · 校园制服 · 圆润字体 · 8 人以上群像 | 暗黑科技 · 监控构图 · AI cyber · neo-dystopia |
| 3 代 (~13-18) | TWICE · BP · RV · MAMAMOO | 杂志大片 · Y2K 复古 · Velvet 暗黑 · 巴洛克金箔 | AI cyber · 监控感 · 后人类 · 去性别 |
| 4 代 (~19-22) | IVE · aespa · NJ · ITZY · IDLE | 极简 · 公主梦幻 · AI 元宇宙双生 · Y2K 邻家 | 8 人以上群像 · 高度繁复巴洛克 |
| 5 代 (~23+) | BABYMONSTER · ILLIT · IZNA · MEOVV · XG | 暗黑科技 · AI 后人类 · 监控感 · 去性别 · neo-dystopia | Y2K · 校园制服 · 8 人群像 · 巴洛克金箔 |

```js
import { checkGenerationAesthetic } from "kpop-design-system/engine/generation.mjs";
checkGenerationAesthetic("ILLIT 用 Y2K 复古风做 landing", "illit");
// -> { has_violation: true, suggestion: "Y2K 是 3 代语法; 5 代 ILLIT 应走 暗黑科技 / AI 后人类 / 监控感" }
```

> lint 默认 warn 不 reject，用户可写 "retro homage" 标注强制 override。时间线 -> [`lineages/generation.md`](./lineages/generation.md)

### 🎨 Multi-touchpoint Coherence · 5 媒介一致性

同一次 comeback 的视觉会落在 **MV / SNS / Photocard / Lightstick / Stage** 5 种媒介上，每种媒介物理特性不同会"吃色"。引擎在 HSL 色彩空间计算偏差，给 0-100 一致性 score + 校正建议。

| 媒介 | 物理补偿 | 为什么会偏 |
|---|---|---|
| Photocard | CMYK 损失补偿 | 印刷 CMYK 色域比屏幕窄 |
| Lightstick | LED 偏白补偿 | LED 自发光会过曝 |
| Stage | 灯光过饱和补偿 | 演唱会灯光 +20% 浓度吃色 |

> 引擎 `engine/coherence.mjs` · `auditTouchpointCoherence(group, era, observations)`

### 🧑‍⚖️ User-as-Judge · 用户即评委

用户不是被动接受结果，是**并列评委**，有完整票席：

| 权力 | 作用 |
|---|---|
| **veto** | council 通过但用户 reject -> 决议 block |
| **override** | council 否决但用户 pass -> 决议放行 |
| **偏好学习** | `~/.kpop-design/user-prefs.json` 记录 overrides（最近 50 条）/ favorites（团/era，最多 30）/ rejected_specialties，下次召集自动调整 |

```bash
node bin/council.mjs --review --brief="..." --auto   # 交互式评审面板
```

> 偏好数据**本地 only，永不上传**。完整协议 -> [`docs/USER-AS-JUDGE.md`](./docs/USER-AS-JUDGE.md)

---

## 👥 名册规模

| 层级 | 数量 | 权重 | 否决权 | 说明 |
|---|---|---|---|---|
| 🏛 评审团（经纪人/制作人） | 7 | ×5 | portfolio only | JYP / YG / SM / Bang PD / 闵熙珍 / Starship / Teddy |
| 👑 团代表（团魂） | 45 | ×3 | ✅ | TWICE / BP / IVE / aespa / NJ / ITZY / RV / LSF / IDLE ... |
| ⭐ Tier 0 主力 idol | 71 | ×2 | ❌ | 各团核心成员 |
| 🌸 Tier 1 辅助 idol | 45 | ×1.5 | ❌ | 代际补充 |
| 🧑‍⚖️ 用户 | 1 | ×1~3 | veto/override | 你也是评委 |

**248 位女团 idol · 跨 2~5 代 · 36 团**，覆盖 SNSD / 2NE1 / Wonder Girls / KARA / miss A / TWICE / BLACKPINK / IVE / aespa / NewJeans / ITZY / Red Velvet / LE SSERAFIM / (G)I-DLE / ILLIT / MEOVV / KATSEYE / Kep1er / STAYC / MAMAMOO ... 还有 BoA / IU / Sunmi / Hyuna / Chungha / Somi / Lee Hyori 七大 solo。

完整名册 -> [`docs/FEMALE-IDOL-ROSTER.md`](./docs/FEMALE-IDOL-ROSTER.md)

---

## 🏗 架构：确定性引擎 + 宿主 AI 智能

本仓库**不自己调 LLM**。skill 用户本来就坐在 Claude / Copilot / Cursor 里--**宿主 AI 就是 LLM**。JS 引擎只负责必须确定的部分：

| 引擎 | 职责 |
|---|---|
| `council-assembly.mjs` | 风格优先召集、姐妹团关系、议会拼装 |
| `voice-persona.mjs` | 每位 idol 的语气 / 签名句 / 谈判筹码 / 硬否决 |
| `speak.mjs` | 角色化台词 + 交叉质询回怼生成 |
| `deliberation.mjs` | R1/R2/R2b/R3 协议脚本 + 冲突感知立场 |
| `verdict.mjs` | 条款分类 + >2/3 加权通过 + 严格判决 |
| `user-jury.mjs` / `user-prefs.mjs` | 用户投票 + 本地偏好学习 |
| `eras.mjs` / `cycle.mjs` / `coherence.mjs` / `generation.mjs` | Era 宇宙 / 回归周期 / 多触点一致性 / 代际审美 lint |

完整架构图 -> [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

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
| [SKILL.md](./SKILL.md) | skill 本体说明书：何时触发、会做什么、产出什么 |
| [MIXED-COUNCIL-PROTOCOL](./docs/MIXED-COUNCIL-PROTOCOL.md) | 完整审议协议：召集规则 / R1~R3 / 判决阈值 |
| [EXAMPLE-COUNCIL-TRANSCRIPT](./docs/EXAMPLE-COUNCIL-TRANSCRIPT.md) | 一场真实议会的完整记录 |
| [AESTHETIC-COUNTERPOINT-PAIRS](./docs/AESTHETIC-COUNTERPOINT-PAIRS.md) | 10 对宿敌张力轴 |
| [group-soul-in-action](./docs/group-soul-in-action.md) | 5 个真实 brief：有团魂 vs 没团魂 |
| [USER-AS-JUDGE](./docs/USER-AS-JUDGE.md) | 用户票席 / veto / override / 偏好学习 |
| [COUNCIL-FLOW-DIAGRAM](./docs/COUNCIL-FLOW-DIAGRAM.md) | A->Z 议会流程图 |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | 引擎依赖图 + 引擎表 |
| [CLI-INTERACTIVE-COUNCIL](./docs/CLI-INTERACTIVE-COUNCIL.md) | 完整 CLI 参数 + 交互键 |
| [MCP-SERVER](./docs/MCP-SERVER.md) | MCP 12 工具参考 |
| [FEMALE-IDOL-ROSTER](./docs/FEMALE-IDOL-ROSTER.md) | 248 位 idol 完整名册 |
| [comeback-cycle](./workflows/comeback-cycle.md) | 30 天 7 节点回归视觉日历 |
| [generation](./lineages/generation.md) | 2/3/4/5 代审美时间线 + 错位禁忌 |
| [CHANGELOG](./CHANGELOG.md) | 完整版本历史 |

更多文档（IDOL-VOICES / IDOL-SOULS / VOICE-COVERAGE-AUDIT 等自动生成报告）见 [`docs/README.md`](./docs/README.md)。

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
| v3.0 | Era 宇宙 + 30 天回归周期 + 5 媒介一致性 + 代际审美 lint |
| v2.4 | idol 不再是投票傀儡，按 10 维设计专长激活派工 |
| v1.0.2 | 团魂层引入：集体 brand guideline 工程化 |

> 历史注记：v3.4.0 曾短暂实验 DeepSeek/Claude/Gemini provider 封装，v3.4.3 移除了它们--因为 skill 运行时本来就自带宿主 AI。完整历史 -> [`CHANGELOG.md`](./CHANGELOG.md)

---

## ❓ FAQ

**真的零 API key？怎么做到的？**
skill 用户本来就坐在 Claude / Copilot / Cursor 里--**宿主 AI 就是 LLM**。JS 引擎只管必须确定的部分（召集、人格、计票、判决格式），发言由宿主 AI 原生执行。v3.4.0 曾试过封装外部 LLM provider，v3.4.3 移除了，因为纯属多余。

**248 位 idol 的人格数据哪来的？**
算鱼工作室原创策展。每位 idol 的语气 / 签名句 / 谈判筹码 / 硬否决都写死在 `agents/*.md` 和 `groups/*.md` frontmatter 里，可读可改。`npm run audit-voice` 会校验 0 人落在默认 tone。

**和直接让 ChatGPT 设计有什么区别？**
普通 AI = 一个模型一次性输出，正确但平庸。本系统 = 248 种审美 DNA 同台质询 + 团魂否决权 + 加权投票 + 完整审计轨迹。本质是把设计评审从"一次性生成"变成"有结构、有对抗、有判决的审议过程"。

**支持男团吗？**
当前聚焦女团（v3.5 路线把名册扩到 248 位女团 + 7 solo）。男团留待未来版本。架构上 `agents/*.md` 是性别无关的，扩男团主要是策展工作量。

**议会结果可复现吗？**
可以。`council_id` 由 brief + 召集参数确定性派生（`deriveCouncilId()`），相同 brief 召集相同议会、产出相同判决。R2b 回击也用确定性 seed 派生。

**我的偏好数据会被上传吗？**
不会。偏好学习存在本地 `~/.kpop-design/user-prefs.json`，**永不上传**。删档直接 `rm` 这个文件。

**idol 的发言是预录的还是 AI 现生成的？**
两层：引擎层产出确定性的角色化台词模板（`speak.mjs`，带语气/签名句/筹码），宿主 AI 在这个框架里原生执行真正的发言。所以结构可测试、发言有创意。

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
