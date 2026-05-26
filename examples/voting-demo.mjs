// examples/voting-demo.mjs
// 核心 voting demo · 2/3 加权 + judge veto + group anchor veto

import { tallyCouncilVotes } from "../engine/voting.mjs";

console.log("=== Demo 1: 三选三 全 yes (2/3 通过) ===");
const r1 = tallyCouncilVotes([
  { slug: "color-strategist", layer: "tier_0", weight: 2, vote: "yes", reason: "色调贴 era" },
  { slug: "motion-director",  layer: "tier_0", weight: 2, vote: "yes", reason: "motion 合理" },
  { slug: "typography-curator", layer: "tier_1", weight: 1.5, vote: "yes", reason: "字重 OK" },
]);
console.log(JSON.stringify(r1, null, 2));

console.log("\n=== Demo 2: 多数反对 → 未达 2/3 ===");
const r2 = tallyCouncilVotes([
  { slug: "a", layer: "tier_0", weight: 2, vote: "yes", reason: "OK" },
  { slug: "b", layer: "tier_0", weight: 2, vote: "no",  reason: "色调不对" },
  { slug: "c", layer: "tier_1", weight: 1.5, vote: "no", reason: "字体过重" },
]);
console.log(JSON.stringify(r2, null, 2));

console.log("\n=== Demo 3: 团代表 veto · 一票否决即便加权通过 ===");
const r3 = tallyCouncilVotes([
  { slug: "color-strategist", layer: "tier_0", weight: 2, vote: "yes", reason: "OK" },
  { slug: "motion-director",  layer: "tier_0", weight: 2, vote: "yes", reason: "OK" },
  { slug: "group-soul-twice", layer: "group_anchor", weight: 3, vote: "no", is_veto: true, reason: "Fancy era 不该用糖果色" },
]);
console.log(JSON.stringify(r3, null, 2));

console.log("\n=== Demo 4: 评委 panel veto · 评委不署名 (最高级) ===");
const r4 = tallyCouncilVotes([
  { slug: "color-strategist", layer: "tier_0", weight: 2, vote: "yes", reason: "OK" },
  { slug: "motion-director",  layer: "tier_0", weight: 2, vote: "yes", reason: "OK" },
  { slug: "jyp",              layer: "panel",  weight: 5, vote: "no", is_veto: true, reason: "JYP 旗下 TWICE 不可使用" },
]);
console.log(JSON.stringify(r4, null, 2));

