import { test } from "node:test";
import assert from "node:assert";
import { getReviewers, DEFAULT_REVIEWERS } from "./reviewers.mjs";

test("getReviewers returns a copy of the default reviewers", () => {
  const reviewers = getReviewers("any brief");
  assert.equal(reviewers.length, DEFAULT_REVIEWERS.length);
  assert(reviewers.every(r => r.name && r.opinion && r.verdict));
  // returned array must be a copy
  reviewers[0].verdict = "changed";
  assert.notEqual(DEFAULT_REVIEWERS[0].verdict, "changed");
});

test("default reviewers cover color, motion, and typography", () => {
  const names = DEFAULT_REVIEWERS.map(r => r.name);
  assert(names.includes("color-strategist"));
  assert(names.includes("motion-director"));
  assert(names.includes("typography-curator"));
});

test("getReviewers is brief-aware", () => {
  const typographyFirst = getReviewers("typography landing page headline");
  assert.equal(typographyFirst[0].name, "typography-curator");
  const motionFirst = getReviewers("motion animation tempo");
  assert.equal(motionFirst[0].name, "motion-director");
});
