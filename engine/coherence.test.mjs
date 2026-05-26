// engine/coherence.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { auditTouchpointCoherence, listTouchpoints, TOUCHPOINTS } from "./coherence.mjs";

test("TOUCHPOINTS: 5 个媒介定义齐 (mv/sns_post/photocard/lightstick/stage)", () => {
  const keys = Object.keys(TOUCHPOINTS);
  for (const k of ["mv", "sns_post", "photocard", "lightstick", "stage"]) {
    assert(keys.includes(k), `missing ${k}`);
  }
});

test("audit · 5 媒介都用 era base palette → 一致性 PASS (high score)", () => {
  // TWICE Fancy era base: #2E2E3E / #B8A0C9 / #D4AF7A
  const observations = [
    { medium: "mv", palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
    { medium: "sns_post", palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
    { medium: "photocard", palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
    { medium: "lightstick", palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
    { medium: "stage", palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" } },
  ];
  const r = auditTouchpointCoherence("twice", "fancy", observations);
  assert(!r.error);
  assert.equal(r.medium_count, 5);
  assert(["PASS", "WARN"].includes(r.verdict));
});

test("audit · 极端偏离 (全用纯白) → 一致性 FAIL", () => {
  const observations = [
    { medium: "mv", palette: { primary: "#FFFFFF", secondary: "#FFFFFF", accent: "#FFFFFF" } },
    { medium: "sns_post", palette: { primary: "#FFFFFF", secondary: "#FFFFFF", accent: "#FFFFFF" } },
  ];
  const r = auditTouchpointCoherence("bp", "born_pink", observations);
  assert(["FAIL", "WARN"].includes(r.verdict));
  assert(r.overall_score < 80);
});

test("audit · unknown medium 返回 error 单项", () => {
  const observations = [
    { medium: "tiktok_filter", palette: { primary: "#000", secondary: "#000", accent: "#000" } },
  ];
  const r = auditTouchpointCoherence("twice", "fancy", observations);
  assert.equal(r.results[0].error, "unknown medium");
});

test("audit · 不存在的 era → error", () => {
  const r = auditTouchpointCoherence("twice", "missing_era", []);
  assert(r.error);
});

test("listTouchpoints: 返回 5 项 with notes", () => {
  const ts = listTouchpoints();
  assert.equal(ts.length, 5);
  for (const t of ts) {
    assert(t.medium);
    assert(t.label);
    assert(t.note);
  }
});
