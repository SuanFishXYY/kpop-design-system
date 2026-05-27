# 议会冲突机制全谱 · 6 种冲突的显性化

> **核心命题**: 冲突不是要消除, 是要被显性化.

K-pop 工业是一个高密度对抗结构: 团之间宿敌, 公司之间打官司, 代际之间审美错位, 偶像之间真实存在人事变动. 这套系统不试图给冲突涂磨皮 — 而是把它编码成可验证的工程信号.

总共 **6 种冲突机制**, 全部已实现并通过测试.

---

## ❶ Rivalry · 团间宿敌张力

**触发**: 任意两团在彼此 `groups/*.md` 的 `rivalry` 字段中互相列出.

**典型**: BLACKPINK ↔ TWICE / aespa ↔ IVE / NewJeans ↔ LE SSERAFIM

**输出**: `rivalry_check.has_rivalry = true`, 附 `pairs[]`.

**effect**: council 默认仍然 deliberate, 但 verdict 上会留 "rivalry tension acknowledged" 注脚, fandom 投票时往往出现高度分裂.

---

## ❷ Cross-label Gate · 跨公司平衡门

**触发**: 一次 brief 同时召唤了多个 label 旗下的团, 且 fusion 模式开启.

**强约束**: 涉及 N 个不同 label, council 必须同时召集 ≥1 名来自每个 label 的 judge. 否则 cross_label gate 失败, brief 必须返工.

**保护**: 防止 council 被单一公司视角主导.

---

## ❸ Generation Lint · 代际审美错位

**触发**: brief 关键词的代际信号与团的 `era` 字段不符.

**例**: brief 写 "Y2K 复古甜美" + 召唤 BABYMONSTER (5 代) → R-Gen 警告, 建议 neo-dystopia.

**效果**: 默认 warn 不 reject; 用户可在 frontmatter 强制 `force_retro_homage: true` override.

---

## ❹ Veto Chain · 评委一票否决

**触发**: 任一 judge 投 `REJECT`.

**效果**: 即便其他人 PASS 多, judge 的 REJECT 在 tally 中占 ×5 权重 → 一票实质性否决.

**哲学**: 工业级标准凌驾于热情之上.

---

## ❺ Verdict Divergence · 表决分裂

**触发**: tally 结果 PASS/REJECT 比例在 40%-60% 灰区.

**效果**: 输出 `verdict: "DIVERGENT"`, 强制 brief 返回修改而非直接 ship.

**哲学**: 议会不是多数暴政, 模糊的胜利 = 没有胜利.

---

## ❻ Personal Conflict · 人事冲突 (R-Personal) 🆕

**触发**: council 内同时存在已公开记录的人事冲突双方.

### A. 中央 registry · `engine/conflicts.mjs` (pair-wise)

集中维护 `PERSONAL_CONFLICTS` 数组. 每条:

```javascript
{
  parties: ["slug-a", "slug-b"],
  type: "label-dispute" | "post-departure" | "lineup-change" | "cross-company-public",
  severity: "low" | "medium" | "high",
  advisory: "中性描述",
  suggested_mediator: "third-party-judge-slug" | null,
  public_record: "公开来源引用"
}
```

**当前 seed**: 0 条. 框架中立, 用户基于自己领域知识扩展.

### B. agent 自带字段 · `personal_conflict: [...]`

任意 idol agent 可在 frontmatter 声明:

```yaml
name: idol-x
personal_conflict: [idol-y, idol-z]
```

`deriveFromAgentFields()` 会展开成对称 pair, 与中央 registry 合并后参与 check.

### C. Label Dispute Advisories · 团 ↔ label 公开纠纷 🔥 真实 seed

与 pair-wise PERSONAL_CONFLICTS 不同, **`LABEL_DISPUTE_ADVISORIES`** 编码的是
**团与其 label 之间有据可查的公开纠纷** — 影响 brief 创作的**语境信号**.

```javascript
{
  group_slug: "newjeans",
  label_entity: "ADOR (HYBE subsidiary)",
  status: "active public legal proceedings",
  advisory: "this group has publicly documented active legal proceedings between members and their label entity as of public record...",
  affected_members: ["nj-minji", "nj-hanni", "nj-danielle", "nj-haerin", "nj-hyein"],
  public_record: "2024-2025 公开法律程序 · HYBE / ADOR 双方公告 · 法院文件",
  suggested_mediator: "neutral-evaluator"
}
```

**当前 seed**: 1 条 (NewJeans · 2024-2025 公开法律程序).

**为什么不用 PERSONAL_CONFLICTS pair-wise 编码这个事件?** NJ 5 名成员**对外一致**,
不是彼此冲突. 强行 pair-wise 编码会错误地暗示成员之间有矛盾. 这是**事实驱动**的考量.

### 输出

```javascript
personal_conflict_check: {
  has_personal_conflict: false,  // 默认空 seed
  fires: []
}
label_dispute_check: {
  has_label_dispute: true,
  advisories: [{
    rule: "R-LabelDispute",
    group_slug: "newjeans",
    label_entity: "ADOR (HYBE subsidiary)",
    status: "active public legal proceedings",
    advisory: "...",
    public_record: "2024-2025 公开法律程序 · HYBE / ADOR 双方公告 · 法院文件",
    suggested_mediator: "neutral-evaluator"
  }]
}
```

### ⚠️ 内容政策 (硬约束)

只编码 **公开记录的商业 / 法律 / 人事变动事实**:

✅ 上市公司合同纠纷公告 (例: label 与艺人解约公开诉讼)
✅ 阵容变动官方公告 (退团 / 加入 / 更名)
✅ 法庭公开记录

❌ 未证实的指控 / 八卦 / 私人传闻 / 粉圈 drama
❌ 任何带价值判断的措辞 ("谁是错的")

**语言要求**: 完全中性, 不带价值判断, 不站队.

### 哲学

> 议会不是一个清白的地方. 把"假装没冲突"换成"承认有公开纠纷, 给出语境信号", 才是工业级.

---

## 全表

| # | 机制 | 检测对象 | 强度 | 实现文件 |
|---|------|---------|------|---------|
| ❶ | Rivalry | 团 × 团 | warn | dispatch.mjs `checkRivalry` |
| ❷ | Cross-label Gate | label × label | hard reject | dispatch.mjs `checkCrossLabelGate` |
| ❸ | Generation Lint | brief × era | warn | dispatch.mjs `checkGenerationLint` |
| ❹ | Veto Chain | judge verdict | ×5 weight | voting.mjs |
| ❺ | Verdict Divergence | 整体 tally | rework | voting.mjs |
| ❻ | Personal Conflict | idol / soul / label 对偶 | advisory | conflicts.mjs `checkPersonalConflict` + `checkLabelDisputeAwareness` |

**6 种合作运行 = council 不是和稀泥, 是结构化对抗.**

---

## 测试覆盖

`engine/conflicts.test.mjs`: 12/12 PASS
- personal: empty / single / matched pair / partial / case-insensitive / 三方 / derive / derive+registry
- label-dispute: empty souls / NewJeans 命中 / 无关团 / seed 完整性校验

总 engine tests: **68/68 PASS**.

---

## 扩展指南

要为你的领域扩展 R-Personal registry, 编辑 `engine/conflicts.mjs`:

```javascript
export const PERSONAL_CONFLICTS = [
  {
    parties: ["group-a-soul", "label-b-judge"],
    type: "label-dispute",
    severity: "high",
    advisory: "ongoing public legal proceedings; brief should not assume harmony",
    suggested_mediator: "neutral-evaluator",
    public_record: "公司公告 2024-XX-XX"
  },
];
```

或在某个 idol agent .md frontmatter 加:

```yaml
personal_conflict: [some-other-idol-slug]
```

**两种方式互补, 系统会去重 + 合并.**
