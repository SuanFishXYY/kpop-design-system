// engine/eras.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { loadAllEras, listGroupEras, getEraDNA, detectEra, getEraLockedDNA, checkEraForbidden } from "./eras.mjs";

test("loadAllEras: 52 团至少 50 团有 era", () => {
  const map = loadAllEras();
  const count = Object.keys(map).length;
  assert(count >= 50, `expected ≥50, got ${count}`);
});

test("listGroupEras(twice): 4 era (Cheer Up / Fancy / Formula / Ready)", () => {
  const eras = listGroupEras("twice");
  assert.equal(eras.length, 4);
  assert(eras.some(e => e.era_slug === "fancy"));
  assert(eras.some(e => e.era_slug === "cheer_up"));
});

test("getEraDNA(twice, fancy): palette + mood + forbidden 齐", () => {
  const era = getEraDNA("twice", "fancy");
  assert(era, "era should exist");
  assert.equal(era.era_name, "Fancy Era");
  assert.equal(era.palette.primary, "#2E2E3E");
  assert(era.mood.includes("冷感"));
  assert(era.forbidden.includes("Y2K 贴纸"));
  assert.equal(era.motion_hint.bpm, 122);
});

test("getEraDNA(bp, born_pink): hot pink + 黑 + 90 bpm", () => {
  const era = getEraDNA("bp", "born_pink");
  assert(era);
  assert.equal(era.palette.primary, "#FF1493");
  assert.equal(era.motion_hint.bpm, 90);
});

test("detectEra: 'TWICE Fancy era 风格' 命中 twice/fancy", () => {
  const hits = detectEra("TWICE Fancy era 风格的电商 landing");
  assert(hits.length >= 1);
  const hit = hits.find(h => h.group_slug === "twice" && h.era_slug === "fancy");
  assert(hit, "should hit twice/fancy");
});

test("detectEra: 专辑名 'Born Pink' 命中 bp/born_pink", () => {
  const hits = detectEra("BLACKPINK Born Pink 周边设计");
  const hit = hits.find(h => h.group_slug === "bp" && h.era_slug === "born_pink");
  assert(hit);
  assert(hit.reason.includes("era_name") || hit.reason.includes("album"));
});

test("detectEra: 普通 brief 不命中任何 era", () => {
  const hits = detectEra("做一个通用的女团 landing page");
  assert.equal(hits.length, 0);
});

test("getEraLockedDNA: 命中后 primary era 返回 + summary", () => {
  const result = getEraLockedDNA("aespa Supernova era 视觉");
  assert(result);
  assert.equal(result.primary.group_slug, "aespa");
  assert.equal(result.primary.era_slug, "supernova");
  assert(result.summary.length > 0);
});

test("checkEraForbidden: TWICE Fancy era brief 提到 'Y2K' → 违规", () => {
  const era = getEraDNA("twice", "fancy");
  const check = checkEraForbidden("TWICE Fancy era 用 Y2K 贴纸做 hero", era);
  assert(check.has_violation);
  assert(check.violations.length > 0);
});

test("checkEraForbidden: TWICE Cheer Up era 不提 forbidden 词 → 合规", () => {
  const era = getEraDNA("twice", "cheer_up");
  const check = checkEraForbidden("TWICE Cheer Up era 校园粉嫩 hero", era);
  assert.equal(check.has_violation, false);
});
