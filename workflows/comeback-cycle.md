---
workflow_slug: comeback-cycle
workflow_name: Comeback Cycle (30 天 7 节点视觉日历)
phase_count: 7
---

# 🗓 Comeback Cycle · 30 天 7 节点视觉日历

K-pop 一次 comeback 不是出 1 张 KV——是 **D-30 倒计时 → D-DAY 释放 → 4 周打歌** 完整 60 天营销日历, 7 个关键节点视觉策略层层递进。

## 7 节点协议

| Day | 节点 | 主权 specialty | 输出 |
|-----|------|---------------|------|
| D-30 | Logo Teaser | typography + brand | social_card · 极简 logo · 隐藏视觉线索 |
| D-21 | Concept Photo 1 (Mood 1) | photography + palette | photo_set · era palette 首发 · mood 1 |
| D-14 | Concept Photo 2 (Mood 2) | photography + palette + brand | photo_set · 翻转 mood · diptych 对比 |
| D-7 | MV Teaser 1 | motion + hero | video_teaser · MV 关键镜头 verse 段 |
| D-3 | MV Teaser 2 | motion + hero + brand | video_teaser · hook 半句 + point dance 第 1 拍 |
| D-DAY | MV 正片 + 数字专辑 | 全 specialty | full_release · 5 媒介齐发 |
| D+7~D+28 | 打歌 4 周 | motion + hero + interaction | stage_variants · 灯光 +20% 浓度 |

## API

```js
import { dispatchComebackCycle, getStageBrief } from "kpop-design-system/engine/cycle.mjs";

// 一次性出 7 个 stage briefs
const cycle = dispatchComebackCycle("twice", "fancy");
console.log(cycle.stages); // [{ stage_slug, label, brief_summary, palette, motion_hint, ... }, x7]

// 单 stage 查询
const dday = getStageBrief("twice", "fancy", "d-day-mv-release");
```

## 行为约束

1. **D-30 / D-21 不能透露 MV 节奏** — teaser 节奏感反向工程会被粉丝识破
2. **D-DAY 必须 5 媒介齐发** — MV / SNS / Photocard / Lightstick / Stage (与 Multi-touchpoint Phase 3 联动)
3. **打歌期允许灯光 +20% 浓度补偿** — 实时灯光会吃色, 这是物理事实, 不算违反 era palette
4. **每个 stage 都继承 era.forbidden** — Fancy era 在所有 7 节点都禁 Y2K 贴纸

## 召唤策略 (跨节点 council 切换)

- D-30 ~ D-14 (teaser 期): photography + typography idol 主权
- D-7 ~ D-DAY (MV 期): motion + brand + hero idol 主权
- D+7 ~ D+28 (打歌期): motion + interaction + stage idol 主权

引擎自动按 `primary_specialty` 召集对应 council。

## 使用示例

```
用户: "IVE I AM era 完整 comeback cycle 视觉日历"
↓
引擎: dispatchComebackCycle("ive", "i_am") → 7 stage briefs
↓
LLM 输出: 7 节点 brief 表格 + 每节点召唤的 council 名单 + brief 详细文字
```
