# 🧬 Generation Aesthetics · v3.0 Phase 4

## 一句话
让 5 代团 (BABYMONSTER/ILLIT) 穿 3 代衣服 (Y2K/巴洛克) = 工业内笑话。代际错位 = lint warning。

## 4 代审美时间线

### 2 代 (~2007-2012)
- **代表**: SNSD · KARA · Wonder Girls · f(x) · Brown Eyed Girls
- **签名**: 糖果色 · 粉嫩 · 大头特写 · 校服 · 圆润字体 · 8+ 群像
- **Motion**: snappy 抖动
- **禁忌**: 暗黑科技 / 监控构图 / AI cyber / 极简留白 / 去性别 / neo-dystopia

### 3 代 (~2013-2018)
- **代表**: TWICE · BLACKPINK · Red Velvet · MAMAMOO · GFRIEND · EXID
- **签名**: 杂志大片 · Y2K · 黑白对照 · Velvet 暗黑高级 · 巴洛克 · 金箔
- **Motion**: slow burn / dramatic build
- **禁忌**: AI cyber / 监控感 / neo-dystopia / 暗黑科技 / 后人类 / 去性别

### 4 代 (~2019-2022)
- **代表**: IVE · aespa · NewJeans · ITZY · (G)I-DLE · LE SSERAFIM · STAYC
- **签名**: 极简 · 公主梦幻 · AI 元宇宙 · Y2K 邻家 · 薄荷糖清新
- **Motion**: fresh breeze / glitch cut / regal
- **禁忌**: 8+ 群像 / 高度繁复巴洛克

### 5 代 (~2023+)
- **代表**: BABYMONSTER · ILLIT · IZNA · MEOVV · XG · LAPILLUS
- **签名**: 暗黑科技 · AI 后人类 · 监控感 · 去性别 · neo-dystopia · 极简未来
- **Motion**: explosion / war drum
- **禁忌**: Y2K / 校服 / 8+ 群像 / 巴洛克金箔

## 引擎 API (engine/generation.mjs)

```js
import { checkGenerationAesthetic, getGroupGeneration, listGenerationCards } from "../engine/generation.mjs";

// 查询单团代际
getGroupGeneration("twice"); // → "3代"

// brief lint
const r = checkGenerationAesthetic("ILLIT 用 Y2K 复古风做 landing", "illit");
// → { has_violation: true, generation: "5代", violations: ["Y2K"],
//     suggested_correct_gen: "3代",
//     suggestion: "「Y2K」是 3代 的视觉语法; 5代 团 ILLIT 应走 暗黑科技 / AI 后人类 / 监控感" }

// 列 4 代卡
listGenerationCards();
```

## Lint 行为
- 默认 **warn** (不 reject)
- 用户可在 brief 主动写 `retro homage: true` 强制 override
- override 留痕 (与 user-jury 集成时)

## 典型 use case
| brief | 团 | 结果 |
|-------|----|----|
| "TWICE 暗黑科技风" | 3 代 TWICE | ❌ violation (暗黑科技 是 5 代) |
| "ILLIT Y2K 校园" | 5 代 ILLIT | ❌ violation (Y2K + 校服 都是禁忌) |
| "IVE 极简公主" | 4 代 IVE | ✅ 合规 |
| "BABYMONSTER neo-dystopia" | 5 代 BM | ✅ 合规 |

## 配套
- 卡片源: `lineages/generation.md`
- Demo: `node examples/generation-demo.mjs`
