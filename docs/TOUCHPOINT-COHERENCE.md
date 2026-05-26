# 🎨 Multi-touchpoint Coherence · v3.0 Phase 3

## 一句话
同一 era 在 MV/SNS/Photocard/Lightstick/Stage 5 媒介之间应保持视觉一致 — 但每媒介有物理特性, 不能机械复制 HEX。

## 5 媒介物理补偿系数

| 媒介 | 亮度偏移 | 饱和度偏移 | 色相容差 | 物理原因 |
|------|---------|-----------|---------|---------|
| **mv** | -5% | +5% | ±8° | 影视调色普遍略暗, 色温允许偏移 |
| **sns_post** | 0% | 0% | ±3° | 数字屏最接近 era base, 偏差应最小 |
| **photocard** | -8% | -12% | ±5° | CMYK 印刷损失饱和度, 需源文件预补偿 |
| **lightstick** | +20% | -5% | ±12° | LED 发光偏白, 色相允许较大漂移 |
| **stage** | +15% | +20% | ±10° | 舞台灯允许浓度 +20% |

## 引擎 API (engine/coherence.mjs)

```js
import { auditTouchpointCoherence, listTouchpoints } from "../engine/coherence.mjs";

const report = auditTouchpointCoherence("twice", "fancy", [
  { medium: "mv",         palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  { medium: "photocard",  palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  // ... 其他 3 媒介
]);
// → {
//     overall_score: 0-100,
//     verdict: "PASS" | "WARN" | "FAIL",
//     results: [{ medium, label, medium_score, primary_dev, secondary_dev, accent_dev, suggestions }]
//   }
```

## Verdict 阈值
- **PASS** ≥ 80
- **WARN** 60-79
- **FAIL** < 60

## 算法
1. HEX → HSL 转换
2. 每色相对 era base 计算: l_dev (亮度偏离) / s_dev (饱和度偏离) / h_dev (色相偏离)
3. 减去该媒介的 typical_offset (允许的物理补偿)
4. 转换为 0-100 score, 三色平均

## 典型 use case
- 设计稿评审: 设计师交付 5 媒介稿后跑一次 audit, 自动找出"过亮 photocard"或"色相漂移 stage"
- Brand guideline 维护: 每季度对历史交付物做 audit, 找出 brand drift
- AI 生图 QC: 用 AI 生成 5 媒介物料后自动 audit, 不合格的退回再生

## 不做
- ❌ 不做 pixel-level OCR (需要外部工具如 ImageMagick)
- ❌ 不做 ΔE Lab 色差 (HSL 已足够)
- ❌ 不做向量 vs 位图自动识别

## Demo
`node examples/coherence-demo.mjs`
