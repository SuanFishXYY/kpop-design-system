// engine/synthesize.test.mjs
// Tests for design-brief synthesis helpers.

import { test } from "node:test";
import assert from "node:assert";
import { aggregatePerformerDNA, getPerformersBySpecialty, synthesizeDesignBrief } from "./synthesize.mjs";

test("aggregatePerformerDNA groups invited performers by specialty tags", () => {
  const council = {
    invited: [
      { slug: "x", name: "X", group: "g1", ui_specialty: "typography", personality: "bold", layer: 1, weight: 1 },
      { slug: "y", name: "Y", group: "g2", ui_specialty: "palette", personality: "soft", layer: 2, weight: 1 },
      { slug: "z", name: "Z", group: "g1", ui_specialty: "typography", personality: "edgy", layer: 1, weight: 1 },
    ],
  };
  const dna = aggregatePerformerDNA(council);
  assert.equal(dna.total, 3);
  assert.ok(dna.specialty_coverage.includes("typography"));
  assert.ok(dna.specialty_coverage.includes("palette"));
  assert.equal(dna.by_specialty.typography.length, 2);
  assert.equal(dna.by_specialty.palette.length, 1);
  assert.equal(dna.dna_list[0].slug, "x");
});

test("aggregatePerformerDNA handles empty invited list", () => {
  const dna = aggregatePerformerDNA({ invited: [] });
  assert.equal(dna.total, 0);
  assert.deepStrictEqual(dna.specialty_coverage, []);
  assert.deepStrictEqual(dna.by_specialty, {});
});

test("getPerformersBySpecialty returns capped matches", () => {
  const council = {
    invited: [
      { slug: "a", name: "A", group: "g", ui_specialty: "motion", layer: 1, weight: 1 },
      { slug: "b", name: "B", group: "g", ui_specialty: "motion", layer: 1, weight: 1 },
      { slug: "c", name: "C", group: "g", ui_specialty: "motion", layer: 1, weight: 1 },
    ],
  };
  const matches = getPerformersBySpecialty(council, "motion", 2);
  assert.equal(matches.length, 2);
  assert.equal(matches[0].slug, "a");
});

test("synthesizeDesignBrief returns a structured brief object", () => {
  const result = synthesizeDesignBrief("futuristic aespa dashboard");
  assert.equal(result.brief, "futuristic aespa dashboard");
  assert.ok(result.lineup);
  assert.ok(result.palette);
  assert.ok(result.mood);
  assert.ok(result.motion);
  assert.ok(result.typography);
  assert.ok(result.copy_tone);
  assert.ok(result.constraints);
  assert.ok(result.audience);
  assert.ok(result.signals);
  assert.ok(result.anchor_dna);
  assert.ok(result.performer_dna);
});
