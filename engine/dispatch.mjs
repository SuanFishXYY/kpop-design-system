// engine/dispatch.mjs
// 议会调度器: brief → 召集 → 团魂联席检查 → 投票 → 决议

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tallyCouncilVotes, isEligibleVoter } from "./voting.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ============ Agent 加载 ============

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]+?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    }
    fm[kv[1]] = val;
  }
  return fm;
}

function loadAgents(dir, layer, defaultWeight) {
  const files = readdirSync(join(ROOT, dir)).filter(f => f.endsWith(".md"));
  return files.map(f => {
    const raw = readFileSync(join(ROOT, dir, f), "utf-8");
    const fm = parseFrontmatter(raw);
    return {
      slug: f.replace(/\.md$/, ""),
      name: fm.stage_name || fm.group_name || fm.name || f,
      group: fm.group || fm.group_slug || "",
      group_slug: fm.group_slug || "",
      era: fm.era || "",
      layer,
      weight: Number(fm.vote_weight) || defaultWeight,
      tier: Number(fm.tier),
      attitude: fm.attitude || fm.soul_manifesto || "",
      fusion_compatible: fm.fusion_compatible || [],
      fusion_rules: fm.fusion_rules || "",
      helpers: fm.invited_helpers || [],
    };
  });
}

let _cache = null;
export function loadAllAgents() {
  if (_cache) return _cache;
  const souls = loadAgents("groups", "group_soul", 3);
  const idols = readdirSync(join(ROOT, "agents")).filter(f => f.endsWith(".md")).map(f => {
    const raw = readFileSync(join(ROOT, "agents", f), "utf-8");
    const fm = parseFrontmatter(raw);
    const tier = Number(fm.tier);
    return {
      slug: f.replace(/\.md$/, ""),
      name: fm.stage_name || f,
      group: fm.group || "",
      era: fm.era || "",
      layer: tier === 0 ? "tier_0" : "tier_1",
      weight: tier === 0 ? 2 : 1.5,
      tier,
      attitude: fm.attitude || "",
      helpers: fm.invited_helpers || [],
    };
  });
  // 评委层 (judge): weight=5, veto_scope=portfolio_only
  let judges = [];
  try {
    judges = readdirSync(join(ROOT, "judges")).filter(f => f.endsWith(".md")).map(f => {
      const raw = readFileSync(join(ROOT, "judges", f), "utf-8");
      const fm = parseFrontmatter(raw);
      return {
        slug: f.replace(/\.md$/, ""),
        judge_slug: fm.judge_slug || f.replace(/\.md$/, ""),
        name: fm.judge_name || fm.name || f,
        label: fm.label || "",
        layer: "judge",
        weight: Number(fm.vote_weight) || 5,
        portfolio: fm.portfolio || [],
        judging_style: fm.judging_style || "",
        manifesto: fm.manifesto || "",
        inter_label_tension: fm.inter_label_tension || [],
        can_veto: fm.can_veto === "true" || fm.can_veto === true,
        veto_scope: fm.veto_scope || "portfolio_only",
      };
    });
  } catch (e) { /* judges/ optional */ }
  // 粉丝团层 (fandom): weight=1, no veto, user proxy
  let fandoms = [];
  try {
    fandoms = readdirSync(join(ROOT, "fandoms")).filter(f => f.endsWith(".md")).map(f => {
      const raw = readFileSync(join(ROOT, "fandoms", f), "utf-8");
      const fm = parseFrontmatter(raw);
      return {
        slug: `fandom-${f.replace(/\.md$/, "")}`,
        fandom_name: fm.fandom_name || "",
        group_slug: fm.group_slug || f.replace(/\.md$/, ""),
        group_name: fm.group_name || "",
        layer: "fandom",
        weight: Number(fm.vote_weight) || 1,
        catchphrase: fm.catchphrase || "",
        perspective: fm.perspective || "user_proxy",
      };
    });
  } catch (e) { /* fandoms/ optional */ }
  _cache = { souls, idols, judges, fandoms };
  return _cache;
}

// ============ 召集逻辑 ============

/**
 * 解析 brief, 识别提到的团 + idol
 */
export function parseBrief(brief) {
  const { souls, idols } = loadAllAgents();
  const lower = brief.toLowerCase();
  
  const mentioned_groups = souls.filter(s => 
    lower.includes(s.group_slug.toLowerCase()) ||
    (s.name && lower.includes(s.name.toLowerCase()))
  );
  
  const mentioned_idols = idols.filter(i =>
    lower.includes(i.name.toLowerCase()) ||
    lower.includes(i.slug.toLowerCase())
  );
  
  return { mentioned_groups, mentioned_idols };
}

/**
 * 召集议会: brief → 评委 + 团魂 + 相关 idol
 */
export function summonCouncil(brief, opts = {}) {
  const maxIdols = opts.maxIdols || 15;
  const { mentioned_groups, mentioned_idols } = parseBrief(brief);
  const { idols, judges, fandoms } = loadAllAgents();
  
  // 0. 评委层: 旗下含被提到团的评委自动召唤
  const mentionedSlugs = new Set(mentioned_groups.map(g => g.group_slug.toLowerCase()));
  const summonedJudges = (judges || []).filter(j =>
    (j.portfolio || []).some(p => mentionedSlugs.has((p || "").toLowerCase()))
  );
  
  // 0b. 粉丝团层: 同 group_slug 命中即召
  const summonedFandoms = (fandoms || []).filter(f =>
    mentionedSlugs.has((f.group_slug || "").toLowerCase())
  );
  
  // 1. 团魂层: 所有被提及的团
  const souls = mentioned_groups;
  
  // 2. idol 层: 优先加入被点名 + 同团 + 跨团助攻 (helpers)
  const invitedSet = new Set(mentioned_idols.map(i => i.slug));
  
  // 同团 idol (soul.name 实际就是 group_name，e.g. "TWICE")
  for (const g of mentioned_groups) {
    const groupName = (g.name || g.group_slug || "").toLowerCase();
    for (const i of idols) {
      if ((i.group || "").toLowerCase() === groupName) {
        invitedSet.add(i.slug);
      }
    }
  }
  
  // helpers (跨团传染)
  const initial = Array.from(invitedSet);
  for (const slug of initial) {
    const idol = idols.find(i => i.slug === slug);
    if (idol) {
      for (const h of idol.helpers) invitedSet.add(h);
    }
  }
  
  const invited = idols.filter(i => invitedSet.has(i.slug)).slice(0, maxIdols);
  
  // 3. 跨团融合校验
  const fusion_check = checkFusionCompat(souls);
  
  // 4. 跨 label gate: 若 fusion 且涉及多个不同 label 评委 → 必须每方至少 1 评委
  const cross_label_check = checkCrossLabelGate(summonedJudges, souls);
  
  return {
    brief,
    judges: summonedJudges,
    souls,
    invited,
    fandoms: summonedFandoms,
    council_size: summonedJudges.length + souls.length + invited.length + summonedFandoms.length,
    fusion_check,
    cross_label_check,
  };
}

/**
 * 跨 label gate: fusion brief 中, 每个涉及到的 label 至少需要 1 个评委到场
 * 返回 missing labels (期望: 空数组)
 */
function checkCrossLabelGate(judges, souls) {
  if (souls.length < 2) return { is_cross_label: false, missing: [] };
  
  // 每个 soul 对应的 label (从 judges.portfolio 反查)
  const soulLabel = {};
  for (const soul of souls) {
    const judge = judges.find(j => (j.portfolio || []).map(p => p.toLowerCase()).includes(soul.group_slug.toLowerCase()));
    soulLabel[soul.group_slug] = judge ? judge.label : "unknown";
  }
  
  const distinctLabels = [...new Set(Object.values(soulLabel))].filter(l => l !== "unknown");
  const presentLabels = new Set(judges.map(j => j.label));
  const missing = distinctLabels.filter(l => !presentLabels.has(l));
  
  return {
    is_cross_label: distinctLabels.length > 1,
    soul_to_label: soulLabel,
    distinct_labels: distinctLabels,
    judges_present: [...presentLabels],
    missing,
    gate_passed: missing.length === 0,
  };
}

/**
 * 跨团融合兼容性校验
 */
function checkFusionCompat(souls) {
  if (souls.length < 2) return { is_fusion: false };
  
  const incompatible = [];
  for (let i = 0; i < souls.length; i++) {
    for (let j = i + 1; j < souls.length; j++) {
      const a = souls[i], b = souls[j];
      const aCompat = (a.fusion_compatible || []).includes(b.group_slug);
      const bCompat = (b.fusion_compatible || []).includes(a.group_slug);
      if (!aCompat || !bCompat) {
        incompatible.push({ a: a.group_slug, b: b.group_slug, a_lists_b: aCompat, b_lists_a: bCompat });
      }
    }
  }
  
  return {
    is_fusion: true,
    pair_count: souls.length,
    incompatible,
    fully_compatible: incompatible.length === 0,
    fusion_rules: souls.map(s => ({ group: s.group_slug, must_keep: s.fusion_rules }))
  };
}

/**
 * 完整 dispatch: brief → council → 模拟投票 → 决议
 * 注: 真实场景中投票来自每个 agent 的 LLM 调用; 这里提供"模拟投票"接口
 */
export function dispatchBrief(brief, voteSimulator) {
  const council = summonCouncil(brief);
  
  // 收集投票 (voteSimulator 是外部注入的函数，每个 agent 一票)
  const votes = [];
  for (const judge of (council.judges || [])) {
    const v = voteSimulator ? voteSimulator(judge, brief) : { vote: "yes", reason: "default approve" };
    votes.push({
      slug: judge.slug, layer: "judge", weight: judge.weight || 5,
      vote: v.vote, reason: v.reason, is_veto: v.is_veto || false
    });
  }
  for (const soul of council.souls) {
    const v = voteSimulator ? voteSimulator(soul, brief) : { vote: "yes", reason: "default approve" };
    votes.push({
      slug: soul.slug, layer: "group_soul", weight: 3,
      vote: v.vote, reason: v.reason, is_veto: v.is_veto || false
    });
  }
  for (const idol of council.invited) {
    const v = voteSimulator ? voteSimulator(idol, brief) : { vote: "yes", reason: "default approve" };
    votes.push({
      slug: idol.slug, layer: idol.layer, weight: idol.weight,
      vote: v.vote, reason: v.reason
    });
  }
  for (const fandom of (council.fandoms || [])) {
    const v = voteSimulator ? voteSimulator(fandom, brief) : { vote: "yes", reason: "fandom approval" };
    votes.push({
      slug: fandom.slug, layer: "fandom", weight: fandom.weight || 1,
      vote: v.vote, reason: v.reason, perspective: "user_proxy"
    });
  }
  
  const result = tallyCouncilVotes(votes);
  
  return {
    council_summary: {
      judges: (council.judges || []).map(j => j.judge_slug),
      souls: council.souls.map(s => s.group_slug),
      idol_count: council.invited.length,
      fandoms: (council.fandoms || []).map(f => f.fandom_name),
      fusion: council.fusion_check.is_fusion,
      cross_label: council.cross_label_check.is_cross_label,
      cross_label_gate_passed: council.cross_label_check.gate_passed,
    },
    fusion_check: council.fusion_check,
    cross_label_check: council.cross_label_check,
    votes,
    decision: result,
  };
}
