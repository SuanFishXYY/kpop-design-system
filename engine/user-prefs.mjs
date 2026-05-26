// engine/user-prefs.mjs
// v3.1 Phase B · 用户偏好学习 (本地 only)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const DEFAULT_PATH = join(homedir(), ".kpop-design", "user-prefs.json");
const MAX_OVERRIDES = 50;
const MAX_FAVORITES = 30;

function emptyPrefs() {
  return {
    version: 1,
    overrides: [],
    favorites: [],
    rejected_specialties: {},
    updated_at: null,
  };
}

export function loadUserPrefs(path = DEFAULT_PATH) {
  if (!existsSync(path)) return emptyPrefs();
  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw);
    return { ...emptyPrefs(), ...data };
  } catch {
    return emptyPrefs();
  }
}

export function saveUserPrefs(prefs, path = DEFAULT_PATH) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  prefs.updated_at = new Date().toISOString();
  writeFileSync(path, JSON.stringify(prefs, null, 2), "utf-8");
  return prefs;
}

export function recordOverride(prefs, { brief, council_verdict, user_verdict, reason }) {
  prefs.overrides.unshift({
    ts: new Date().toISOString(),
    brief: brief.slice(0, 200),
    council_verdict,
    user_verdict,
    reason: (reason || "").slice(0, 200),
  });
  if (prefs.overrides.length > MAX_OVERRIDES) prefs.overrides = prefs.overrides.slice(0, MAX_OVERRIDES);
  return prefs;
}

export function recordFavorite(prefs, { group_slug, era_slug }) {
  const key = `${group_slug}/${era_slug || "default"}`;
  const existing = prefs.favorites.find(f => f.key === key);
  if (existing) {
    existing.count += 1;
    existing.last_used = new Date().toISOString();
  } else {
    prefs.favorites.unshift({ key, group_slug, era_slug, count: 1, last_used: new Date().toISOString() });
  }
  if (prefs.favorites.length > MAX_FAVORITES) prefs.favorites = prefs.favorites.slice(0, MAX_FAVORITES);
  return prefs;
}

export function recordRejectedSpecialty(prefs, specialty) {
  prefs.rejected_specialties[specialty] = (prefs.rejected_specialties[specialty] || 0) + 1;
  return prefs;
}

export function topFavorites(prefs, n = 5) {
  return [...prefs.favorites].sort((a, b) => b.count - a.count).slice(0, n);
}

export function shouldSkipSpecialty(prefs, specialty, threshold = 3) {
  return (prefs.rejected_specialties[specialty] || 0) >= threshold;
}

export { DEFAULT_PATH, MAX_OVERRIDES, MAX_FAVORITES };
