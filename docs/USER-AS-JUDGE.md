# 🧑‍⚖️ User-as-Judge · v3.1 协议

## 一句话
v3.0 圣人 council 单向输出 → v3.1 用户与圣人并肩评议, 拥有 veto / override / 偏好学习权。

## 4 件套

### ❶ 用户票席 (User Seat)
council 投票时, 用户自动占 1 席, 与圣人同权。可在 brief 通过 `user_weight: 3` 自抬权重 (上限 3 票)。

```js
import { tallyWithUser, castUserVote } from "./engine/user-jury.mjs";
const result = tallyWithUser(councilVotes, castUserVote("reject", 2, "色调不符"));
```

### ❷ 驳回权 (Veto) / 推翻权 (Override)
- council 一致 PASS + user reject → `final_verdict: "user_veto"`
- council 一致 REJECT + user pass → `final_verdict: "user_override"`
- 全程 `audit_trail` 留痕 (谁投了什么 / 理由 / 时间)

### ❸ 偏好学习 (Preference Memory)
本地 JSON `~/.kpop-design/user-prefs.json` · 不上传。

存:
- `overrides` (最近 50 条 · 用户力排众议的历史)
- `favorites` (group/era 收藏 + 使用次数, 最多 30)
- `rejected_specialties` (反复拒绝的 specialty 频次)

读:
- `topFavorites(prefs, 5)` — 推荐常用 group/era
- `shouldSkipSpecialty(prefs, "motion", 3)` — 是否避开该 specialty

### ❹ 评审会议室 CLI
```bash
npx kpop review --brief="TWICE Fancy era landing"
# 或:
node bin/review.mjs --brief="..."
```

交互流程:
1. 圣人轮流发言 (每位 wait 用户输入: +1/-1/?/Enter)
2. 用户最终投票 (verdict + weight + reason)
3. 输出决议书 + 自动写入 prefs (if veto/override)
4. 可选标记 favorite

## 隐私
- 本地 only · 永不上传
- 路径可通过 `loadUserPrefs("/custom/path")` 自定义
- 删除整套偏好: `rm ~/.kpop-design/user-prefs.json`

## 不做
- ❌ 云端档案
- ❌ 用户 vs 用户对抗
- ❌ 圣人反驳用户 (用户最终权)
