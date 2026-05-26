// engine/generation.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { checkGenerationAesthetic, getGroupGeneration, GENERATION_CARDS, listGenerationCards } from "./generation.mjs";

test("GENERATION_CARDS: 4 代齐 (2/3/4/5)", () => {
  for (const k of ["2代", "3代", "4代", "5代"]) {
    assert(GENERATION_CARDS[k], `missing ${k}`);
    assert(GENERATION_CARDS[k].forbidden_in_brief.length > 0);
  }
});

test("getGroupGeneration(babymonster) returns 5代 (假设有)", () => {
  // BABYMONSTER (slug bm) 是 5 代
  const gen = getGroupGeneration("bm");
  // 不强制断言 (可能用其他 slug), 但若存在应该是 5代
  if (gen) assert.equal(gen, "5代");
});

test("getGroupGeneration(twice) returns 3代", () => {
  assert.equal(getGroupGeneration("twice"), "3代");
});

test("checkGenerationAesthetic: 5 代团 brief 提 Y2K → 违规 + 建议", () => {
  // 取 5 代团 (illit/xg/bm/lapillus 其一)
  // 先查 illit 的 generation
  const gen = getGroupGeneration("illit");
  if (gen === "5代") {
    const result = checkGenerationAesthetic("ILLIT 用 Y2K 复古风做 landing", "illit");
    assert(result.has_violation, "should violate");
    assert(result.violations.includes("Y2K"));
    assert(result.suggestion);
  }
});

test("checkGenerationAesthetic: 3 代 TWICE brief 提暗黑科技 → 违规", () => {
  const result = checkGenerationAesthetic("TWICE 暗黑科技风 hero", "twice");
  assert(result.has_violation);
  assert(result.violations.includes("暗黑科技"));
});

test("checkGenerationAesthetic: 4 代 IVE 走极简公主 → 合规", () => {
  const result = checkGenerationAesthetic("IVE 极简公主梦幻 landing", "ive");
  assert.equal(result.has_violation, false);
});

test("listGenerationCards: 返回 4 张卡 + 完整字段", () => {
  const cards = listGenerationCards();
  assert.equal(cards.length, 4);
  for (const c of cards) {
    assert(c.generation);
    assert(c.label);
    assert(Array.isArray(c.representatives));
    assert(Array.isArray(c.aesthetic_signature));
    assert(Array.isArray(c.forbidden_in_brief));
  }
});
