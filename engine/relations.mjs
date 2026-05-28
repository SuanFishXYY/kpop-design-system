// engine/relations.mjs
// v3.3.0 ? Sister group relation engine

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GROUPS = join(ROOT, "groups");

function parseArray(value) {
  const m = String(value || "").trim().match(/^\[([\s\S]*)\]$/);
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

let groupCache = null;
export function loadGroups() {
  if (groupCache) return groupCache;
  groupCache = readdirSync(GROUPS).filter(f => f.endsWith(".md")).map(file => {
    const raw = readFileSync(join(GROUPS, file), "utf-8");
    const fm = parseFrontmatter(raw);
    return {
      slug: fm.group_slug || file.replace(/\.md$/, ""),
      file,
      name: fm.group_name || fm.name || file.replace(/\.md$/, ""),
      era: fm.era || "",
      agency: fm.agency || "",
      aesthetic_tags: Array.isArray(fm.aesthetic_tags) ? fm.aesthetic_tags : [],
      rivals: Array.isArray(fm.rivals) ? fm.rivals : [],
      counterpoint_axis: fm.counterpoint_axis || "",
    };
  });
  return groupCache;
}

function findGroup(groupSlug) {
  return loadGroups().find(g => g.slug === groupSlug || g.file === `${groupSlug}.md` || g.name.toLowerCase() === String(groupSlug).toLowerCase());
}

function relationResult(type, source, target, evidence) {
  return { type, source: source.slug, target: target.slug, group_name: target.name, evidence };
}

export function getSameGeneration(groupSlug) {
  const source = findGroup(groupSlug);
  if (!source || !source.era) return [];
  return loadGroups()
    .filter(g => g.slug !== source.slug && g.era === source.era)
    .map(g => relationResult("same_generation", source, g, source.era));
}

export function getSameAgency(groupSlug) {
  const source = findGroup(groupSlug);
  if (!source || !source.agency) return [];
  return loadGroups()
    .filter(g => g.slug !== source.slug && g.agency === source.agency)
    .map(g => relationResult("same_agency", source, g, source.agency));
}

export function getSameAesthetic(groupSlug) {
  const source = findGroup(groupSlug);
  if (!source || !source.aesthetic_tags.length) return [];
  const sourceTags = new Set(source.aesthetic_tags.map(t => t.toLowerCase()));
  return loadGroups()
    .filter(g => g.slug !== source.slug)
    .map(g => ({ group: g, overlap: g.aesthetic_tags.filter(t => sourceTags.has(t.toLowerCase())) }))
    .filter(x => x.overlap.length > 0)
    .map(x => relationResult("same_aesthetic", source, x.group, x.overlap));
}

export function getAestheticCounterpoint(groupSlug) {
  const source = findGroup(groupSlug);
  if (!source || !source.rivals.length) return [];
  return source.rivals.map(slug => findGroup(slug)).filter(Boolean).map(target => relationResult(
    "aesthetic_counterpoint",
    source,
    target,
    source.counterpoint_axis || target.counterpoint_axis || source.rivals.join(" ? ")
  ));
}

const relationFns = {
  same_generation: getSameGeneration,
  same_agency: getSameAgency,
  same_aesthetic: getSameAesthetic,
  aesthetic_counterpoint: getAestheticCounterpoint,
};

export function getAllSisterGroups(groupSlug, types = Object.keys(relationFns)) {
  const requested = types?.length ? types : Object.keys(relationFns);
  const byTarget = new Map();
  for (const type of requested) {
    const fn = relationFns[type];
    if (!fn) continue;
    for (const rel of fn(groupSlug)) {
      const current = byTarget.get(rel.target) || { target: rel.target, group_name: rel.group_name, relation_types: [], evidence: {} };
      current.relation_types.push(rel.type);
      current.evidence[rel.type] = rel.evidence;
      byTarget.set(rel.target, current);
    }
  }
  return [...byTarget.values()];
}
