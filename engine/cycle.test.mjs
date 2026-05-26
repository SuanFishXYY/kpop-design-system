// engine/cycle.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { dispatchComebackCycle, getStageBrief, listCycleStages, CYCLE_STAGES } from "./cycle.mjs";

test("CYCLE_STAGES: 共 7 个节点 from D-30 to D+7", () => {
  assert.equal(CYCLE_STAGES.length, 7);
  assert.equal(CYCLE_STAGES[0].day_offset, -30);
  assert.equal(CYCLE_STAGES[6].day_offset, 7);
});

test("dispatchComebackCycle(twice, fancy): 7 stage briefs · 每个含 era_name", () => {
  const c = dispatchComebackCycle("twice", "fancy");
  assert(!c.error, c.error);
  assert.equal(c.stage_count, 7);
  assert.equal(c.era_name, "Fancy Era");
  for (const s of c.stages) {
    assert.equal(s.era_name, "Fancy Era");
    assert(s.brief_summary.includes("Fancy Era"));
  }
});

test("dispatchComebackCycle: D-30 stage 不释出 palette, D-21 起释出", () => {
  const c = dispatchComebackCycle("bp", "born_pink");
  const d30 = c.stages.find(s => s.day_offset === -30);
  const d21 = c.stages.find(s => s.day_offset === -21);
  assert.equal(d30.palette, null);
  assert(d21.palette);
  assert.equal(d21.palette.primary, "#FF1493");
});

test("dispatchComebackCycle: 不存在的 era 返回 error + available_eras", () => {
  const c = dispatchComebackCycle("twice", "nonexistent_era");
  assert(c.error);
  assert(Array.isArray(c.available_eras));
  assert(c.available_eras.includes("fancy"));
});

test("getStageBrief(twice, fancy, d-day-mv-release): 完整 era 视觉指令", () => {
  const s = getStageBrief("twice", "fancy", "d-day-mv-release");
  assert(!s.error);
  assert(s.palette);
  assert(s.motion_hint);
  assert(s.brief_summary.includes("工业空间"));
  assert(s.combined_forbidden.length > 0);
});
