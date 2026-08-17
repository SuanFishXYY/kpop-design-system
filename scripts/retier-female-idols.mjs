#!/usr/bin/env node
// scripts/retier-female-idols.mjs
// v3.5.0 · 基于 popularity score 的 3-tier 重分类：
//   Tier 0 = 顶流团体成员 / 全球面孔 / 知名团体队长
//   Tier 1 = 其他知名团体成员 / 顶流团体非核心成员
//   Tier 2 = 其余 / 新人 / 知名度较低成员
// Score: top group 50 / well-known 45 / solo 45 / mid 25
//         + leader bonus 10  + global star bonus 20
// Tier thresholds: 0 >= 55, 1 >= 40, 2 < 40

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadIdols } from "../engine/council-assembly.mjs";
import { loadGroups } from "../engine/relations.mjs";

const AGENTS = join(process.cwd(), "agents");

const TOP_GROUP_SLUGS = new Set([
  "aespa", "bp", "idle", "itzy", "ive", "lsf", "mmm", "nj", "rv", "snsd", "twice", "2ne1",
]);

const WELL_KNOWN_GROUP_SLUGS = new Set([
  "apink", "aoa", "as", "dc", "everglow", "exid", "fx", "fromis", "gd", "gfriend",
  "kara", "loona", "missa", "nmixx", "omg", "sistar", "stayc", "tara", "wg", "wjsn",
  "xg", "4min",
]);

// 全球/区域级 TOP 面孔，人数控制在 ~50
const STAR_SLUGS = new Set([
  // 传奇 solo
  "iu", "sunmi", "hyuna", "boa", "lee-hyori", "chungha", "somi",
  // 顶流团成员
  "bp-jennie", "bp-jisoo", "bp-lisa", "bp-rose",
  "twice-nayeon", "twice-sana", "twice-tzuyu", "twice-momo", "twice-jihyo",
  "rv-irene", "rv-seulgi",
  "mmm-solar", "mmm-hwasa",
  "snsd-taeyeon", "snsd-yoona",
  "2ne1-cl", "2ne1-dara",
  "aespa-karina", "aespa-winter",
  "idle-soyeon", "idle-yuqi",
  "itzy-yeji", "itzy-ryujin",
  "ive-wonyoung", "ive-yujin",
  "lsf-chaewon", "lsf-sakura",
  "nj-minji", "nj-hanni", "nj-haerin",
  // 2-3 代高认知度代表
  "kara-gyuri", "missa-suzy", "apink-eunji", "gfriend-yerin", "omg-yooa",
  "stayc-sumin", "exid-hani", "fx-krystal", "sistar-hyolyn", "girlsday-hyeri",
  "loona-chuu", "dc-jiu", "fromis-saerom", "everglow-sihyeon", "nmixx-haewon", "xg-jurin",
]);

const groupSlugMap = new Map(loadGroups().map(g => [g.name.toLowerCase(), g.slug]));
function groupSlug(name) {
  return groupSlugMap.get(String(name || "").toLowerCase()) || "";
}

function isLeader(role) {
  const r = String(role || "").toLowerCase();
  return r.includes("leader") || r.includes("队长") || r.includes("리더");
}

function scoreIdol(i) {
  let score = 0;
  const slug = groupSlug(i.group);
  if (TOP_GROUP_SLUGS.has(slug)) score += 50;
  else if (WELL_KNOWN_GROUP_SLUGS.has(slug)) score += 45;
  else if (i.group === "Solo" || !i.group) score += 45;
  else score += 25;

  if (STAR_SLUGS.has(i.slug)) score += 20;
  if (isLeader(i.role)) score += 10;
  return score;
}

function tierFromScore(score) {
  if (score >= 55) return 0;
  if (score >= 40) return 1;
  return 2;
}

const idols = loadIdols();
let changes = 0;

for (const i of idols) {
  const score = scoreIdol(i);
  const newTier = tierFromScore(score);

  if (i.tier !== newTier) {
    const path = join(AGENTS, `${i.slug}.md`);
    let raw = readFileSync(path, "utf-8");
    raw = raw.replace(/tier:\s*\d/, `tier: ${newTier}`);
    const newWeight = newTier === 0 ? 2.5 : newTier === 1 ? 2 : 1.5;
    raw = raw.replace(/vote_weight:\s*[\d.]+/, `vote_weight: ${newWeight}`);
    // Update description tier mention if present
    raw = raw.replace(/Tier \d/g, `Tier ${newTier}`);
    writeFileSync(path, raw, "utf-8");
    console.log(`${i.slug}: ${i.tier} -> ${newTier} (score ${score}, weight ${newWeight})`);
    changes++;
  }
}

console.log(`\nRetiered ${changes} idols.`);
