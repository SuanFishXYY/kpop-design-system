---
lineage_slug: generation-aesthetics
lineage_name: K-pop 4 代审美时间线
generations: ["2代", "3代", "4代", "5代"]
---

# 🧬 Generation Aesthetics · K-pop 4 代审美时间线

每 5 年 K-pop 视觉语法整体迭代一次。让 5 代团穿 3 代衣服 = 时代错位, 工业内会笑话。

## 2 代 (~2007-2012)

**代表**: SNSD · KARA · Wonder Girls · f(x) · Brown Eyed Girls

**视觉签名**: 高饱和糖果色 · 粉嫩 · 大头特写 · 校园制服 · 圆润字体 · 8 个以上女团群像

**典型 motion**: 高对比 snappy 抖动

**禁忌 (代际错位)**: 暗黑科技 · 监控构图 · AI cyber · 极简留白 · 去性别 · neo-dystopia

---

## 3 代 (~2013-2018)

**代表**: TWICE · BLACKPINK · Red Velvet · MAMAMOO · GFRIEND · EXID

**视觉签名**: 杂志大片 · Y2K 复古 · 黑白对照 · Velvet 暗黑高级 · 巴洛克 · 金箔

**典型 motion**: slow burn / dramatic build

**禁忌**: AI cyber · 监控感 · neo-dystopia · 暗黑科技 · 后人类 · 去性别

---

## 4 代 (~2019-2022)

**代表**: IVE · aespa · NewJeans · ITZY · (G)I-DLE · LE SSERAFIM · STAYC

**视觉签名**: 简洁极简 · 公主梦幻 · AI 元宇宙双生 · Y2K 邻家 · 薄荷糖清新

**典型 motion**: fresh breeze / glitch cut / regal

**禁忌**: 8 个以上的女团群像 · 高度繁复巴洛克

---

## 5 代 (~2023+)

**代表**: BABYMONSTER · ILLIT · IZNA · MEOVV · XG · LAPILLUS

**视觉签名**: 暗黑科技 · AI 后人类 · 监控感 · 去性别 · neo-dystopia · 极简未来

**典型 motion**: explosion / war drum

**禁忌**: Y2K · 校园制服 · 8 个以上的女团群像 · 巴洛克金箔

---

## 使用方式

```js
import { checkGenerationAesthetic } from "../engine/generation.mjs";

// 5 代团 ILLIT 用 Y2K → 触发警告
checkGenerationAesthetic("ILLIT 用 Y2K 复古风做 landing", "illit");
// → { has_violation: true, violations: ["Y2K"], suggestion: "Y2K 是 3 代语法; 5 代 ILLIT 应走 暗黑科技 / AI 后人类 / 监控感" }
```

**lint 默认 warn 不 reject** — 用户可主动写 "retro homage" 标注强制 override。
