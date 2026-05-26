# 🌌 Era Universe · v3.0 Phase 1

## 一句话
同一团不同专辑视觉宇宙独立 — TWICE 的 Fancy era ≠ TWICE 的 Heart Shaker era。

## 数据结构 (groups/*.md frontmatter)

```yaml
eras:
  - era_slug: "fancy"
    era_name: "Fancy Era"
    year: 2019
    album: "Fancy You"
    palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" }
    mood: ["冷感", "高级", "杂志", "都市孤独"]
    typography_keywords: ["Didot", "Bodoni", "衬线", "大留白"]
    mv_grammar: "工业空间 + 冷光 + 定格凝视 + 高对比"
    photocard_style: "杂志大片 + 哑光"
    generation: "3代末"
    motion_hint: { bpm: 122, easing: "slow burn", duration: "long sustain" }
    forbidden: ["Y2K 贴纸", "高饱和粉", "校园元素", "可爱字体"]
```

## 覆盖范围
- **52 团全部**有 `eras:` 字段
- **12 顶级团** (twice/bp/ive/aespa/nj/itzy/rv/lsf/idle/mmm/illit/meovv) — 共 35 个 curated era
- **40 其他团** — 各 1 个 default era 兜底 (标 `note: "待人工补充"`)

## 引擎 API (engine/eras.mjs)

| 函数 | 用途 |
|------|------|
| `parseEras(raw)` | 从 .md frontmatter 解析 eras block |
| `loadAllEras()` | 一次性索引所有 group → era map (cached) |
| `listGroupEras(group_slug)` | 列某团所有 era |
| `getEraDNA(group_slug, era_slug)` | 拿单 era 完整 DNA |
| `detectEra(brief)` | brief 关键词 → 命中 era (era_name / album / slug) |
| `getEraLockedDNA(brief)` | 命中后返回 primary era + summary |
| `checkEraForbidden(brief, era)` | 违规检测 |

## 典型场景

### 场景 A · brief 命中 era
```
brief: "TWICE Fancy era 风格 hero landing"
→ detectEra → 命中 twice/fancy
→ getEraLockedDNA → palette=#2E2E3E/#B8A0C9/#D4AF7A · mood=冷感/高级
→ checkEraForbidden(brief, era) → 通过 (未提 Y2K)
```

### 场景 B · brief 命中 era 但用了 forbidden
```
brief: "TWICE Fancy era 风格, 加点 Y2K 复古贴纸"
→ 命中 twice/fancy
→ checkEraForbidden → 警告: "Y2K 贴纸" 在 Fancy era forbidden 列表
→ 建议: 改为 wave-pencil 杂志网格
```

### 场景 C · 未命中 era → 默认 group DNA
```
brief: "TWICE 暖色 landing"
→ detectEra → 未命中具体 era
→ 退化使用 group 默认 palette / mood
```

## 跨工具集成
- `engine/cycle.mjs` 30 天日历每节点都基于 era DNA 注入 palette/motion/mv_grammar
- `engine/coherence.mjs` 5 媒介一致性以 era palette 为 base 计算 HSL 偏差
- `engine/generation.mjs` 不直接读 era, 但 era.generation 字段会反向引用代际审美卡

## Demo
`node examples/era-demo.mjs`
