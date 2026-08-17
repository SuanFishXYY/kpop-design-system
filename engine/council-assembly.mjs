// engine/council-assembly.mjs
// v3.6.1 · Style-first, name-assisted Mixed Council assembly.
// 任意 idol 都可以凭设计风格入选；显式名字/团体作为辅助召回。

import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllSisterGroups, loadGroups } from "./relations.mjs";
import { rankIdolsByBrief, selectDiverseStyleIdols, classifyBriefSpecialties, classifyIdolSpecialty } from "./specialty.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AGENTS = join(ROOT, "agents");

function parseArray(value) {
  const m = String(value || "").trim().match(/^\[([\s\S]*)\]/);
  if (!m) return [];
  return m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

function buildVoice(fm) {
  const identity = fm.voice_identity || "";
  const position = fm.voice_position_statement || "";
  const question = fm.voice_question_template || "";
  const veto = Array.isArray(fm.voice_veto_triggers)
    ? fm.voice_veto_triggers
    : parseArray(fm.voice_veto_triggers);
  if (!identity && !position && !question && !veto.length) return null;
  return {
    identity,
    position_statement: position,
    question_template: question,
    veto_triggers: veto,
  };
}

function parseFrontmatter(raw) {
  const match = raw.replace(/\r\n/g, "\n").match(/^---\s*\n([\s\S]+?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) value = parseArray(value);
    else value = value.replace(/^["']|["']$/g, "");
    fm[kv[1]] = value;
  }
  return fm;
}

let idolCache = null;
function deriveAgency(groupName, groupsMap) {
  if (!groupName) return "";
  const g = groupsMap?.get(normalized(groupName));
  return g?.agency || "";
}

export function loadIdols() {
  if (idolCache) return idolCache;
  const groupsMap = new Map(loadGroups().map(g => [normalized(g.name), g]));
  idolCache = readdirSync(AGENTS).filter(f => f.endsWith(".md")).map(file => {
    const raw = readFileSync(join(AGENTS, file), "utf-8");
    const fm = parseFrontmatter(raw);
    return {
      type: "idol",
      slug: file.replace(/\.md$/, ""),
      name: fm.stage_name || fm.name || file.replace(/\.md$/, ""),
      group: fm.group || "",
      era: fm.era || "",
      tier: Number(fm.tier || 1),
      specialty: fm.ui_specialty || fm.role || "visual strategy",
      ui_specialty: fm.ui_specialty || "",
      personality: fm.personality || "",
      vibe: fm.vibe || "",
      attitude: fm.attitude || "",
      role: fm.role || "",
      rivals: parseArray(fm.rivals),
      personal_conflict: parseArray(fm.personal_conflict),
      agency: fm.agency || deriveAgency(fm.group, groupsMap),
      voice: buildVoice(fm),
      vote: 1,
    };
  });
  return idolCache;
}

function normalized(str) { return String(str || "").toLowerCase(); }
function groupMember(g) { return { type: "group", slug: g.slug, name: g.name, agency: g.agency || "", rivals: g.rivals || [], era: g.era, aesthetic_tags: g.aesthetic_tags || [], counterpoint_axis: g.counterpoint_axis || "", vote: 1 }; }
function idolMember(i) { return { ...i, vote: 1 }; }
function userMember() { return { type: "user", slug: "user", name: "User", vote: 1 }; }

/**
 * Deterministic council id from brief + member slugs + cap.
 * Same input always yields the same id, making transcripts and verdict files reproducible.
 */
export function deriveCouncilId(brief, members, maxMembers = 5) {
  const key = [
    String(brief || "").trim().toLowerCase(),
    maxMembers,
    ...members
      .map(m => `${m.type}:${m.slug}`)
      .sort(),
  ].join("|");
  const hash = createHash("sha256").update(key).digest("hex").slice(0, 10);
  return `mixed-${hash}`;
}

// 同社上限：把子厂牌归到母公司，防止 HYBE / SM 等通过多个 label 堆人
const AGENCY_PARENT = {
  ador: "HYBE",
  belift: "HYBE",
  source: "HYBE",
  pledis: "HYBE",
};
function normalizeAgency(agency) {
  return AGENCY_PARENT[normalized(agency)] || agency || "";
}

function briefWantsConflict(brief) {
  return /\b(debate|rival|vs|battle|conflict|对抗|冲突|吵架|对决|宿敌)\b/i.test(String(brief || ""));
}

function memberAgency(member) {
  return normalizeAgency(member.agency || "");
}

function memberEra(member, groupsMap) {
  if (member.era) return member.era;
  if (member.type === "idol") {
    const g = groupsMap?.get(normalized(member.group));
    return g?.era || "";
  }
  return "";
}

function currentEras(state) {
  return new Set(state.members.filter(m => m.type !== "user").map(m => memberEra(m, state.groupsMap)).filter(Boolean));
}

function ensureGenerationDiversity(state, seedGroups) {
  const seedSlugs = new Set(seedGroups.map(g => g.slug));
  const eras = currentEras(state);
  if (eras.size >= 2) return;
  const targetEra = eras.values().next().value;
  if (!targetEra) return;
  const candidates = [];
  for (const i of loadIdols()) {
    const m = idolMember(i);
    if (state.visited.has(`idol:${m.slug}`)) continue;
    const e = memberEra(m, state.groupsMap);
    if (e && e !== targetEra && !hasConflict(m, state)) candidates.push(m);
  }
  for (const g of loadGroups()) {
    const m = groupMember(g);
    if (state.visited.has(`group:${m.slug}`)) continue;
    const e = memberEra(m, state.groupsMap);
    if (e && e !== targetEra && !hasConflict(m, state)) candidates.push(m);
  }
  // Prefer candidates from underrepresented agencies and higher tier idols.
  candidates.sort((a, b) => {
    const aAgency = memberAgency(a);
    const bAgency = memberAgency(b);
    const aCount = state.members.filter(m => memberAgency(m) === aAgency).length;
    const bCount = state.members.filter(m => memberAgency(m) === bAgency).length;
    if (aCount !== bCount) return aCount - bCount;
    if ((a.tier || 0) !== (b.tier || 0)) return (b.tier || 0) - (a.tier || 0);
    return String(a.slug).localeCompare(String(b.slug));
  });
  for (const pick of candidates) {
    if (state.members.length >= state.max) break;
    if (addMember(state, pick, { from: seedSlugs.size ? "brief" : "protocol", to: pick.slug, layer: "mix", reason: "generation diversity" })) break;
  }
}

function hasConflict(candidate, state) {
  if (state.briefWantsConflict) return false;
  for (const m of state.members) {
    if (m.type === "user") continue;
    // group vs group
    if (m.type === "group" && candidate.type === "group") {
      if ((m.rivals || []).includes(candidate.slug)) return true;
      if ((candidate.rivals || []).includes(m.slug)) return true;
    }
    // idol vs idol
    if (m.type === "idol" && candidate.type === "idol") {
      const a = new Set([...(m.rivals || []), ...(m.personal_conflict || [])]);
      const b = new Set([...(candidate.rivals || []), ...(candidate.personal_conflict || [])]);
      if (a.has(candidate.slug) || b.has(m.slug)) return true;
    }
    // idol vs group / group vs idol: idol's group rivals the other group
    if (m.type === "idol" && candidate.type === "group") {
      const g = state.groupsMap?.get(normalized(m.group));
      if ((g?.rivals || []).includes(candidate.slug)) return true;
      if ((candidate.rivals || []).includes(g?.slug)) return true;
    }
    if (m.type === "group" && candidate.type === "idol") {
      const g = state.groupsMap?.get(normalized(candidate.group));
      if ((g?.rivals || []).includes(m.slug)) return true;
      if ((m.rivals || []).includes(g?.slug)) return true;
    }
  }
  return false;
}

function matchGroups(brief) {
  const lower = normalized(brief);
  return loadGroups().filter(g => lower.includes(normalized(g.slug)) || lower.includes(normalized(g.name)));
}

function matchIdolsByName(brief) {
  const lower = normalized(brief);
  return loadIdols().filter(i => lower.includes(normalized(i.slug)) || lower.includes(normalized(i.name)));
}

function mentionsCrossGenOrAgency(brief, groups) {
  const lower = normalized(brief);
  const generationHint = /(2nd|3rd|4th|5th|cross-gen|multi-gen)/i.test(brief) || /[2345]\s*?/.test(brief);
  const agencyHint = /(HYBE|SM|YG|JYP|ADOR|Starship|Source|Belift|Cube|RBW|agency|label)/i.test(brief);
  const eras = new Set(groups.map(g => g.era).filter(Boolean));
  const agencies = new Set(groups.map(g => g.agency).filter(Boolean));
  return generationHint || agencyHint || eras.size > 1 || agencies.size > 1 || lower.includes("cross agency");
}

export function determineDRI(brief) {
  const groups = matchGroups(brief);
  if (groups.length) return { type: "group", slug: groups[0].slug, reason: "brief matched group" };
  const styleRank = rankIdolsByBrief(loadIdols(), brief);
  if (styleRank.length) return { type: "idol", slug: styleRank[0].idol.slug, reason: "brief matched idol style" };
  const nameIdols = matchIdolsByName(brief);
  if (nameIdols.length) return { type: "idol", slug: nameIdols[0].slug, reason: "brief matched idol name" };
  if (/(HYBE|SM|YG|JYP|ADOR|Starship|Source|Belift|Cube|RBW)/i.test(brief)) return { type: "brand", slug: "brand-dri", reason: "brief matched agency" };
  return { type: "idol", slug: "stage-director", reason: "fallback stage director" };
}

function addMember(state, member, chainEntry = null) {
  if (!member || state.members.length >= state.max) return false;
  const key = `${member.type}:${member.slug}`;
  if (state.visited.has(key)) return false;

  const agency = memberAgency(member);
  if (agency) {
    const current = state.members.filter(m => memberAgency(m) === agency).length;
    if (current >= 3) {
      state.declined.push({ slug: member.slug, reason: "same-agency cap" });
      return false;
    }
  }

  if (hasConflict(member, state)) {
    state.declined.push({ slug: member.slug, reason: "conflict avoidance" });
    return false;
  }

  state.members.push(member);
  state.visited.add(key);
  if (chainEntry) state.invitation_chain.push(chainEntry);
  return true;
}

function ensureMix(state, seedGroups) {
  if (state.members.length < 4) return;
  const groups = () => state.members.filter(m => m.type === "group");
  const idols = () => state.members.filter(m => m.type === "idol");

  // 至少两个团体
  for (const g of seedGroups) {
    if (groups().length >= 2 || state.members.length >= state.max) break;
    for (const rel of getAllSisterGroups(g.slug)) {
      const target = loadGroups().find(x => x.slug === rel.target);
      if (target && addMember(state, groupMember(target), { from: g.slug, to: target.slug, layer: "mix", reason: rel.relation_types.join("+") })) break;
    }
  }

  // 至少两个偶像
  const groupNames = new Set(groups().map(g => normalized(g.name)));
  for (const idol of loadIdols()) {
    if (idols().length >= 2 || state.members.length >= state.max) break;
    if (groupNames.has(normalized(idol.group))) {
      addMember(state, idolMember(idol), { from: idol.group, to: idol.slug, layer: "mix", reason: "group idol quota" });
    }
  }
}

function expandSisterGroups(state) {
  const queue = state.members.filter(m => m.type === "group").map(m => ({ member: m, depth: 0 }));
  // 默认 sister 扩展避开宿敌，除非 brief 明确要求对抗
  const relationTypes = state.briefWantsConflict
    ? undefined
    : ["same_generation", "same_agency", "same_aesthetic"];
  while (queue.length && state.members.length < state.max) {
    const { member, depth } = queue.shift();
    if (depth >= 3) continue;
    const invited = getAllSisterGroups(member.slug, relationTypes).slice(0, 3);
    for (const rel of invited) {
      if (state.members.length >= state.max) break;
      const target = loadGroups().find(g => g.slug === rel.target);
      if (!target) continue;
      const added = addMember(state, groupMember(target), { from: member.slug, to: target.slug, layer: depth + 1, reason: rel.relation_types.join("+") });
      if (added) queue.push({ member: groupMember(target), depth: depth + 1 });
    }
  }
}

function deriveGroupsFromIdols(idols) {
  const groups = loadGroups();
  const groupMap = new Map(groups.map(g => [normalized(g.name), g]));
  const derived = [];
  for (const idol of idols) {
    const g = groupMap.get(normalized(idol.group));
    if (g && !derived.some(d => d.slug === g.slug)) derived.push(g);
    if (derived.length >= 3) break;
  }
  return derived;
}

export function assembleCouncil(brief) {
  const seedGroups = matchGroups(brief);
  const seedNameIdols = matchIdolsByName(brief);
  const allIdols = loadIdols();
  const styleSlots = Math.max(0, (mentionsCrossGenOrAgency(brief, seedGroups) ? 7 : 5) - seedGroups.slice(0, 2).length - 3);
  const styleIdols = selectDiverseStyleIdols(
    allIdols.filter(i => !seedNameIdols.some(n => n.slug === i.slug)),
    brief,
    Math.max(2, styleSlots)
  );
  const derivedGroups = deriveGroupsFromIdols([...seedNameIdols, ...styleIdols]);
  const max = mentionsCrossGenOrAgency(brief, seedGroups) ? 7 : 5;
  const dri = determineDRI(brief);
  const groupsMap = new Map(loadGroups().map(g => [normalized(g.name), g]));
  const state = {
    max,
    members: [],
    visited: new Set(),
    invitation_chain: [],
    declined: [],
    groupsMap,
    briefWantsConflict: briefWantsConflict(brief),
  };

  // Phase 1: 显式团体（最多 2 个，给偶像留席位）
  for (const g of seedGroups.slice(0, 2)) {
    addMember(state, groupMember(g), { from: "brief", to: g.slug, layer: 0, reason: "mentioned group" });
  }

  // Phase 2: 风格偶像优先入场（已按 brief 设计维度做多样性选择）
  for (const i of styleIdols) {
    if (state.members.length >= max) break;
    addMember(state, idolMember(i), { from: "brief", to: i.slug, layer: 0, reason: "style match" });
  }

  // Phase 3: 名字匹配偶像强召回（在团体填满之前保证入座）
  for (const i of seedNameIdols.slice(0, 2)) {
    if (state.members.length >= max) break;
    addMember(state, idolMember(i), { from: "brief", to: i.slug, layer: 0, reason: "mentioned idol" });
  }

  // Phase 4: 从已入选风格偶像 + 名字偶像推导代表团体，补到至少 2 个团体
  const existingGroupSlugs = new Set(state.members.filter(m => m.type === "group").map(m => m.slug));
  for (const g of derivedGroups) {
    if (state.members.length >= max) break;
    if (existingGroupSlugs.has(g.slug)) continue;
    if (state.members.filter(m => m.type === "group").length >= 2 && state.members.length >= max - 2) break;
    addMember(state, groupMember(g), { from: "style-derived", to: g.slug, layer: 0, reason: "style anchor group" });
  }

  // Phase 5: Sister 扩展补团体（仅在仍缺团体且有空位时）
  expandSisterGroups(state);

  // Phase 6: 如果 brief 含 agency，补一个同社代表团体
  if (!state.members.some(m => m.type === "group") && dri.type === "brand") {
    const agency = brief.match(/HYBE|SM|YG|JYP|ADOR|Starship|Source|Belift|Cube|RBW/i)?.[0];
    const g = loadGroups().find(x => normalized(x.agency).includes(normalized(agency)));
    if (g) addMember(state, groupMember(g), { from: "brief", to: g.slug, layer: 0, reason: "agency representative" });
  }

  // Phase 7: 兜底
  if (!state.members.length) {
    const fallback = loadGroups().find(g => g.slug === "ive") || loadGroups()[0];
    addMember(state, groupMember(fallback), { from: "fallback", to: fallback.slug, layer: 0, reason: "fallback group" });
  }

  ensureMix(state, seedGroups.length ? seedGroups : state.members.filter(m => m.type === "group"));

  // Ensure at least two generations are represented when the roster allows.
  ensureGenerationDiversity(state, seedGroups);

  // Rebalance: if council is large but idol quota not met, replace non-seed groups with more style idols.
  if (state.members.length >= 4 && state.members.filter(m => m.type === "idol").length < 2) {
    const seedSlugs = new Set(seedGroups.map(g => g.slug));
    while (state.members.length >= state.max && state.members.filter(m => m.type === "idol").length < 2) {
      const idx = state.members.findLastIndex(m => m.type === "group" && !seedSlugs.has(m.slug));
      if (idx < 0) break;
      state.declined.push({ slug: state.members[idx].slug, reason: "rebalanced for idol quota" });
      state.visited.delete(`group:${state.members[idx].slug}`);
      state.members.splice(idx, 1);
      ensureMix(state, seedGroups.length ? seedGroups : state.members.filter(m => m.type === "group"));
    }
  }

  if (!state.members.some(m => m.type === "user")) addMember(state, userMember(), { from: "protocol", to: "user", layer: "user", reason: "user vote seat" });

  return {
    council_id: deriveCouncilId(brief, state.members, max),
    summoner: dri,
    max_members: max,
    members: state.members,
    invitation_chain: state.invitation_chain,
    declined: state.declined,
  };
}

/**
 * Generate a human-readable explanation for each council member.
 */
export function explainCouncil(council, brief) {
  const briefSpecs = classifyBriefSpecialties(brief);
  return council.members.map(m => {
    const chain = council.invitation_chain.filter(i => i.to === m.slug);
    const reasons = chain.map(i => i.reason);
    if (m.type === "idol") {
      const idolSpecs = classifyIdolSpecialty(m);
      const matched = idolSpecs.filter(s => briefSpecs.includes(s));
      if (matched.length) reasons.push(`style: ${matched.join("+")}`);
    }
    const out = {
      slug: m.slug,
      name: m.name,
      type: m.type,
      reasons: reasons.length ? reasons : ["fallback"],
    };
    if (m.type === "idol" && typeof m.tier === "number") out.tier = m.tier;
    if (m.agency) out.agency = m.agency;
    return out;
  });
}

/**
 * Resolve a free-form user token (slug, stage name, group name, or partial)
 * to a canonical council member. Returns { type, member } or null.
 * Prefers exact matches, then prefix, then substring.
 */
export function resolveMemberSlug(raw) {
  const rawNorm = normalized(raw);
  const token = rawNorm.replace(/\s+/g, "-");
  const idols = loadIdols();
  const groups = loadGroups();
  const candidates = [];

  for (const i of idols) {
    const s = normalized(i.slug);
    const n = normalized(i.name);
    if (s === token || s === rawNorm || n === rawNorm) return { type: "idol", member: i };
    if (s.startsWith(token) || n.startsWith(rawNorm)) candidates.push({ type: "idol", member: i, score: 2 });
    else if (s.includes(token) || n.includes(rawNorm)) candidates.push({ type: "idol", member: i, score: 1 });
  }

  for (const g of groups) {
    const s = normalized(g.slug);
    const n = normalized(g.name);
    if (s === token || s === rawNorm || n === rawNorm) return { type: "group", member: g };
    if (s.startsWith(token) || n.startsWith(rawNorm)) candidates.push({ type: "group", member: g, score: 2 });
    else if (s.includes(token) || n.includes(rawNorm)) candidates.push({ type: "group", member: g, score: 1 });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

function memberReasons(council, member) {
  return council.invitation_chain.filter(i => i.to === member.slug).map(i => i.reason);
}

function relevanceScore(member, council, brief) {
  let score = 0;
  const reasons = memberReasons(council, member);
  if (council.summoner?.slug === member.slug && council.summoner?.type === member.type) score += 100;
  if (reasons.includes("mentioned group") || reasons.includes("mentioned idol")) score += 80;
  if (reasons.includes("style match")) {
    score += 50;
    if (brief && member.type === "idol") {
      const briefSpecs = classifyBriefSpecialties(brief);
      const idolSpecs = classifyIdolSpecialty(member);
      score += idolSpecs.filter(s => briefSpecs.includes(s)).length * 10;
    }
  }
  if (reasons.includes("style anchor group")) score += 40;
  if (reasons.includes("agency representative")) score += 30;
  if (reasons.some(r => r.startsWith("same_"))) score += 10;
  if (reasons.includes("generation diversity")) score += 5;
  if (reasons.includes("group idol quota")) score += 5;
  if (reasons.includes("fallback")) score -= 50;
  return score;
}

/**
 * Apply user overrides after assembly. Supports veto (remove) and add by slug/name.
 * Returns a new council object; original is not mutated.
 */
export function applyUserOverrides(council, opts = {}) {
  const { addSlugs = [], vetoSlugs = [], strictSize = false } = opts;
  const vetoSet = new Set(vetoSlugs.map(normalized));
  // Pull the user seat out so we can always append it last after overrides.
  const user = council.members.find(m => m.type === "user");
  const baseMembers = council.members.filter(m => m.type !== "user" && !vetoSet.has(normalized(m.slug)));
  const members = [...baseMembers];
  const visited = new Set(members.map(m => `${m.type}:${m.slug}`));
  const invitation_chain = [...council.invitation_chain];
  const addedSlugs = new Set();

  for (const rawSlug of addSlugs) {
    const resolved = resolveMemberSlug(rawSlug);
    if (!resolved) continue;
    const { type, member } = resolved;
    if (visited.has(`${type}:${member.slug}`)) continue;

    members.push(type === "idol" ? idolMember(member) : groupMember(member));
    visited.add(`${type}:${member.slug}`);
    addedSlugs.add(member.slug);
    invitation_chain.push({ from: "user", to: member.slug, layer: "user", reason: "user override add" });
  }

  // Strict mode: trim back to max_members while preserving user + added overrides.
  // Trim lowest-relevance members first instead of the last-added member.
  const max = strictSize ? (council.max_members || members.length + 1) : Infinity;
  while (members.length >= max) {
    const trimmable = members.filter(m => !addedSlugs.has(m.slug));
    if (trimmable.length === 0) break;
    trimmable.sort((a, b) => relevanceScore(a, council, opts.brief) - relevanceScore(b, council, opts.brief));
    const removed = trimmable[0];
    const idx = members.findIndex(m => m.type === removed.type && m.slug === removed.slug);
    if (idx < 0) break;
    members.splice(idx, 1);
    visited.delete(`${removed.type}:${removed.slug}`);
    invitation_chain.push({ from: "protocol", to: removed.slug, layer: "rebalance", reason: "strict-size trim" });
  }

  // User seat always closes the council.
  members.push(user || userMember());
  if (!invitation_chain.some(i => i.to === "user")) {
    invitation_chain.push({ from: "protocol", to: "user", layer: "user", reason: "user vote seat" });
  }

  return { ...council, members, invitation_chain };
}
