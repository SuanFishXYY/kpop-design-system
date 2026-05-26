# 📅 Comeback Cycle · v3.0 Phase 2

## 一句话
一次 comeback brief 不是 1 个 KV, 是 **30 天 7 个节点** 的 brief 日历 — 每个节点视觉策略不同。

## 7 节点时间线

| Day | Stage | 主权 specialty | 释出内容 | palette 释出? | mv_grammar? |
|-----|-------|--------------|---------|--------------|-------------|
| D-30 | Logo Teaser | typography / brand | 极简 logo + 倒计时 | ❌ | ❌ |
| D-21 | Concept Photo 1 | photography / palette | 全员定妆 + Mood 1 | ✅ 首次释出 | ❌ |
| D-14 | Concept Photo 2 | photography / palette / brand | Mood 2 (与 Mood 1 形成对比) | ✅ | ❌ |
| D-7  | MV Teaser 1 | motion / hero / photography | 15-30 秒 verse 段快剪 | ✅ | ✅ verse 段 |
| D-3  | MV Teaser 2 | motion / hero / brand | 高能版 + hook 半句 | ✅ | ✅ 完整 BPM |
| D+0  | MV Release | motion / hero / typography / brand / palette | **全释放** + landing + 数字专辑 | ✅ | ✅ 完整 |
| D+7  | 4 周打歌 | motion / hero / interaction | 舞台版本 (palette +20% 灯光) | ✅ | ✅ + stage 变奏 |

## 引擎 API (engine/cycle.mjs)

```js
import { dispatchComebackCycle, getStageBrief, listCycleStages } from "../engine/cycle.mjs";

// 一次产出 7 节点完整 brief 日历
const cycle = dispatchComebackCycle("twice", "fancy");
// → { group_slug, era_slug, era_name, cycle_total_days: 60, stage_count: 7, stages: [7 stage objects] }

// 单 stage 查询
const d_day = getStageBrief("twice", "fancy", "d-day-mv-release");
// → { ...stage, palette, motion_hint, mv_grammar, era_forbidden, combined_forbidden, brief_summary }

// 列 7 节点定义
const stages = listCycleStages();
```

## 4 行为约束 (cycle 协议)

1. **D-30 不准释出主视觉色** — 只有 logo + 倒计时, 透露 era_palette 即破协议
2. **D-21 起 palette 必须释出** — 早释出 (D-30 前) 或晚释出 (D-21 后) 都不专业
3. **D-7/D-3 才能注入 mv_grammar** — 之前是平面 + 静态
4. **D+7 打歌期 palette 可 +20% 浓度** — 舞台灯光物理补偿

## Council 切换策略
- Teaser 期 (D-30/D-21/D-14): 优先召唤 photography / typography
- MV 期 (D-7/D-3/D+0): 优先召唤 motion / hero
- 打歌期 (D+7): 优先召唤 motion / interaction / stage

## 配套
- 协议文档: `workflows/comeback-cycle.md`
- Demo: `node examples/cycle-demo.mjs`
