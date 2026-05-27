// examples/karina-vs-jennie-demo.mjs
//
// Demo: 同一个 brief, Karina (aespa · 4 代 · 赛博女王) vs Jennie (BLACKPINK · 3 代 · Human Chanel)
// 各自的设计立场如何 drive 完全不同的发言 / verdict / 建议.
//
// 跑: node examples/karina-vs-jennie-demo.mjs

import fs from "node:fs";
import path from "node:path";

const AGENTS_DIR = path.join(process.cwd(), "agents");

function loadAgent(name) {
  const file = path.join(AGENTS_DIR, `${name}.md`);
  const raw = fs.readFileSync(file, "utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const fm = {};
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (m) {
    m[1].split("\n").forEach((line) => {
      const mm = line.match(/^(\w+):\s*(.+)$/);
      if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, "");
    });
  }
  return fm;
}

// 简化版"人格化发言生成器" — 根据 agent 的 personality + ui_specialty + attitude 模板化
// 真实使用时, 这个发言由 LLM 基于 agent yaml 渲染. 这里用规则模拟以展示差异.
function speak(agent, brief) {
  const ui = agent.ui_specialty;
  const personality = agent.personality;
  const attitude = agent.attitude;
  const era = agent.era;
  const role = agent.role;

  // 规则: 用 ui_specialty 关键词 drive 不同的建议方向
  let stance, suggestion, verdict;

  if (ui.includes("赛博") || ui.includes("futuristic") || ui.includes("dashboard")) {
    stance = "需要更未来感, 现在太静";
    suggestion = "左侧 dashboard 加紫色光带 + 微噪点纹理 + cyber motion";
    verdict = "PASS";
  } else if (ui.includes("奢华") || ui.includes("Chanel") || ui.includes("极简")) {
    stance = "信息密度太高, 不够'贵'";
    suggestion = "缩小 logo 20%, 留白 +50%, 字体换 Didot serif";
    verdict = "PASS";
  } else if (ui.includes("hero") || ui.includes("公主") || ui.includes("luckyvicky")) {
    stance = "太冷了, 缺温度和明亮";
    suggestion = "hero 区加暖色光晕, 主标加 sparkle, 副文案加 'lucky' 关键词";
    verdict = "ABSTAIN";
  } else if (ui.includes("爆发") || ui.includes("burst") || ui.includes("动效")) {
    stance = "缺一记 hook, 用户进来 3 秒就走了";
    suggestion = "首屏加 burst animation, 0.6s 内爆出主标语";
    verdict = "PASS";
  } else {
    stance = "结构 OK, 但要看细节";
    suggestion = "再过一版本";
    verdict = "PASS";
  }

  return {
    name: agent.stage_name || agent.name,
    group: agent.group,
    era,
    role,
    ui_specialty: ui,
    personality,
    voice_signature: attitude,
    stance,
    suggestion,
    verdict,
    vote_weight: parseFloat(agent.vote_weight) || 2,
  };
}

function render(speech) {
  console.log(`\n┌─────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ 🎤 ${speech.name.padEnd(15)} · ${speech.group.padEnd(15)} · ${speech.era.padEnd(8)} · ${speech.role.slice(0, 25).padEnd(25)} │`);
  console.log(`├─────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ 专长: ${speech.ui_specialty.padEnd(60)} │`);
  console.log(`│ 人格: ${speech.personality.padEnd(60)} │`);
  console.log(`│ 金句: "${speech.voice_signature}"`);
  console.log(`├─────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ 💬 立场: ${speech.stance}`);
  console.log(`│ 🎨 建议: ${speech.suggestion}`);
  console.log(`│ ⚖️  投票: ${speech.verdict}  (权重 ×${speech.vote_weight})`);
  console.log(`└─────────────────────────────────────────────────────────────────────┘`);
}

// === MAIN ===

const BRIEF = "未来感登录页 · 主视觉 hero + 表单 + 右侧品牌图";

console.log("\n");
console.log("╔══════════════════════════════════════════════════════════════════════╗");
console.log("║  🎯 BRIEF                                                              ║");
console.log("║                                                                       ║");
console.log(`║  "${BRIEF}"`);
console.log("║                                                                       ║");
console.log("║  召唤: Karina (aespa) + Jennie (BLACKPINK) + Wonyoung (IVE) 同台评审   ║");
console.log("╚══════════════════════════════════════════════════════════════════════╝");

const karina = loadAgent("aespa-karina");
const jennie = loadAgent("bp-jennie");
const wonyoung = loadAgent("ive-wonyoung");

const speeches = [speak(karina, BRIEF), speak(jennie, BRIEF), speak(wonyoung, BRIEF)];
speeches.forEach(render);

// 合议
console.log(`\n┌─────────────────────────────────────────────────────────────────────┐`);
console.log(`│ ⚖️  合议结果                                                          │`);
console.log(`├─────────────────────────────────────────────────────────────────────┤`);
let pass = 0, abstain = 0, reject = 0, total = 0;
for (const s of speeches) {
  total += s.vote_weight;
  if (s.verdict === "PASS") pass += s.vote_weight;
  else if (s.verdict === "ABSTAIN") abstain += s.vote_weight;
  else reject += s.vote_weight;
}
console.log(`│ PASS: ${pass} 票  ·  ABSTAIN: ${abstain} 票  ·  REJECT: ${reject} 票           │`);
console.log(`│ 通过率: ${((pass / total) * 100).toFixed(0)}% (需 ≥ 67%)                              │`);
console.log(`│ 决议: ${pass / total >= 2 / 3 ? "✅ PASS" : "❌ REJECT / NEEDS REVISION"}            │`);
console.log(`└─────────────────────────────────────────────────────────────────────┘`);

console.log(`\n📜 完整 audit_trail (脱敏后):\n`);
speeches.forEach((s) => {
  console.log(`  [${s.name}/${s.group}] ${s.verdict} (×${s.vote_weight})`);
  console.log(`    voice: "${s.voice_signature}"`);
  console.log(`    stance: ${s.stance}`);
  console.log(`    suggest: ${s.suggestion}`);
  console.log("");
});

console.log("---");
console.log("\n🎯 核心观察:");
console.log("  • 同一 brief, 3 个 agent 给出**完全不同**的发言/建议");
console.log("  • Karina   (4代赛博女王) → 加紫色光带 + cyber motion             → PASS");
console.log("  • Jennie   (3代Human Chanel) → 减法/留白/Didot serif            → PASS");
console.log("  • Wonyoung (4代公主luckyvicky) → 加暖色光晕/sparkle/lucky tagline → ABSTAIN");
console.log("  • 投票合议: 2 PASS + 1 ABSTAIN · 总 4/6 = 67% → 险过 ✅");
console.log("  • → 这就是 218 灵魂合议的真正价值:");
console.log("    多视角对冲, 不是单 LLM 一言堂");
console.log("  • → Karina 和 Jennie 都 PASS 但建议相反 (加 vs 减)");
console.log("  • → Wonyoung ABSTAIN 留下一个'温度不够'的优化方向");
console.log("  • → 真实 PM 拿这份 audit_trail 做下一版设计指引, 而不是猜 AI 的意图");
console.log("");
