# Collaboration · idol agent 之间怎么协作

> 6 种协作机制, 让 186 个独立判断算子涌现出 council 化学反应.

如果说 `AGENT-ANATOMY.md` 解释了**每个 agent 凭什么独立**, 这份文档解释**他们彼此怎么咬合**.

---

## 协作 ≠ 简单拼盘

一个 council 不是"把 5 个 idol 塞进同一个 prompt", 而是:

```
用户 brief
  │
  ↓
[parseBrief]  ← 抓团 / 抓 idol / 抓 era / 抓关键词
  │
  ↓
[summonCouncil]  ← 6 种召唤+扩散机制
  │
  ↓
council = {judges, souls, invited, fandoms}
  │
  ↓
[6 conflict checks]  ← rivalry / cross-label / personal_conflict / ...
  │
  ↓
[tallyCouncilVotes]  ← 加权投票
  │
  ↓
verdict
```

下面 6 种机制贯穿这条流水线.

---

## ❶ parseBrief 关键词路由 · 召唤入口

**触发**: 用户 brief 文本.

**机制**: dispatch.mjs `parseBrief()` 用 description 字段做模糊匹配, 把 brief 拆成:

```javascript
{ mentioned_groups: [...], mentioned_idols: [...] }
```

**例**:

```
brief: "用 Karina 和 Wonyoung 的视角设计 4 代未来感登录页"
→ mentioned_idols: [aespa-karina, ive-wonyoung]
→ mentioned_groups: [aespa, IVE]
```

**这是协作的起点 — 不路由就没人来开会.**

---

## ❷ invited_helpers · 关系网扩散 (跨团传染)

**触发**: 任意被召的 idol 的 `invited_helpers` 字段.

**机制**: dispatch.mjs L184-190 — 召一个, 自动扩散召一片.

```yaml
# aespa-karina.md
invited_helpers: ["aespa-giselle", "aespa-ningning", "idle-soyeon"]
```

→ 召 Karina → 同时召 Giselle / Ningning (同团) + Soyeon (跨团 idle).

**关键**: 这是 **v3.2 dynamic summoning 的核心**. 不再是"用户必须列全名单", 是"系统知道谁该一起开会".

**化学反应来源**: 跨团 helpers 让 SM × CUBE / YG × HYBE 跨公司视角自然碰撞.

---

## ❸ 同团 co-summoning · group 字段联动

**触发**: 任意 group 被命中.

**机制**: dispatch.mjs L174-181 — 整团 idol 都自动加入 council.

```javascript
for (const g of mentioned_groups) {
  for (const i of idols) {
    if (i.group === g.name) invitedSet.add(i.slug);
  }
}
```

**例**: brief 提到 "aespa" → Karina + Giselle + Winter + Ningning 全部进 council, 4 个 voice 同时发言.

**化学反应**: 同团成员之间有内置默契 + 但在 ui_specialty 上往往**各有专长**, 不冗余.

---

## ❹ Weighted Voting · 不平等表决

**触发**: council 出 verdict 阶段.

**机制**: voting.mjs `tallyCouncilVotes()` — vote_weight 按 tier 分配:

| 角色 | weight | 说明 |
|------|:---:|------|
| Judge (评委) | ×5 | label 资深人士 / 制作人 |
| Soul (团魂) | ×3 | 团本身的设计语言 |
| Tier 0 idol | ×2 | top idol |
| Tier 1 idol | ×1.5 | 主力 idol |
| Tier 2 idol | ×1 | rookie / 辅助位 |
| Fandom | ×1.5 | 粉丝团代表 |

**协作含义**: 不是少数服从多数. **稀缺判断更被尊重**. council 不是平等讨论会, 是工业层级的反映.

---

## ❺ Cross-label Gate · 跨公司平衡 (硬约束)

**触发**: 一次 brief 同时召唤了多个 label 旗下的团.

**机制**: dispatch.mjs `checkCrossLabelGate()` — 涉及 N 个 label, council 必须**每方至少 1 评委**:

```javascript
// fusion brief: aespa (SM) × BABYMONSTER (YG) × IVE (Starship)
required: 3 judges (1 SM + 1 YG + 1 Starship)
actual: 2 judges (SM + YG)
→ gate FAIL · brief 必须返工
```

**协作含义**: **没有单一公司视角可以主导 fusion brief**. 不让 SM 评委自己说了算 SM × YG 的合作 KV.

详见 `docs/CONFLICT-MECHANICS.md` 第 ❷ 节.

---

## ❻ Personality-driven Voice Differentiation · 性格 voice 分化

**触发**: council deliberation 阶段每个 agent 发言.

**机制**: 每个 agent 用自己的 `personality + vibe + attitude` 三件套生成 voice. 不是 LLM 自由发挥, 是**字段约束的 voice**.

**真实 demo**: `examples/karina-vs-jennie-demo.mjs`

同一 brief, 不同 voice:

```
Karina:   "connect with æ — 我们要的是 sci-fi 大反差, 不是糖果色"
Jennie:   "nice meeting you ✨ — 这是 luxury, 不是 cyber. 我建议 monochrome + 高奢留白"
Wonyoung: "I AM — 公主感不能丢, 但可以加未来感. pastel 渐变 + 微 cyber 元素"
```

→ 3 个 idol, 3 个 ui_specialty, 3 个完全相反的设计建议. **协作不是和稀泥, 是显性化分歧**.

---

## 全表

| # | 机制 | 协作类型 | 实现位置 |
|---|------|---------|---------|
| ❶ | parseBrief 路由 | 召唤入口 | dispatch.mjs `parseBrief` |
| ❷ | invited_helpers 扩散 | 跨团传染 | dispatch.mjs L184-190 |
| ❸ | 同团 co-summoning | 团内联动 | dispatch.mjs L174-181 |
| ❹ | weighted voting | 等级表决 | voting.mjs `tallyCouncilVotes` |
| ❺ | cross-label gate | 跨公司平衡 | dispatch.mjs `checkCrossLabelGate` |
| ❻ | personality voice | 字段约束发言 | demo + LLM prompt 模板 |

**6 种合作运行 = council 不是堆人头, 是结构化对话.**

---

## 一个完整 e2e 例子

**Brief**: "用 aespa Karina + IVE Wonyoung 设计 4 代未来感登录页"

### Step 1 · parseBrief (❶)

```
mentioned_idols: [aespa-karina, ive-wonyoung]
mentioned_groups: [aespa, IVE]
mentioned_era_signals: ["4 代", "未来感"]
```

### Step 2 · invited_helpers 扩散 (❷)

```
Karina.invited_helpers: [aespa-giselle, aespa-ningning, idle-soyeon]
Wonyoung.invited_helpers: [aespa-karina, lsf-sakura]
→ council 多了 4 人: Giselle, Ningning, Soyeon, Sakura
```

### Step 3 · 同团 co-summoning (❸)

```
aespa 团 → +Winter
IVE 团 → +Yujin, Liz, Leeseo, Rei, Gaeul
→ council 再 +6 人
```

### Step 4 · cross-label gate 校验 (❺)

```
labels involved: SM (aespa), Starship (IVE), CUBE (idle-soyeon), HYBE (lsf-sakura)
required: 4 judges
现状: 自动召 4 名评委 ✅ gate PASS
```

### Step 5 · 投票权重 (❹)

```
Karina (T0)  ×2     |  Wonyoung (T0)  ×2     |  aespa soul ×3
Yujin (T0)   ×2     |  Sakura (T0)    ×2     |  IVE soul ×3
Giselle (T1) ×1.5   |  Winter (T0)    ×2     |  评委 ×5 each
... fandom ×1.5 each
```

### Step 6 · voice 差异化 (❻)

每人按自己的 ui_specialty + attitude 发言. 5 票 PASS, 3 票 REJECT, 2 票 DIVERGENT.

### 最终 verdict

`tallyCouncilVotes` 加权后: PASS 占 62% → 触发 verdict divergence (第 5 种冲突机制) → 返回 rework.

**这套流水线全程自动. 用户只输了一句话, 触发 6 种协作 + 6 种冲突检测.**

---

## 与 AGENT-ANATOMY 的关系

| 文档 | 视角 |
|------|------|
| AGENT-ANATOMY.md | **单个 agent 凭什么独立** (8 差异化轴) |
| **COLLABORATION.md** | **agent 之间怎么咬合** (6 协作机制) |
| CONFLICT-MECHANICS.md | **agent 冲突时怎么显性化** (6 冲突机制) |

三份文档配套读完 = 完整理解 council 工作原理.

---

## 哲学

> council 不是把多个 agent 排成一列轮流说话, 是让他们的**字段差异**自然涌现出对话.
>
> 协作的本质 = 关系网 (helpers) + 等级 (tier) + 平衡 (cross-label) + 性格 voice (personality).
>
> 把这 4 个写死成代码, 协作就不再是"运气好就出彩".
