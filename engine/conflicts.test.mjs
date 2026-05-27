// engine/conflicts.test.mjs
import { test } from "node:test";
import assert from "node:assert";
import { checkPersonalConflict, deriveFromAgentFields, checkLabelDisputeAwareness, LABEL_DISPUTE_ADVISORIES } from "./conflicts.mjs";

test("conflicts · 空 council 返回 has_personal_conflict=false", () => {
  const r = checkPersonalConflict([]);
  assert.strictEqual(r.has_personal_conflict, false);
  assert.deepStrictEqual(r.fires, []);
});

test("conflicts · 单人 council 不触发", () => {
  const r = checkPersonalConflict(["aespa-karina"]);
  assert.strictEqual(r.has_personal_conflict, false);
});

test("conflicts · mock registry · 双方都在场触发 R-Personal", () => {
  const mockRegistry = [{
    parties: ["mock-a", "mock-b"],
    type: "label-dispute",
    severity: "high",
    advisory: "test advisory",
    suggested_mediator: "neutral-evaluator",
    public_record: "test record",
  }];
  const r = checkPersonalConflict(["mock-a", "mock-b", "aespa-karina"], mockRegistry);
  assert.strictEqual(r.has_personal_conflict, true);
  assert.strictEqual(r.fires.length, 1);
  assert.strictEqual(r.fires[0].rule, "R-Personal");
  assert.strictEqual(r.fires[0].conflict_type, "label-dispute");
  assert.strictEqual(r.fires[0].severity, "high");
  assert.strictEqual(r.fires[0].suggested_mediator, "neutral-evaluator");
  assert.deepStrictEqual(r.fires[0].parties, ["mock-a", "mock-b"]);
});

test("conflicts · 只一方在场不触发", () => {
  const mockRegistry = [{
    parties: ["mock-a", "mock-b"],
    type: "label-dispute",
    severity: "high",
  }];
  const r = checkPersonalConflict(["mock-a", "ive-wonyoung"], mockRegistry);
  assert.strictEqual(r.has_personal_conflict, false);
});

test("conflicts · case-insensitive 匹配", () => {
  const mockRegistry = [{
    parties: ["Mock-A", "MOCK-B"],
    type: "test",
    severity: "low",
  }];
  const r = checkPersonalConflict(["mock-a", "mock-b"], mockRegistry);
  assert.strictEqual(r.has_personal_conflict, true);
});

test("conflicts · 三方 conflict 召出全部 3 人", () => {
  const mockRegistry = [{
    parties: ["a", "b", "c"],
    type: "lineup-change",
    severity: "medium",
  }];
  const r = checkPersonalConflict(["a", "b", "c", "d"], mockRegistry);
  assert.strictEqual(r.has_personal_conflict, true);
  assert.deepStrictEqual(r.fires[0].parties, ["a", "b", "c"]);
});

test("conflicts · deriveFromAgentFields 从 per-agent 声明派生对称 pair", () => {
  const agents = [
    { slug: "idol-x", personal_conflict: ["idol-y"] },
    { slug: "idol-y", personal_conflict: ["idol-x"] }, // 对称声明
    { slug: "idol-z", personal_conflict: [] },
    { slug: "idol-w" }, // no field
  ];
  const derived = deriveFromAgentFields(agents);
  // 对称声明应去重为 1 条
  assert.strictEqual(derived.length, 1);
  assert.strictEqual(derived[0].type, "agent-declared");
  assert.strictEqual(derived[0].severity, "medium");
  assert.ok(derived[0].parties.includes("idol-x"));
  assert.ok(derived[0].parties.includes("idol-y"));
});

test("conflicts · derive + registry 合并使用", () => {
  const agents = [
    { slug: "idol-x", personal_conflict: ["idol-y"] },
  ];
  const derived = deriveFromAgentFields(agents);
  const r = checkPersonalConflict(["idol-x", "idol-y"], derived);
  assert.strictEqual(r.has_personal_conflict, true);
  assert.strictEqual(r.fires[0].conflict_type, "agent-declared");
});

test("label-dispute · 空 souls 不触发", () => {
  const r = checkLabelDisputeAwareness([]);
  assert.strictEqual(r.has_label_dispute, false);
});

test("label-dispute · 命中 NewJeans · 真实 registry seed", () => {
  const souls = [{ slug: "newjeans", group_slug: "newjeans" }];
  const r = checkLabelDisputeAwareness(souls);
  assert.strictEqual(r.has_label_dispute, true);
  assert.strictEqual(r.advisories.length, 1);
  assert.strictEqual(r.advisories[0].rule, "R-LabelDispute");
  assert.strictEqual(r.advisories[0].group_slug, "newjeans");
  assert.ok(r.advisories[0].advisory.length > 20);
  assert.ok(r.advisories[0].public_record.length > 0);
});

test("label-dispute · 无关团不触发", () => {
  const souls = [{ slug: "twice", group_slug: "twice" }, { slug: "aespa", group_slug: "aespa" }];
  const r = checkLabelDisputeAwareness(souls);
  assert.strictEqual(r.has_label_dispute, false);
});

test("label-dispute · LABEL_DISPUTE_ADVISORIES 至少 seed 1 例", () => {
  assert.ok(Array.isArray(LABEL_DISPUTE_ADVISORIES));
  assert.ok(LABEL_DISPUTE_ADVISORIES.length >= 1);
  for (const entry of LABEL_DISPUTE_ADVISORIES) {
    assert.ok(entry.group_slug, "每条 entry 必须有 group_slug");
    assert.ok(entry.public_record, "每条 entry 必须有 public_record (来源引用)");
    assert.ok(entry.advisory && entry.advisory.length > 30, "advisory 必须有实质内容");
  }
});
