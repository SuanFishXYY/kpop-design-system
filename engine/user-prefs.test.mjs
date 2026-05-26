// engine/user-prefs.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  loadUserPrefs, saveUserPrefs, recordOverride, recordFavorite,
  recordRejectedSpecialty, topFavorites, shouldSkipSpecialty, MAX_OVERRIDES,
} from "./user-prefs.mjs";

const TEST_PATH = join(tmpdir(), `kpop-prefs-test-${Date.now()}.json`);

test("loadUserPrefs · 文件不存在返回空 prefs", () => {
  const p = loadUserPrefs(join(tmpdir(), `nonexistent-${Date.now()}.json`));
  assert.equal(p.version, 1);
  assert.deepEqual(p.overrides, []);
});

test("save + reload roundtrip", () => {
  const p = loadUserPrefs(TEST_PATH);
  recordFavorite(p, { group_slug: "twice", era_slug: "fancy" });
  saveUserPrefs(p, TEST_PATH);
  const reloaded = loadUserPrefs(TEST_PATH);
  assert.equal(reloaded.favorites.length, 1);
  assert.equal(reloaded.favorites[0].group_slug, "twice");
  unlinkSync(TEST_PATH);
});

test("recordOverride · 最多保留 MAX_OVERRIDES 条", () => {
  const p = loadUserPrefs(join(tmpdir(), `nx-${Date.now()}.json`));
  for (let i = 0; i < MAX_OVERRIDES + 10; i++) {
    recordOverride(p, { brief: `brief ${i}`, council_verdict: "reject", user_verdict: "pass", reason: "test" });
  }
  assert.equal(p.overrides.length, MAX_OVERRIDES);
  assert.equal(p.overrides[0].brief, `brief ${MAX_OVERRIDES + 9}`);
});

test("recordFavorite · 同 key 累加 count", () => {
  const p = loadUserPrefs(join(tmpdir(), `nx-${Date.now()}.json`));
  recordFavorite(p, { group_slug: "ive", era_slug: "iam" });
  recordFavorite(p, { group_slug: "ive", era_slug: "iam" });
  recordFavorite(p, { group_slug: "ive", era_slug: "iam" });
  assert.equal(p.favorites.length, 1);
  assert.equal(p.favorites[0].count, 3);
});

test("topFavorites · 按 count 排序", () => {
  const p = loadUserPrefs(join(tmpdir(), `nx-${Date.now()}.json`));
  recordFavorite(p, { group_slug: "twice", era_slug: "fancy" });
  recordFavorite(p, { group_slug: "ive", era_slug: "iam" });
  recordFavorite(p, { group_slug: "ive", era_slug: "iam" });
  const top = topFavorites(p, 2);
  assert.equal(top[0].group_slug, "ive");
  assert.equal(top[1].group_slug, "twice");
});

test("shouldSkipSpecialty · 累计达到阈值返回 true", () => {
  const p = loadUserPrefs(join(tmpdir(), `nx-${Date.now()}.json`));
  recordRejectedSpecialty(p, "motion");
  recordRejectedSpecialty(p, "motion");
  assert.equal(shouldSkipSpecialty(p, "motion", 3), false);
  recordRejectedSpecialty(p, "motion");
  assert.equal(shouldSkipSpecialty(p, "motion", 3), true);
});
