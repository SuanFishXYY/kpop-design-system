## v3.1.0 (2026-05-31) — 🧑‍⚖️ User-as-Judge (用户成为评委)

**v3.1: 用户从单向被服务者升级为 council 中的并肩评委, 拥有 veto / override / 偏好学习权**

### ❶ 用户票席 (User Seat) — `engine/user-jury.mjs`
- `castUserVote(verdict, weight, reason)` — 用户投票 (权重 1-3)
- `tallyWithUser(council_votes, user_vote)` — idol council + 用户合并 tally
- 新 verdict: `user_veto` (council pass 但用户 reject), `user_override` (council reject 但用户 pass)
- `audit_trail` 完整留痕

### ❷ 偏好学习 (Preference Memory) — `engine/user-prefs.mjs`
- 本地 JSON `~/.kpop-design/user-prefs.json` · 不上传
- `overrides` (最近 50 条)
- `favorites` (group/era, 最多 30, 按 count 排序)
- `rejected_specialties` (反复拒绝的 specialty 频次)
- API: loadUserPrefs / saveUserPrefs / recordOverride / recordFavorite / recordRejectedSpecialty / topFavorites / shouldSkipSpecialty

### ❸ 评审会议室 CLI — `bin/review.mjs`
- `node bin/review.mjs --brief="..."`
- 交互式: idol 担当轮流发言 → 用户 +1/-1/?/Enter → final verdict + weight + reason → 决议书
- 自动写入 prefs (if veto/override) + 可选标记 favorite

### ❹ Docs + Demo
- `docs/USER-AS-JUDGE.md` — 完整协议文档
- `examples/user-jury-demo.mjs` — 3 个 demo (veto/override/concur)

### 测试
- **86/86 PASS** (dispatch 25 + voting 7 + routing 14 + eras 10 + cycle 5 + coherence 6 + generation 7 + user-jury 6 + user-prefs 6)
- 较 v3.0 (74) 净增 12 tests
- 修复: dispatch lineages count 测试 5→6 (新增 generation lineage)

### 隐私
- 本地 only · 永不上传
- 路径可自定义: `loadUserPrefs("/custom/path")`
- 删档: `rm ~/.kpop-design/user-prefs.json`

---



**v3.0 集齐 ❶Era Universe + ❷Comeback Cycle + ❸Multi-touchpoint + ❹Generation Lint**

第一个把 K-pop 工业视觉策略代码化的开源系统。从 "186 idol × 1 套 palette" 升维为 "186 idol × N era × 5 媒介 × 4 代审美"。

### ❶ Era Universe (Phase 1 · 见 beta.1)
同一团不同专辑独立视觉宇宙。52 团 + 35 curated era。`engine/eras.mjs`。

### ❷ Comeback Cycle · 30 天 7 节点 brief 日历 (新)
- `engine/cycle.mjs` — 7 stage const (D-30 Logo Teaser → D+7 打歌)
- `dispatchComebackCycle(group, era)` 一次返回完整 era × 7 stage briefs
- `getStageBrief(group, era, stage_slug)` 单点查询
- 每 stage 自动绑定: ui_specialty 优先级 / palette (D-21 起释出) / motion / mv_grammar (MV 期注入) / era_forbidden + stage_forbidden 合并
- 配套 `workflows/comeback-cycle.md` 协议文档

### ❸ Multi-touchpoint Coherence · 5 媒介一致性引擎 (新)
- `engine/coherence.mjs` — MV / SNS / Photocard / Lightstick / Stage 5 媒介
- 每媒介内置物理补偿系数 (photocard CMYK 损失 / lightstick LED 偏白 / stage 灯光过饱和)
- `auditTouchpointCoherence(group, era, observations)` → 0-100 一致性 score + PASS/WARN/FAIL verdict + per-medium 偏差分析 + 校正建议
- HSL 色彩空间 + 色相 tolerance + 亮度/饱和度 deviation 计算

### ❹ Generation Aesthetic Lint · 4 代审美错位禁止 (新)
- `engine/generation.mjs` — 2/3/4/5 代审美卡片 (代表团 / 视觉签名 / 典型 keywords / 禁忌)
- `checkGenerationAesthetic(brief, group)` → 检测 brief 是否触犯团 generation 禁忌, 返回 violations + 建议正确 generation + 该团应走的审美方向
- 配套 `lineages/generation.md` 4 代审美时间线
- e.g. "5 代团 ILLIT 用 Y2K 复古" → 警告: Y2K 是 3 代语法; 5 代应走 暗黑科技/AI 后人类/neo-dystopia

### 测试
- **74/74 PASS** (dispatch 25 + voting 7 + routing 14 + eras 10 + cycle 5 + coherence 6 + generation 7)
- 较 v2.8 (46) 净增 28 tests · 较 beta.1 (56) 净增 18 tests

### 新文件清单
- `engine/cycle.mjs` + `engine/cycle.test.mjs` + `workflows/comeback-cycle.md`
- `engine/coherence.mjs` + `engine/coherence.test.mjs`
- `engine/generation.mjs` + `engine/generation.test.mjs` + `lineages/generation.md`

### Breaking changes
无。v2.x API 全部向后兼容。

### 不做的事
- ❌ 联邦/federated council (用户明确否决)
- ❌ 男团 (留 v3.5)

---



**v3.0 K-pop 工业级视觉策略系统 · Phase 1: Era Universe**

把 group palette 从 "1 套" 升维到 "N 个 era × N 套"。同一团不同专辑视觉宇宙独立。

**新数据 (groups/*.md)**
- 52 团全部新增 `eras:` frontmatter 字段
- 12 顶级团 (twice/bp/ive/aespa/nj/itzy/rv/lsf/idle/mmm/illit/meovv) 各 1-4 个 curated era · 共 35 era
- 40 其他团各 1 个 default era 兜底 (待人工补充)
- 每 era 含: palette / mood / typography_keywords / mv_grammar / photocard_style / generation / motion_hint / forbidden

**新引擎 (engine/eras.mjs)**
- `parseEras(raw)` — 从 group .md frontmatter 解析 eras 块
- `loadAllEras()` — 一次性索引所有 group → era map
- `listGroupEras(group_slug)` — 列某团所有 era
- `getEraDNA(group_slug, era_slug)` — 拿单 era 完整 DNA
- `detectEra(brief)` — brief → 命中 era (era_name / album / slug 三种匹配)
- `getEraLockedDNA(brief)` — 命中后返回 primary era + summary
- `checkEraForbidden(brief, era)` — 违规检测 (e.g. Fancy era 不准用 Y2K)

**新测试 (engine/eras.test.mjs)**
- 10 tests · 全 PASS (load/list/getDNA/detect/lock/forbidden)

**总测试数**: 56/56 PASS (dispatch 25 + voting 7 + routing 14 + eras 10)

**新示例 (examples/era-demo.mjs)**
- 跑 5 个 brief 看 era 命中、DNA 输出、forbidden 警告

**演示场景**
```
"TWICE Fancy era 风格的电商 landing"
  → 🔒 锁定 twice/fancy
    palette: #2E2E3E 工业灰 + #B8A0C9 雾紫 + #D4AF7A 香槟金
    typography: Didot · Bodoni · 衬线 · 大留白
    forbidden: Y2K 贴纸 · 高饱和粉 · 校园元素 · 可爱字体
```

**Phase 路线图 (v3.0 全套)**
- ✅ Phase 1: Era Universe (本次)
- ⏳ Phase 2: Comeback Cycle (30 天 7 节点 brief 日历)
- ⏳ Phase 3: Multi-touchpoint (MV/SNS/Photocard/Lightstick/Stage 一致性)
- ⏳ Phase 4: Generation Lint (2/3/4/5 代审美错位禁止)

---
## v2.4.0 (2026-05-30) — 🎯 Activate The 116 (idol 不再是投票傀儡)

**用户问到的盲点**: "我那么多 idol 有什么作用?"
**答案 (诚实)**: v2.3 之前, 116 idols 都有 ui_specialty + personality + vibe 完整 DNA, 但引擎只提取 stage_name + attitude — 等于沦为投票计数器.

**v2.4.0 全部激活**:

**dispatch.mjs `loadAllAgents`**
- idols 现在提取: ui_specialty, personality, vibe, role (新增 4 字段)
- 向后兼容: 旧消费者照常工作

**synthesize.mjs 新增 API**
- `aggregatePerformerDNA(council)` — 按 ui_specialty 关键词聚类 116 idols
- `getPerformersBySpecialty(council, dimension, limit)` — 按设计维度查担当
- `SPECIALTY_KEYWORDS` — 10 个设计维度自动分类: typography / motion / palette / layout / brand / hero / interaction / illustration / photography / copy

**synthesizeDesignBrief 返回新增 `performer_dna`** — 让 LLM 在写 brief 时按维度派工.

**实跑 (BLACKPINK × TWICE landing) 担当分配**:
- typography → Jennie (Human Chanel · 极简奢华)
- motion → Lisa + Rosé + Momo
- hero → Jisoo + Nayeon + Tzuyu
- copy → Chaeyoung + Jihyo + Sana
- layout → Jeongyeon (中性侠气 form layout)
- brand → Jihyo (brand voice 锚)

**SKILL.md 新章节**: `## 🎯 116 Performer 真激活 (v2.4.0)`

**新示例**: `examples/performer-demo.mjs`

**机制层**: dispatch.mjs 是 additive 字段扩展, voting/routing 0 改动, 32+14 = 46/46 tests 仍 PASS.

---
## v2.3.0 (2026-05-29) — 💰 Cost-Aware Model Routing (多任务别一锅烩用最贵的)

**底层逻辑**: 100+ agent 投票, 全用 Opus = 烧钱+慢, 全用 Haiku = panel veto 质量崩. **分层路由**才是颗粒度.

**新增 engine · routing.mjs**
- 3 档模型路由: premium (panel) / standard (group_anchor) / fast (performer + audience)
- API: getModelTier(agent) / getRecommendedModel(agent, family) / getRoutingPlan(council, family) / estimateCost(council)
- 支持 claude / gpt / gemini 三大 family
- 支持 frontmatter `model_tier` override

**实测省钱**
- BLACKPINK × TWICE landing (20 agents): smart=51 vs naive=200, **75% savings**
- IVE B 端 dashboard (12 agents): smart=25 vs naive=120, **79% savings**

**新增 routing.test.mjs**: 14 unit tests, 全部 PASS (含新旧 layer 名兼容测试).

**机制层稳定**: dispatch / voting / synthesize 0 改动. routing.mjs 是纯 additive 模块.

**总测试数**: 7 (voting) + 25 (dispatch) + 14 (routing) = **46/46 PASS**.

**SKILL.md 新章节**: `## 💰 Cost-Aware Model Routing (v2.3.0)` 含 API + 实跑省钱表 + Task tool 集成示例.

**新示例**: `examples/routing-demo.mjs` 跑 3 个 BRIEF 看真实分桶 + 省钱比.

---
## v2.2.0 (2026-05-28) — 🛠 /kpop design · Design Brief Discovery (真设计工具)

**重大补全**: 把"年度歌谣大赏"机制从"叙事秀"升级为"真能用的设计工具".

**新增 engine · synthesizeDesignBrief()**
- engine/synthesize.mjs · 聚合召唤 anchor 的 palette / mood_keywords / signature_tracks
- 输出「设计 DNA 包」: palette.all_hex / mood.intersection-union / motion.hint (BPM→tempo) / typography.suggested_stack / copy_tone / constraints / signals
- Rich frontmatter parser (parseRichFrontmatter) — 处理 dispatch.mjs 简单 parser 不支持的嵌套 YAML (palette block + signature_tracks list)

**新增工作流文档**
- workflows/design-brief.md · 5 阶段协议 (BRIEF → 引擎调用 → LLM 设计输出 → 议会投票 → 决议+沉淀) + 8 条 LLM 行为约束 + 4 条边界声明
- examples/worked-example-bp-twice.md · 真实跑通的 BLACKPINK × TWICE 跨厂牌 comeback landing 设计 brief (palette token 表 / IA 框架 / copy tone / 议会决议)
- examples/design-demo.mjs · 3 BRIEF demo 跑通脚本

**SKILL.md 新章节**: ## 🛠 Design Brief Discovery (v2.2.0)

**新触发短语**: `/kpop design`, `设计 brief 挖掘`

**核心补全**: 之前 voteSimulator 只能 yes/no, 现在 LLM 在 loop 里基于 DNA 包给出**具体设计建议** (palette token / typography stack / motion 方案 / IA 模块 / copy tone). 引擎 (确定性) + LLM (创意收敛) 真正闭环.

**三层分工**:
1. ① 引擎层 — synthesizeDesignBrief 出结构化 DNA
2. ② LLM 设计层 — 读 DNA, 收敛成 brief
3. ③ 议会层 — dispatchBrief 走加权投票

**机制层稳定**: dispatch.mjs / voting.mjs 0 修改, 32/32 tests 仍 PASS.

---
## v2.1.0 (2026-05-27) — 🎤 /kpop awards · 年度歌谣大赏典礼 (Plan C 闭环)

**Plan C 上线**: LLM 驱动的颁奖典礼实时叙事模式. 触发 /kpop awards <BRIEF> 进入红毯→提名→投票→颁奖→闭幕的完整典礼流程.

**新增 SKILL.md 章节**: ## 🎤 /kpop awards · 年度歌谣大赏典礼
- 5 阶段叙事协议 (Red Carpet / Nomination / Live Voting / Award Ceremony / Encore)
- 行为约束 4 条 (典礼口吻 / 必须真调引擎 / emoji 报幕格式 / BRIEF 不清先 ask_user)

**触发短语扩展**: 新增 /kpop awards, 召开年度歌谣大赏

**机制层不动**: 引擎 / 投票 / frontmatter 全部沿用 v2.0.0, Plan C 仅是表现层叙事协议. 32/32 tests 仍 PASS.

**渐进式三连闭环完成** (v1.6 → v2.0 → v2.1):
- v1.6.0 文档+别名 (zero risk)
- v2.0.0 代码+数据 rename (双 reader 兼容)
- v2.1.0 LLM 颁奖典礼叙事层 (zero engine change)

---
## v2.0.0 (2026-05-26) — 🏆 BREAKING: 代码层完整 rename (Plan B 下)

**主版本升级原因**: 把"年度歌谣大赏"叙事从 v1.6 的文档层下沉到代码层 + 数据层. 旧字段名通过双 reader 保留兼容.

**Frontmatter layer 字段重命名 (107 文件)**
- groups/* (45): `layer: group_soul` → `layer: group_anchor`
- fandoms/* (45): `layer: fandom` → `layer: audience`
- judges/* (7): `layer: judge` → `layer: panel`
- stages/* (5): `layer: stage_template` → `layer: award_category`
- lineages/* (5): `layer: lineage` → `layer: legacy_lineage`

**Engine 输出 layer 重命名 (dispatch.mjs)**
- summonCouncil 返回的 souls/judges/fandoms 内 `layer` 字段值改为新名
- dispatchBrief votes 数组中 `layer` 字段改为新名 (panel/group_anchor/audience/performer_t0/performer_t1)

**Voting 决议文案重命名 (voting.mjs)**
- "评委否决 (judge veto)" → **"评审不署名 (panel veto)"**
- "团魂否决 (group_soul veto)" → **"团代表不署名 (group_anchor veto)"**

**双 reader 兼容 (Backward Compat)**
- `voting.mjs::tallyCouncilVotes` 同时认 `panel` + `judge` 触发 veto
- `voting.mjs::tallyCouncilVotes` 同时认 `group_anchor` + `group_soul` 触发 veto
- `voting.mjs::isEligibleVoter` 接受旧+新所有 layer 名
- 外部代码若仍传入旧 layer 名, 引擎照常工作

**测试 rename**
- dispatch.test.mjs 测试名称从"团魂否决/JYP 评委对/评委 weight"重命名为"团代表不署名/JYP 评审对/评审 weight"
- voting.test.mjs 数据仍用旧 layer 名 (`layer: "group_soul"`) 测试双 reader 兼容
- **32/32 PASS** (voting 7/7 + dispatch 25/25)

**API alias 提升为 primary (v1.6 引入)**
- `setLineup` / `judgeProposal` / `buildAwardsStage` / `scoreAwardsStage` 现为推荐 API
- `summonCouncil` / `dispatchBrief` 保留 (alias, deprecated 但完全可用)

**docs**
- SKILL.md / package.json 同步到 v2.0.0
- 5 层评分结构 + 12 项词汇映射表完整呈现

---
## v1.6.0 (2026-05-26) — 🏆 概念 rebrand: 议会 → 年度歌谣大赏 (Awards Show)

**核心叙事重定位**
- 旧叙事「Idol Congress 议会」过于学究, 与系统真实机制不匹配
- 新叙事「KPOP Music Awards · 年度歌谣大赏」更贴近现实映射 (KBS 가요대축제 / MAMA / Golden Disc 颁奖典礼)

**词汇映射表 (向后兼容 · 不破坏代码)**
- 议会 (council) → **舞台阵容 (Stage Lineup)**
- 召集 (summon) → **编排上台 (setLineup)**
- 评委 (judges) → **评审团 (Awards Panel)**
- 团魂 (group_soul) → **团代表 (Group Anchor)**
- idol → **舞台担当 (Performer)**
- 粉丝团 (fandom) → **现场投票 (Audience Vote)**
- 投票 (vote) → **评审打分 (Score)**
- veto → **评委不署名 (No Award)**
- fusion → **合作舞台 (Collab Stage)**
- rivalry → **年度对决 (Awards Showdown)**
- stage 模板 → **奖项类目 (Award Category)**
- lineage → **传承大奖 (Legacy Lineage)**

**新 API 别名 (engine/dispatch.mjs)**
- `setLineup` = `summonCouncil` (alias)
- `judgeProposal` = `dispatchBrief` (alias)
- `buildAwardsStage` / `scoreAwardsStage` (alias)
- 旧函数保留, 完全向后兼容

**Docs**
- SKILL.md 全部叙事 rebrand
- package.json description 升级颁奖典礼叙事
- README rebrand 待 v1.6.x

**Tests**: 32/32 PASS (无回归)

**为什么这一步**: 在 v1.5 把生态打通后, 用户洞察到机制本质是"年度歌谣大赏 + 评委投票" 而非"idol 议会"。叙事换皮一步到位, 为 v2.0 代码层重命名铺路。

---
## v1.5.0 (2026-05-26) — ⚔️🎬🧬 D+E+F 三连闭环 (LINEAGE + Stage + RIVALRY)

**F · RIVALRY 宿敌机制**
- 16 个核心团魂 frontmatter 注入 `rivals: [slugs]` + `rivalry_narrative`
- BLACKPINK ↔ TWICE / aespa ↔ IVE / NewJeans ↔ ILLIT (HYBE 内战) / LE SSERAFIM ↔ NewJeans / (G)I-DLE ↔ ITZY / SNSD ↔ KARA / 2NE1 ↔ SNSD / BABYMONSTER ↔ ILLIT/NewJeans / KATSEYE ↔ BABYMONSTER/ILLIT / STAYC ↔ NewJeans / MAMAMOO ↔ 2NE1
- 引擎: `checkRivalry()` 检测互列 rival 的团对, 输出 `rivalry_check.pairs` (a/b/narrative/guidance)
- `dispatchBrief` summary 含 `rivalry` + `rivalry_pairs`
- guidance: "议会须保留张力差异化, 禁止强行调和"

**E · Stage 场景模板 (5 个)**
- 新目录 `stages/` 含 5 个常见 brief 场景化预设:
  - 🎬 `debut` 出道舞台 · 🔄 `comeback` 回归 · 🎤 `concert` 演唱会 · 🤝 `collab` 联名 · 🌐 `landing` 官网首屏
- 每个含 sample_brief + 默认议会构成 + 决议前 checklist
- 引擎: `loadStage(slug)` + `listStages()`

**D · LINEAGE 师承谱系 (5 条)**
- 新目录 `lineages/` 含 5 条 2代→5代传承链:
  - 🎤 `main_vocal` SNSD-Taeyeon → TWICE-Jihyo → IVE-Wonyoung → ILLIT-Iroha
  - 🔥 `rap_line` 2NE1-CL → BLACKPINK-Jennie → aespa-Karina → BABYMONSTER-Asa
  - 💎 `visual_center` SNSD-Yoona → TWICE-Tzuyu → IVE-Wonyoung → NewJeans-Hanni / ILLIT-Wonhee
  - 👑 `leader_dna` SNSD-Taeyeon → TWICE-Jihyo → IVE-Yujin → BABYMONSTER-Ruka
  - 💃 `dance_machine` SNSD-Hyoyeon/2NE1-Minzy → TWICE-Momo → ITZY-Yeji/aespa-Karina → BABYMONSTER-Rora
- 引擎: `loadLineage(slug)` + `listLineages()`

**Tests**
- voting 7/7 + dispatch 25/25 = **32/32 PASS** (新增 7 个 D/E/F 测试)

**Docs**
- SKILL.md 5 层架构 + v1.5 三连说明
- package.json description 升级 v1.5.0

---
## v1.4.0 (2026-05-26) — 🎨 A+B+C 三连闭环 (palette + fandom + tracks)

**A · 团色 HEX palette (45 souls)**
- 每个 group_soul frontmatter 新增 `palette: { primary, secondary, accent }` (HEX)
- 新增 `mood_keywords: [3 词]` 气质标签
- LLM 可直接消费输出视觉方案

**B · FANDOM 层 (新 45 文件 + 引擎接入)**
- 新目录 `fandoms/` 含 45 粉丝团 agent (ONCE / BLINK / DIVE / BUNNIES / MY / MIDZY...)
- Layer=`fandom`, weight=1, no veto, perspective=`user_proxy`
- 引擎: loadAllAgents 加载 fandoms · summonCouncil 同 group_slug 命中即召 · dispatchBrief 在 idol 之后追加 fandom 投票 · voting.isEligibleVoter 接受 fandom layer
- 议会从 4 层升级到 **5 层** (评委 > 团魂 > Tier0 > Tier1 > 粉丝团)

**C · signature_tracks 主打歌 (45 souls)**
- frontmatter 新增 `signature_tracks: [3 首]` 每首 `title/year/mood/bpm`

**Tests**: voting 7/7 + dispatch 18/18 = **25/25 PASS**

**Docs**: SKILL.md 5 层架构表 · package.json description 升级

---
# Changelog

## v1.3.1 · 2025 · 体检修复 (data integrity)

体检发现 5 处 slug↔group_name 错乱 + 文档过时:

### 🔧 修复

**团魂 slug 重新归位**:
- `h2h` 原标 "H1-KEY" → 改为 **Hearts2Hearts** (5代 HYBE, 2025, 6人接班团)
- `kiii` 原标 "KISS OF LIFE" → 改为 **KiiiKiii** (5代, Y2K girl crush)
- `kol` 原标 "Kep1er & 选秀传承" (错乱) → 改为 **KISS OF LIFE** (4代 R&B)
- ✨ 新增 `groups/smn.md` → **SAY MY NAME** (5代 HYBE/SOURCE, 2025)

**idol agent 字段标准化**:
- snsd-taeyeon: `group: "Girls' Generation (SNSD)"` → `"Girls' Generation"`
- wjsn-exy: `group: "WJSN/Cosmic Girls"` → `"WJSN"`

### 📝 文档更新

- SKILL.md description / 议会构成表 (v1.0→v1.3 · 97→116 idol · 4 层架构)
- package.json description (116 idols · 45 group souls · 7 judges)
- README.md badges + 议会构成全章节重写
- 议会层级现在显示: judges 7 / souls 45 / tier_0 71 / tier_1 45

### ✅ 测试

- voting.test.mjs: 7/7 PASS
- dispatch.test.mjs: 15/15 PASS
- 总计 **22/22 PASS** (souls 期望从 ≥40 收紧到 ≥45)

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

复用 [suanfish-design-system v4.2.4](https://github.com/SuanFishXYY/suanfish-design-system) 议会架构, 把哲学家/艺术家/音乐家的 sage 池替换为 KPOP 女团 idol。

### 🐛 继承修复

直接继承算鱼 8 大真凶治理:
- description ≤ 1024 字符上限
- settings.json 自动创建 + BOM 安全
- skill name 而非 agent 字段
- 6 平台 junction + 自动注册