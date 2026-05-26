# 📚 Examples · 全模式实战示例

每个核心引擎模块都对应一个可直接 `node examples/xxx-demo.mjs` 运行的 demo。

## v3.x 引擎全家桶

| Demo | 引擎 | 演示内容 |
|------|------|---------|
| `era-demo.mjs` | engine/eras.mjs | Era Universe · 命中检测 / DNA / forbidden |
| `cycle-demo.mjs` | engine/cycle.mjs | Comeback Cycle · 7 节点 brief 日历 |
| `coherence-demo.mjs` | engine/coherence.mjs | 5 媒介一致性 audit · HSL 偏差 + 物理补偿 |
| `generation-demo.mjs` | engine/generation.mjs | 4 代审美 lint · 代际错位检测 |
| `voting-demo.mjs` | engine/voting.mjs | 加权投票 + group anchor veto + panel veto |
| `user-jury-demo.mjs` | engine/user-jury.mjs | 用户票席 / veto / override / concur |
| `routing-demo.mjs` | engine/routing.mjs | brief → 召唤 souls + idols + judges |
| `awards-demo.mjs` | (legacy) | 评委召唤示例 |
| `design-demo.mjs` | (legacy) | 设计 brief 端到端 |
| `performer-demo.mjs` | (legacy) | 演出者维度 brief |

## 一键全跑

```bash
for demo in era cycle coherence generation voting user-jury routing; do
  echo "=== $demo ==="
  node examples/$demo-demo.mjs
done
```

## 综合案例

`worked-example-bp-twice.md` — BLACKPINK × TWICE 跨团 fusion brief 完整执行记录
