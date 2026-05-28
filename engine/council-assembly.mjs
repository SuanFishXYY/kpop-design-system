// engine/council-assembly.mjs
// v3.3.0 ? Mixed Council assembly: idols + groups + user, one vote each.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllSisterGroups, loadGroups } from "./relations.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AGENTS = join(ROOT, "agents");

function parseArray(value) {
  const m = String(value || "").trim().match(/^\[([\s\S]*)\]/);
  if (!m) return [];
  return m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
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
export function loadIdols() {
  if (idolCache) return idolCache;
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
      vote: 1,
    };
  });
  return idolCache;
}

function normalized(str) { return String(str || "").toLowerCase(); }
function groupMember(g) { return { type: "group", slug: g.slug, name: g.name, agency: g.agency, era: g.era, vote: 1 }; }
function idolMember(i) { return { ...i, vote: 1 }; }
function userMember() { return { type: "user", slug: "user", name: "User", vote: 1 }; }

function matchGroups(brief) {
  const lower = normalized(brief);
  return loadGroups().filter(g => lower.includes(normalized(g.slug)) || lower.includes(normalized(g.name)));
}

function matchIdols(brief) {
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
  const idols = matchIdols(brief);
  if (idols.length) return { type: "idol", slug: idols[0].slug, reason: "brief matched idol/style" };
  if (/(HYBE|SM|YG|JYP|ADOR|Starship|Source|Belift|Cube|RBW)/i.test(brief)) return { type: "brand", slug: "brand-dri", reason: "brief matched agency" };
  return { type: "idol", slug: "stage-director", reason: "fallback stage director" };
}

function addMember(state, member, chainEntry = null) {
  if (!member || state.members.length >= state.max) return false;
  const key = `${member.type}:${member.slug}`;
  if (state.visited.has(key)) return false;
  if (member.type === "group" && member.agency) {
    const current = state.members.filter(m => m.type === "group" && m.agency === member.agency).length;
    if (current >= 3) {
      state.declined.push({ slug: member.slug, reason: "same-agency cap" });
      return false;
    }
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
  for (const g of seedGroups) {
    if (groups().length >= 2 || state.members.length >= state.max) break;
    for (const rel of getAllSisterGroups(g.slug)) {
      const target = loadGroups().find(x => x.slug === rel.target);
      if (target && addMember(state, groupMember(target), { from: g.slug, to: target.slug, layer: "mix", reason: rel.relation_types.join("+") })) break;
    }
  }
  const groupNames = new Set(groups().map(g => normalized(g.name)));
  for (const idol of loadIdols()) {
    if (idols().length >= 2 || state.members.length >= state.max) break;
    if (groupNames.has(normalized(idol.group))) addMember(state, idolMember(idol), { from: idol.group, to: idol.slug, layer: "mix", reason: "group idol quota" });
  }
}

export function assembleCouncil(brief) {
  const seedGroups = matchGroups(brief);
  const seedIdols = matchIdols(brief);
  const max = mentionsCrossGenOrAgency(brief, seedGroups) ? 7 : 5;
  const dri = determineDRI(brief);
  const state = { max, members: [], visited: new Set(), invitation_chain: [], declined: [] };

  for (const g of seedGroups.slice(0, 3)) addMember(state, groupMember(g), { from: "brief", to: g.slug, layer: 0, reason: "mentioned group" });
  for (const i of seedIdols.slice(0, 2)) addMember(state, idolMember(i), { from: "brief", to: i.slug, layer: 0, reason: "mentioned idol" });

  if (!state.members.some(m => m.type === "group") && dri.type === "brand") {
    const agency = brief.match(/HYBE|SM|YG|JYP|ADOR|Starship|Source|Belift|Cube|RBW/i)?.[0];
    const g = loadGroups().find(x => normalized(x.agency).includes(normalized(agency)));
    if (g) addMember(state, groupMember(g), { from: "brief", to: g.slug, layer: 0, reason: "agency representative" });
  }

  if (!state.members.length) {
    const fallback = loadGroups().find(g => g.slug === "ive") || loadGroups()[0];
    addMember(state, groupMember(fallback), { from: "fallback", to: fallback.slug, layer: 0, reason: "fallback group" });
  }

  const queue = state.members.filter(m => m.type === "group").map(m => ({ member: m, depth: 0 }));
  while (queue.length && state.members.length < max) {
    const { member, depth } = queue.shift();
    if (depth >= 3) continue;
    const invited = getAllSisterGroups(member.slug).slice(0, 3);
    for (const rel of invited) {
      if (state.members.length >= max) break;
      const target = loadGroups().find(g => g.slug === rel.target);
      if (!target) continue;
      const added = addMember(state, groupMember(target), { from: member.slug, to: target.slug, layer: depth + 1, reason: rel.relation_types.join("+") });
      if (added) queue.push({ member: groupMember(target), depth: depth + 1 });
    }
  }

  ensureMix(state, seedGroups.length ? seedGroups : state.members.filter(m => m.type === "group"));

  // If groups over-filled the default cap before idol quota, replace lowest-priority non-seed groups.
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
    council_id: `mixed-${Date.now().toString(36)}`,
    summoner: dri,
    max_members: max,
    members: state.members,
    invitation_chain: state.invitation_chain,
    declined: state.declined,
  };
}
