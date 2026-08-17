// engine/reviewers.mjs
// v3.5.0+ · Brief-aware design-review panel.
// Each reviewer is a callable lens: { name, opinion, verdict, specialties }.
// The panel is reordered (and can be extended) based on the brief's design dimensions.

import { classifyBriefSpecialties } from "./specialty.mjs";

export const DEFAULT_REVIEWERS = [
  {
    name: "color-strategist",
    opinion: "Palette must stay era-locked, not merely pretty.",
    verdict: "pass",
    specialties: ["color", "palette", "era", "visual"],
  },
  {
    name: "motion-director",
    opinion: "Motion rhythm should follow comeback stage, not generic UI tempo.",
    verdict: "pass",
    specialties: ["motion", "animation", "stage", "tempo"],
  },
  {
    name: "typography-curator",
    opinion: "Type hierarchy needs one stronger headline grade.",
    verdict: "abstain",
    specialties: ["typography", "type", "hierarchy", "layout"],
  },
  {
    name: "generation-librarian",
    opinion: "Era references must be generation-accurate to avoid dilution.",
    verdict: "pass",
    specialties: ["era", "generation", "nostalgia", "reference"],
  },
  {
    name: "copy-tone-director",
    opinion: "Tone should match the idol concept, not generic marketing speak.",
    verdict: "pass",
    specialties: ["copy", "tone", "voice", "slogan"],
  },
];

function scoreReviewer(reviewer, briefSpecialties) {
  const set = new Set(briefSpecialties);
  return reviewer.specialties.reduce((sum, s) => sum + (set.has(s) ? 1 : 0), 0);
}

/**
 * Return the reviewer list for a given brief.
 * Reviewers are scored by how many of their specialties appear in the brief,
 * then sorted by score (highest first). The full panel is preserved so the
 * caller still sees a balanced review; ordering puts the most relevant lenses
 * first.
 */
export function getReviewers(brief, _opts = {}) {
  const briefSpecialties = classifyBriefSpecialties(brief);
  const scored = DEFAULT_REVIEWERS.map(r => ({ ...r, score: scoreReviewer(r, briefSpecialties) }));
  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return scored.map(({ score, ...r }) => r);
}
