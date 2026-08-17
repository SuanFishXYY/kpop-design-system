import { test } from "node:test";
import assert from "node:assert";
import { classifyBriefSpecialties, classifyIdolSpecialty, scoreIdolForBrief, rankIdolsByBrief, SPECIALTY_LABELS } from "./specialty.mjs";

test("classifyBriefSpecialties detects design dimensions", () => {
  const specs = classifyBriefSpecialties("landing page typography and spring motion");
  assert(specs.includes("typography"));
  assert(specs.includes("motion"));
  assert(specs.includes("hero"));
});

test("classifyIdolSpecialty falls back to general when no keyword matches", () => {
  const idol = { ui_specialty: "unknown magic", personality: "", vibe: "", attitude: "" };
  assert.deepEqual(classifyIdolSpecialty(idol), ["general"]);
});

test("scoreIdolForBrief includes tier bonus for tier-0 idols", () => {
  const idol = { tier: 0, ui_specialty: "typography", personality: "", vibe: "", attitude: "" };
  const result = scoreIdolForBrief(idol, ["typography"]);
  assert.equal(result.score, 1.5);
  assert.deepEqual(result.matches, ["typography"]);
});

test("rankIdolsByBrief returns only idols with positive scores", () => {
  const idols = [
    { slug: "a", tier: 1, ui_specialty: "typography", personality: "", vibe: "", attitude: "" },
    { slug: "b", tier: 1, ui_specialty: "farming", personality: "", vibe: "", attitude: "" },
  ];
  const ranked = rankIdolsByBrief(idols, "typography system");
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].idol.slug, "a");
});

test("rankIdolsByBrief tie-breaks by tier and slug", () => {
  const idols = [
    { slug: "b", tier: 1, ui_specialty: "typography", personality: "", vibe: "", attitude: "" },
    { slug: "a", tier: 0, ui_specialty: "typography", personality: "", vibe: "", attitude: "" },
  ];
  const ranked = rankIdolsByBrief(idols, "typography");
  assert.equal(ranked[0].idol.slug, "a");
  assert.equal(ranked[1].idol.slug, "b");
});

test("SPECIALTY_LABELS covers ten design dimensions", () => {
  assert.equal(SPECIALTY_LABELS.length, 10);
});
