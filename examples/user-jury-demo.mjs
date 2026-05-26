// examples/user-jury-demo.mjs
// v3.1 demo · 代码方式调用 user-jury

import { tallyWithUser, castUserVote } from "../engine/user-jury.mjs";

console.log("=== Demo 1: council 全 pass + 用户 veto ===");
const r1 = tallyWithUser(
  [
    { voter: "color-strategist", verdict: "pass" },
    { voter: "motion-director", verdict: "pass" },
    { voter: "typography-curator", verdict: "pass" },
  ],
  castUserVote("reject", 1, "颜色与 era 不符"),
);
console.log(JSON.stringify(r1, null, 2));

console.log("\n=== Demo 2: council 全 reject + 用户 override (权重 3) ===");
const r2 = tallyWithUser(
  [
    { voter: "brand-keeper", verdict: "reject" },
    { voter: "generation-lint", verdict: "reject" },
  ],
  castUserVote("pass", 3, "强制 override · retro homage 标注"),
);
console.log(JSON.stringify(r2, null, 2));

console.log("\n=== Demo 3: 用户与 council 同向 (concur) ===");
const r3 = tallyWithUser(
  [
    { voter: "a", verdict: "pass" },
    { voter: "b", verdict: "pass" },
    { voter: "c", verdict: "pass" },
  ],
  castUserVote("pass", 2, "完美"),
);
console.log(JSON.stringify(r3, null, 2));
