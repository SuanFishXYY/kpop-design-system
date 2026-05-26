# 🛠 Design Brief Discovery 工作流 (v2.2.0)

把「年度歌谣大赏」机制用作**真实的页面/功能设计 + 需求挖掘工具**。

## 工作流定位

| 模式 | 触发 | 目的 |
|------|------|------|
| `/kpop awards` | 颁奖典礼叙事 | 用真实引擎跑一场决议秀, 重在「氛围 + 决议」 |
| **`/kpop design`** | **设计 brief 挖掘** | **用引擎+LLM 协同产出可落地的设计稿** |

## 三层分工

```
┌─────────────────────────────────────────────────────────────────┐
│  ① 引擎层 (确定性 · synthesizeDesignBrief)                       │
│     - summonCouncil(BRIEF) → 召出 panel + anchor + audience       │
│     - 聚合所有 anchor 的 palette / mood_keywords / tracks          │
│     - 计算 BPM 区间 → motion hint                                  │
│     - 计算 mood union/intersection → typography hint               │
│     - 提取 panel 的 judging_style + manifesto → copy tone          │
│     - 触发 rivalry / cross_label / fusion 信号                     │
│     输出: 结构化 「设计 DNA 包」 JSON                              │
│                                                                  │
│  ② LLM 设计层 (我 · 在 loop 里替代 voteSimulator)                 │
│     - 读 DNA 包, 选最终 palette (3-5 色, 标注 hex)                  │
│     - 选 typography stack (从 suggested_stack 收敛)                │
│     - 选 motion 方案 (沿用 hint 或微调)                           │
│     - 写 copy tone & headline 示范                                 │
│     - 起 IA / 组件清单 (匹配 BRIEF 场景)                            │
│     - 用每个 agent 的视角写一句"投赞成/反对+理由"                  │
│                                                                  │
│  ③ 引擎层 (汇总 · scoreAwardsStage)                                │
│     - 收 LLM 各 agent 的投票 → 加权得分                            │
│     - 评审不署名 / 团代表不署名 触发 → 否决                        │
│     - 输出: 最终设计 brief 通过/否决 + 综合方案                    │
└─────────────────────────────────────────────────────────────────┘
```

## 5 阶段协议

### Phase 0 · BRIEF 起草

用户输入: `/kpop design <BRIEF>`. BRIEF 可以含/不含 group 名:
- 含: `"IVE 风格 公主感 SaaS dashboard"` → 直接命中 anchor
- 不含: `"做个 B 端 SaaS landing"` → LLM 先建议 2-3 个匹配的 anchor 让用户选

BRIEF 太模糊 (e.g. 只有 "做个 landing") → 必须先 `ask_user` 问场景/受众/调性 3 个关键点。

### Phase 1 · 引擎调用 (synthesizeDesignBrief)

```js
import { synthesizeDesignBrief } from "kpop-design-system/engine/synthesize.mjs";
const dna = synthesizeDesignBrief(BRIEF);
```

输出字段:
- `lineup` — panel/anchors/audience/performers 名单
- `palette.anchors` — 每个 anchor 的 primary/secondary/accent hex
- `palette.all_hex` — 候选色板汇总
- `mood.intersection` — 多 anchor 共有的 mood (强信号)
- `mood.union` — 所有 mood 汇总
- `mood.distribution` — mood 出现频次
- `motion.bpm_avg` + `motion.hint` — 节奏倾向 (slow/standard/snappy/explosive)
- `typography.suggested_stack` — 字体栈建议
- `copy_tone` — 文案口吻线索 (从 panel + anchor 提炼)
- `constraints` — panel 的硬约束 (style + manifesto + veto_scope)
- `audience` — 用户代理的 catchphrase
- `signals.rivalry/cross_label/fusion` — 三大触发信号
- `anchor_dna` — 完整 anchor DNA (LLM 可以深挖)

### Phase 2 · LLM 设计输出

LLM 读 DNA 包, 产出**结构化设计 brief**:

```markdown
## 🎨 设计 Brief · {场景}

### Palette (从 dna.palette.all_hex 收敛)
- Primary: #XXX (来自 {anchor} 的 primary)
- Secondary: #XXX
- Accent: #XXX
- Neutral: #FFFFFF / #0A0A0A

### Typography (从 dna.typography.suggested_stack 收敛)
- Display: {从栈选}
- Body: Inter / SF Pro

### Motion (基于 dna.motion.hint)
- Easing: {hint.easing}
- Duration: {hint.duration_ms}

### IA / 组件清单 (基于 BRIEF 场景 + signals)
- Hero: {数量, 双/单 hero}
- 模块: ...

### Copy Tone (基于 dna.copy_tone + constraints)
- Headline 风格: ...
- 禁忌词: ...
- 必须保留: ...

### 信号约束 (基于 dna.signals)
- rivalry → 差异化处理双 hero
- cross_label → 双方都需署名
- fusion → 保留 fusion_rules

### 风险与权衡
- ...
```

### Phase 3 · 议会投票 (dispatchBrief + LLM voteSimulator)

LLM 在 voteSimulator 里, 替每个 agent 写一句**针对 Phase 2 设计稿**的 yes/no + 一句话理由 (用 agent 视角发声). 调用 `dispatchBrief(BRIEF, voteSimulator)` → 拿到加权决议.

### Phase 4 · 决议 + 复盘

- 通过 → 输出 Phase 2 设计稿 + 议会决议附录
- 否决 (评审不署名 / 团代表不署名) → 输出否决理由 + 修改建议, 回到 Phase 2

### Phase 5 · 沉淀

把这次 BRIEF + DNA + 设计稿 + 决议存档到 `examples/` 作为后续可复用模板.

## 何时该用 `/kpop design` 而非 `/kpop awards`

| 场景 | 选 |
|------|------|
| 我要真的设计一个页面/功能, 拿到 palette/typography/IA | **`/kpop design`** |
| 我想看一场叙事秀, 把设计决议包装成颁奖典礼 | `/kpop awards` |
| 我在挖需求, 需要不同流派的 anchor 给我视角碰撞 | **`/kpop design`** (rivalry/cross_label 信号特别有用) |
| 演示给客户/同事 | `/kpop awards` (戏剧性) |

## 行为约束 (LLM 必须遵守)

1. **必须真调引擎**: 必须实际 import `synthesizeDesignBrief`, 不能纯虚构 DNA
2. **palette 必须来自引擎**: 不能凭空编 hex, 必须从 `dna.palette.all_hex` 选
3. **typography 必须从 suggested_stack 收敛**: 不能跳出推荐栈
4. **motion 必须遵守 hint**: 可微调但 tempo 方向不能反 (explosive 不可改 slow)
5. **rivalry 触发时**: 设计稿必须包含「差异化处理」段落, 不能强行调和
6. **cross_label 触发时**: 设计稿必须双方厂牌色都署名
7. **panel veto**: 任何 panel 的 manifesto 被违反 → LLM 在 voteSimulator 里必须给 `is_veto: true`
8. **BRIEF 不清**: 先 `ask_user` 问 3 个关键点 (场景/受众/调性), 不要硬上

## 边界 (诚实说不能做什么)

- ❌ **不能自动出视觉稿**: 没集成 Figma/AI 生成, 只到「文字 brief + 色板列表」
- ❌ **不能写代码组件**: IA 只到模块名 + 用途, 不到 React/Vue 代码
- ❌ **不能保证 anchor 选得对**: 若 BRIEF 没明确点名, 召唤的 anchor 可能不是最优, 需用户 review
- ✅ **能做**: palette / typography 候选, motion 节奏, copy tone, IA 框架, 议会决议附录
