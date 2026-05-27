# Agent Anatomy · 一个 idol agent 凭什么是一个独立 agent

> 186 idols × 全字段不同 = 186 套独立设计立场.

这份文档解剖一个 idol agent 在 schema 层面的**所有差异化维度**, 让你看懂: 这不是"换个名字的同一个模板", 这是 186 个**独立设计人格**, 每个都能 standalone 出具有辨识度的判断.

---

## 8 大差异化轴

每个 agent 在以下 8 个维度上都与其他 185 个不同. 任意两个 agent 抽出来对比, 至少有 6 个维度会发生显著差异.

### ❶ ui_specialty · 视觉专长 (最强信号)

这是 agent 在 CLI 路由阶段的**主关键词锚点**. 不重复, 不抄袭.

```yaml
aespa-karina:  ui_specialty: "SM赛博女王 · futuristic dashboard"
bp-jennie:     ui_specialty: "YG 千金高奢 · luxury minimalist"
ive-wonyoung:  ui_specialty: "公主感天花板 · pastel palace"
twice-momo:    ui_specialty: "暖色 K-pop · 元气糖果"
bm-ahyeon:     ui_specialty: "5代暗黑科技 · neo-dystopia"
bp-lisa:       ui_specialty: "舞台型设计师 · stage pop visual"
```

→ brief 里写 "公主感登录页", parseBrief 命中 `ive-wonyoung`; 写 "赛博 dashboard", 命中 `aespa-karina`.

### ❷ era · 代际归属 (硬约束)

`"2代"` / `"3代"` / `"4代"` / `"5代"`. 与 generation lint (R-Gen) 直接挂钩.

- 2代 (SNSD/KARA/wonder girls): 鲜艳高饱和 + 大头大特写
- 3代 (TWICE/BLACKPINK/RV): 高级 Y2K + 杂志大片
- 4代 (IVE/aespa/NJ/ITZY): 简洁极简 + AI cyber + 公主清爽并存
- 5代 (BABYMONSTER/ILLIT/IZNA): 暗黑科技 + 监控感 + 去性别

5 代团禁用 Y2K, 2 代团禁用 monochrome dystopia — **代际不能错位**.

### ❸ role · 团内职能

`"Leader"` / `"Main Vocal"` / `"Main Rapper"` / `"Lead Dancer"` / `"Maknae"` / `"Visual"` ...

影响**发言权威序列**: Leader 在 council 发言权重 +1, Main Vocal 在 audio/typography 判断有 +1 偏置. Visual 在 KV 评审权重 +1.

### ❹ personality + vibe + attitude · 性格三件套

- **personality**: 主标签 (例: "队长·门面·æ")
- **vibe**: 整体气场描述 (例: "sci-fi 视觉系, 未来感天花板")
- **attitude**: 招牌口头禅 / 签名 (例: "connect with æ")

这三个字段决定**发言文风**. demo `karina-vs-jennie-demo.mjs` 完全靠这三个字段差异化生成 voice.

### ❺ invited_helpers · 关系网

`[slug-a, slug-b, slug-c]` — 这个 agent 被 summon 时, 优先邀请的跨团助攻.

```yaml
aespa-karina:  invited_helpers: ["aespa-giselle", "aespa-ningning", "idle-soyeon"]
bp-jennie:     invited_helpers: ["bp-lisa", "kep1er-yujin"]
ive-wonyoung:  invited_helpers: ["aespa-karina", "lsf-sakura"]
```

→ v3.2 dynamic summoning 的核心: 召一个, 自动扩散召一片. 关系网决定 council 实际成员.

### ❻ group · 团归属 (跨团/同团信号)

决定:
- 同团成员自动 co-summon
- rivalry 触发 (BP ↔ TWICE)
- cross-label gate 触发 (SM × HYBE 同 brief 必须各 1 评委)
- fandom 自动召唤 (BLINK / ONCE / MY / NJZ / ...)

### ❼ tier + vote_weight · 投票权重等级

`tier: 0 / 1 / 2`, 对应 `vote_weight: 2 / 1.5 / 1` (Tier 0 = top idol).

K-pop 工业现实编码: **不是所有 idol 在 council 中等权**. Top tier 的判断更稀缺、更被尊重.

### ❽ description · CLI 路由字符串

每个 agent 一句独特 description, parseBrief 用它做模糊关键词匹配:

```yaml
aespa-karina:  description: "Yu Ji-min · aespa · Leader / Main Dancer / Lead Rapper · 个性: 队长·门面·æ · UI: SM赛博女王 · futuristic dashboard"
```

→ 用户随便丢一句 "想做 Karina 风格" / "队长视角" / "futuristic dashboard" 都能命中.

---

## 进阶字段 (v3.1.6.5+ 新增)

### ❾ personal_conflict · 人事冲突声明 (可选)

```yaml
personal_conflict: [other-idol-slug]
```

参与第六种冲突机制 R-Personal. 默认空数组. 用户基于公开事实扩展.

### 🔟 触发短语 (markdown body)

每个 agent .md 文件正文有 `## 🌐 触发短语` 列出 4-6 条**自然语言短语**, 用于增强 CLI 路由命中率.

---

## 一组真实对比 (6 idols)

| 字段 | Karina | Jennie | Wonyoung | Momo | Ahyeon | Lisa |
|------|--------|--------|----------|------|--------|------|
| group | aespa | BLACKPINK | IVE | TWICE | BABYMONSTER | BLACKPINK |
| era | 4代 | 3代 | 4代 | 3代 | 5代 | 3代 |
| role | Leader/Dancer/Rapper | Main Rapper | Center/Visual | Main Dancer | Leader/Vocal | Main Dancer |
| tier | 0 | 0 | 0 | 1 | 1 | 0 |
| vote_weight | 2 | 2 | 2 | 1.5 | 1.5 | 2 |
| ui_specialty | SM赛博女王 | YG千金高奢 | 公主感天花板 | 元气糖果 | 5代暗黑科技 | 舞台型设计师 |
| personality | 队长·门面·æ | rap queen·luxury icon | center·princess | 元气夯·能量站 | 5代leader·暗黑实力派 | dance machine |
| attitude | connect with æ | nice meeting you | I AM | shy shy shy | I am AHYEON | LALISA |

→ 6 个 agent 在 8 个字段中**全部不同**. 这不是"换皮", 是**结构性**差异化.

---

## 为什么这样设计

| 设计选择 | 替代方案 | 我们的取舍 |
|---------|---------|----------|
| 186 个独立 .md | 1 个表格 + 全员 row | 独立 .md 让 CLI 能像 `--agent=aespa-karina` 单独召唤, 像系统中的"人"一样存在 |
| 8 个差异化字段 | 只保留 group + role | 多字段让发言 voice 自然分化, 不靠 hard-coded 模板 |
| Tier 投票权重 | 一人一票 | 工业现实: K-pop 不是平等系统, top idol 判断更稀缺 |
| invited_helpers | 全员都可被召 | 关系网决定 council 化学反应, 不是堆人数 |
| era 硬约束 | era 仅 metadata | 代际错位是 R-Gen reject 信号, 不是装饰 |

---

## 一句话总结

> 这套系统不是 "186 个 idol 装饰品", 是 **186 套独立的设计判断算子** —
> 每个有自己的关键词锚点、关系网、权重、代际约束、性格 voice 和触发短语.
>
> 8 个字段乘起来, **每个 agent 是 unique 的 design persona**, 不可替代.

---

## 关联文档

- `INNOVATION.md` — 整套系统的创新点拆解
- `docs/CONFLICT-MECHANICS.md` — 6 种冲突机制 (含 personal_conflict 第 6 种)
- `examples/karina-vs-jennie-demo.mjs` — 字段差异化 → voice 差异化的可跑 demo
- `engine/dispatch.mjs` — parseBrief / summonCouncil 用这 8 个字段做路由的实现
