#!/usr/bin/env node
// scripts/score-tiers.mjs
// Preview tier distribution based on popularity score before applying.

import { loadIdols } from "../engine/council-assembly.mjs";

const TOP_GROUPS = new Set([
  "aespa", "BLACKPINK", "bp", "(G)I-DLE", "idle", "ITZY", "itzy", "IVE", "ive",
  "LE SSERAFIM", "lsf", "MAMAMOO", "mmm", "NewJeans", "nj", "Red Velvet", "rv",
  "Girls' Generation", "snsd", "TWICE", "twice", "2NE1", "2ne1"
].map(g => g.toLowerCase()));

const WELL_KNOWN_GROUPS = new Set([
  "Apink", "apink", "AOA", "aoa", "After School", "as", "Dreamcatcher", "dc",
  "EVERGLOW", "everglow", "EXID", "exid", "f(x)", "fx", "fromis_9", "fromis",
  "Girl's Day", "gd", "GFRIEND", "gfriend", "KARA", "kara", "LOONA", "loona",
  "miss A", "missa", "NMIXX", "nmixx", "Oh My Girl", "omg", "SISTAR", "sistar",
  "STAYC", "stayc", "T-ara", "tara", "Wonder Girls", "wg", "WJSN", "wjsn",
  "XG", "xg", "4Minute", "4min"
].map(g => g.toLowerCase()));

const STAR_SLUGS = new Set([
  // Legendary soloists
  "iu", "sunmi", "hyuna", "boa", "lee-hyori", "chungha", "somi",
  // Top global faces
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
  "wjsn-exy", "loona-chuu", "exid-hani", "fx-krystal", "girlsday-hyeri",
  "apink-eunji", "gfriend-yerin", "omg-yooa", "stayc-sumin",
]);

function normalizedGroup(group) {
  return String(group || "").toLowerCase().trim();
}

function isLeader(role) {
  const r = String(role || "").toLowerCase();
  return r.includes("leader") || r.includes("队长") || r.includes("리더");
}

function scoreIdol(i) {
  let score = 0;
  const g = normalizedGroup(i.group);
  if (TOP_GROUPS.has(g)) score += 50;
  else if (WELL_KNOWN_GROUPS.has(g)) score += 35;
  else if (i.group === "Solo" || !i.group) score += 45;
  else score += 20;

  if (STAR_SLUGS.has(i.slug)) score += 30;
  if (isLeader(i.role)) score += 15;
  return score;
}

const idols = loadIdols();
const scored = idols.map(i => ({ ...i, score: scoreIdol(i) })).sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

function tier(score) {
  if (score >= 65) return 0;
  if (score >= 45) return 1;
  return 2;
}

const counts = [0, 0, 0];
for (const i of scored) counts[tier(i.score)]++;
console.log(`Tier 0: ${counts[0]}, Tier 1: ${counts[1]}, Tier 2: ${counts[2]} (total ${idols.length})`);
console.log("\nTier 0 preview:");
for (const i of scored.filter(x => tier(x.score) === 0).slice(0, 30)) {
  console.log(`  ${i.slug} (${i.group}) score=${i.score}`);
}
console.log("\nTier 1 preview (first 20):");
for (const i of scored.filter(x => tier(x.score) === 1).slice(0, 20)) {
  console.log(`  ${i.slug} (${i.group}) score=${i.score}`);
}
