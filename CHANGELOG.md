# Changelog

## v1.3.0 · 2025 · 热门团满员 (MEOVV / KATSEYE / Kep1er)

### 🎵 idol 补齐 (102 → 116)

之前热门团有几个"只挂着团魂没有成员"的尴尬,这版全员到位:

**MEOVV (5 代 · YG/THEBLACKLABEL) 1→5**:
- + **anna** (Lead Vocal / Visual, tier 0)
- + **ella** (Lead Dancer / 9 头身, tier 1)
- + **narin** (Main Dancer / power, tier 1)
- + **gawon** (Leader / Main Vocal, tier 0)
- sooin (原有)

**KATSEYE (5 代 · HYBE × Geffen 全球女团) 1→6**:
- + **daniela** (Main Dancer · 拉丁裔, tier 0)
- + **sophia** (Lead Vocal · 菲律宾裔, tier 1)
- + **yoonchae** (Sub Vocal · K-pop DNA, tier 1)
- + **megan** (Lead Rapper · 多语种, tier 1)
- + **manon** (Lead Dancer · 瑞士非洲, tier 1)
- lara (原有)

**Kep1er (4 代 · Starship/WAKEONE 选秀团) 1→6**:
- + **chaehyun** (Main Vocal · 选秀冠军, tier 0)
- + **xiaoting** (Lead Dancer · 中国 visual, tier 0)
- + **mashiro** (Lead Dancer · 日 J-line, tier 1)
- + **yeseo** (Sub Vocal · 全能, tier 1)
- + **hikaru** (Lead Vocal · 日韩混血, tier 1)
- yujin (原有)

### 📊 议会统计

- idol 总数: 97 → 102 → **116**
- tier_0: 64 → 71
- tier_1: 38 → 45

### ✅ 测试 15/15 PASS

新增覆盖:
- MEOVV 5 人召集
- KATSEYE 6 人 + 自动召唤 HYBE/bang-pd 评委
- Kep1er 6 人 + 自动召唤 Starship 评委

### 🎯 含义

擦火花的底层逻辑 (v1.2) + 真实可用的团 (v1.3) = **真能跑跨团 brief 的多 agent 系统**

## v1.2.0 · 2025 · 评委层 + 跨 label gate (从家族到联盟)

### 🏛️ 新增评委层 (judges/)

层级架构升级到 4 层:

| Layer | Count | Weight | Veto | 说明 |
|-------|-------|--------|------|------|
| **judge** | 7 | **5** | portfolio_only | 经纪人/制作人评委 |
| group_soul | 44 | 3 | yes | 团魂 |
| tier_0 | 64 | 2 | no | 主力 idol |
| tier_1 | 38 | 1.5 | no | 辅助 idol |

7 评委（label CEO / 制作人）:
- 🟢 **jyp** 朴轸永 J.Y. Park (JYP) — TWICE / ITZY / NMIXX / WG / missA
- 🖤 **yg** 杨贤硕 Yang Hyun-suk (YG) — BLACKPINK / 2NE1 / MEOVV / BM / GD
- 💎 **sm** 李秀满 Lee Soo-man (SM) — SNSD / f(x) / RV / aespa / KARA
- 🌐 **bang-pd** 방시혁 Bang PD (HYBE) — LE SSERAFIM / ILLIT / KATSEYE / Kep1er
- 🐰 **mhj** 민희진 Min Hee-jin (ADOR) — NewJeans
- 👑 **starship** 홍승성 (Starship) — IVE / WJSN / Kep1er / MONSTA X
- 🎛️ **teddy** Teddy Park (THEBLACKLABEL) — MEOVV / BP producer

### ⚔️ 跨 label gate (擦火花深化)

跨团 brief 自动启动 cross-label gate:
- 同 label (e.g. TWICE × ITZY 都属 JYP) → 1 评委即可
- **跨 label** (e.g. TWICE × BLACKPINK) → **必须 JYP + YG 双方到场**
- 缺席任一 label → gate_passed=false, 决议自动 block
- `inter_label_tension` 字段标注真实业界恩怨 (YG vs SM / JYP vs HYBE)

### 🎵 NMIXX 补齐

之前只有 Lily 1 人 → 现在 6 人完整阵容:
- ✨ haewon (Leader / Main Vocal, tier 0)
- ✨ sullyoon (Main Vocal / Visual, tier 0)
- ✨ bae (Lead Vocal / Lead Dancer, tier 1)
- ✨ jiwoo (Sub Vocal / Sub Dancer, tier 1)
- ✨ kyujin (Main Dancer / Maknae, tier 1)
- lily (Main Vocal / Center, tier 1) — 原有

### 🗳️ 引擎升级

**voting.mjs**:
- 新增 layer="judge" 支持
- 评委否决优先级 > 团魂否决 (judgeVetoes 先于 vetoes 检查)
- isEligibleVoter 接受 judge layer

**dispatch.mjs**:
- loadAllAgents 返回 {souls, idols, judges}
- summonCouncil 自动召唤 in-portfolio 评委
- checkCrossLabelGate: distinct_labels / missing / gate_passed
- dispatchBrief 投票顺序: judges → souls → idols

### ✅ 测试覆盖

- voting.test.mjs: 7/7 PASS (无回归)
- dispatch.test.mjs: **12/12 PASS** (新增 5 条 v1.2.0 测试)

### 🎯 含义

v1.0.x = 营销概念  
v1.1.0 = 真投票引擎 (家族内部)  
**v1.2.0 = 经纪公司联盟 (跨 label 协作)**

## v1.1.0 · 2025 · 真投票引擎 (从声明到代码)

### ⚙️ 引擎层 (engine/)

从 v1.0.x 的「frontmatter 声明式 vote_weight」**质变**到可运行投票引擎:

- ✨ `engine/voting.mjs` — 加权陪审团核心
  - `tallyCouncilVotes()`: ≥ 2/3 加权通过 / 团魂一票否决 / abstain 不计入分母
  - `isEligibleVoter()`: 校验合法投票权
  - `quorumThreshold()`: 计算通过基准线
- ✨ `engine/dispatch.mjs` — 议会调度器
  - `parseBrief()`: 识别 brief 中提到的团 + idol
  - `summonCouncil()`: brief → 团魂 + 同团 idol + helpers 跨团传染
  - `dispatchBrief()`: 完整 dispatch (含 voteSimulator 注入)
  - `checkFusionCompat()`: 跨团 fusion_compatible 双向白名单校验
- ✅ `engine/voting.test.mjs` — 7/7 PASS (空议会/否决/通过/未达/abstain/by_layer/eligibility)
- ✅ `engine/dispatch.test.mjs` — 7/7 PASS (load/同团召集/fusion 识别/兼容校验/全 yes/否决/未达)

### 🔀 团魂跨团融合

44 团魂 frontmatter 新增字段:

```yaml
fusion_compatible: ["bp", "nj", "illit", "stayc"]
fusion_synergy: "9 色花束 vs 极致对比 / 治愈青春 / 接班 / 清新"
fusion_rules: "多元色彩,群像感不可丢"
```

- ✨ 跨团 brief 自动触发"团魂联席会议"
- ✨ 双向 fusion_compatible 校验（A 含 B 且 B 含 A 才算兼容）
- ✨ fusion_rules 标注每团"不可丢的 DNA 底线"

### 📚 文档

- ✨ `docs/group-soul-in-action.md` — 5 个真实 brief 对比 (有/无团魂层)
  1. TWICE 风格化妆品 hero
  2. BLACKPINK 风格奢侈品 landing
  3. BLACKPINK × TWICE 联名快闪 (fusion)
  4. NewJeans 风格 SaaS dashboard
  5. aespa × Dreamcatcher 联动 (fusion)

### 🎯 含义

v1.0.x = 营销概念 demo
v1.1.0 = 真能跑的多 agent 框架

下一步 (v2.0): 跨学科议会 (kpop × suanfish 哲学家互联)

## v1.0.2 · 2025

### 👯 团魂层 (Group Soul) 引入

K-pop 的核心不是个体——是**集体身份**。本版本新增 44 个"团魂" agent，
位于 idol 层之上，承载每个团的集体灵魂、美学基因、UI 设计宣言。

- ✨ 新增 `groups/<slug>.md` × 44 (TWICE / BP / IVE / aespa / NJ / ITZY / LSF / IDLE...)
- ✨ 团魂 vote_weight = 3，高于 Tier 0 (×2) / Tier 1 (×1.5)
- ✨ brief 提及团名/团成员 → 团魂**优先激活**并宣读集体宣言
- ✨ 团魂可**否决**违反集体 DNA 的 idol 个性主张
- ✨ SKILL.md 描述团魂层与 idol 层的关系

### 📊 完整网络可视化

- ✨ `docs/network-graph.md` — 6 hub idol (Yujin/Momo/Sana/Karina/Wonyoung/Jennie) + 2 bridge node
- ✨ `docs/network-full.md` — 全员 97 idol · 291 edge · 58 bridge node 自动生成图谱
  - 4 世代分子图 (Gen 2 / 3 / 4 / 5)
  - 跨代际桥接图 (top 8 bridge node)
  - 群组规模饼图
  - Top bridge: Ruka(BMON,9) / Jisoo(BP,7) / Miyeon(IDLE,7) / Hwasa(MMM,7)

### 📜 LICENSE 完善 + 双仓 attribution

- ✨ 补全完整 MIT 免责条款 (原文件截断)
- ✨ 显式致谢姊妹项目 suanfish-design-system 的安装器架构
- ✨ suanfish 仓库同步加 kpop 关联说明

### 📣 营销 4 件套

- ✨ `.marketing/xiaohongshu.md` — 小红书 3 篇 (主推/悬念/干货)
- ✨ `.marketing/douyin.md` — 抖音 5 条口播脚本 + BGM/投放
- ✨ `.marketing/wechat.md` — 微信公众号长文 (2900 字深度)
- ✨ `.marketing/twitter-en.md` — Twitter EN thread × 2 + 单推变体

## v1.0.1 · 2025

### 🐛 修复

- 🩹 **Bug #9 (虚拟机装机 bug)**: 首装环境没有 .copilot/.claude 目录时，
  detect() 返回空 → 安装器 process.exit(0) → 啥都没装。修复为主动创建
  ~/.copilot/skills + ~/.claude/skills 默认目录，确保虚拟机器装机 6/6 PASS。
  同步修复 suanfish v4.2.5。

## v1.0.0 · 2025

### 🎉 首发

- ✨ 97 idol agent · 4 代际 · 36 团
- ✨ Tier 0 全员议会 52 人 (8 大热门 + RV/MAMA/ILLIT/BABYMON)
- ✨ Tier 1 代际 leader 45 人 (2-2.5/3/4/5 代覆盖)
- ✨ 加权陪审团 2/3 表决机制
- ✨ 6 平台一键 installer (自动注册 skillDirectories, 复用算鱼 v4.2.4 成熟版本)
- ✨ /kpop /女团 /idol-congress 斜杠触发

### 🏗 架构

复用 [suanfish-design-system v4.2.4](https://github.com/SuanFishXYY/suanfish-design-system) 议会架构, 把哲学家/艺术家/音乐家圣人池替换为 KPOP 女团 idol。

### 🐛 继承修复

直接继承算鱼 8 大真凶治理:
- description ≤ 1024 字符上限
- settings.json 自动创建 + BOM 安全
- skill name 而非 agent 字段
- 6 平台 junction + 自动注册