#!/usr/bin/env node
// bin/review.mjs
// v3.1 Phase C · 评审会议室 CLI

import readline from "node:readline";
import { tallyWithUser, castUserVote } from "../engine/user-jury.mjs";
import { loadUserPrefs, saveUserPrefs, recordOverride, recordFavorite } from "../engine/user-prefs.mjs";

const args = process.argv.slice(2);
const briefArg = args.find(a => a.startsWith("--brief="));
const brief = briefArg ? briefArg.slice(8) : "无 brief (示例 review session)";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

const transcript = [];
function log(line) { console.log(line); transcript.push(line); }

const SAGES = [
  { name: "color-strategist", opinion: "我建议走 muted palette, 适合 era 调性。", verdict: "pass" },
  { name: "motion-director",  opinion: "motion 节奏建议 slow burn, 不要 snappy。", verdict: "pass" },
  { name: "typography-curator", opinion: "字重略轻, 建议 +1 grade。", verdict: "abstain" },
];

async function main() {
  log("╔═══════════════════════════════════════════════╗");
  log("║  🎙️  K-pop Council Review Room v3.1            ║");
  log("╚═══════════════════════════════════════════════╝");
  log(`📝 Brief: ${brief}`);
  log("");

  for (const sage of SAGES) {
    log(`🧙 ${sage.name}: "${sage.opinion}"  [verdict: ${sage.verdict}]`);
    const input = (await ask("你的反应 (+1 赞 / -1 反对 / ? 追问 / 回车跳过): ")).trim();
    if (input === "?") {
      const q = await ask("  追问: ");
      log(`  ❓ 你追问: ${q}`);
      log(`  💬 ${sage.name}: (这是 demo 占位回复) 好问题, 但 brief 太短无法深入。`);
    } else if (input === "+1") log(`  👍 你赞同 ${sage.name}`);
    else if (input === "-1") log(`  👎 你反对 ${sage.name}`);
    log("");
  }

  log("=== 投票阶段 ===");
  const verdictRaw = (await ask("你的 final verdict (pass / reject / abstain): ")).trim() || "abstain";
  const weightRaw = parseInt((await ask("你的权重 (1-3, 默认 1): ")).trim()) || 1;
  const reason = (await ask("理由 (可选): ")).trim();
  const userVote = castUserVote(verdictRaw, weightRaw, reason);

  const result = tallyWithUser(SAGES.map(s => ({ voter: s.name, verdict: s.verdict })), userVote);
  log("");
  log("📜 决议书:");
  log(`  council verdict: ${result.council_verdict}`);
  log(`  user effect: ${result.user_effect} (权重 ${result.user_weight})`);
  log(`  final verdict: ${result.final_verdict}`);
  log(`  tally: ${JSON.stringify(result.tally)}`);

  if (result.user_effect === "veto" || result.user_effect === "override") {
    const prefs = loadUserPrefs();
    recordOverride(prefs, {
      brief, council_verdict: result.council_verdict, user_verdict: verdictRaw, reason,
    });
    saveUserPrefs(prefs);
    log("  💾 override 已写入 ~/.kpop-design/user-prefs.json");
  }

  const fav = (await ask("\n标记为 favorite? 输入 group/era (空跳过): ")).trim();
  if (fav.includes("/")) {
    const [g, e] = fav.split("/");
    const prefs = loadUserPrefs();
    recordFavorite(prefs, { group_slug: g, era_slug: e });
    saveUserPrefs(prefs);
    log(`  ⭐ ${fav} 已加入 favorites`);
  }

  log("\n--- transcript end ---");
  rl.close();
}

main().catch(e => { console.error(e); rl.close(); process.exit(1); });
