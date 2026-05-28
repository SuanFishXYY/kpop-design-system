#!/usr/bin/env node
// examples/conflicts-demo.mjs
// Concrete demo for engine/conflicts.mjs advisory checks.

import { checkLabelDisputeAwareness, checkPersonalConflict, deriveFromAgentFields } from "../engine/conflicts.mjs";

const councilSouls = [
  { slug: "newjeans", group_slug: "newjeans" },
  { slug: "ive", group_slug: "ive" },
];

const labelAwareness = checkLabelDisputeAwareness(councilSouls);
console.log("=== Label dispute awareness ===");
console.log(`has_label_dispute: ${labelAwareness.has_label_dispute}`);
for (const advisory of labelAwareness.advisories) {
  console.log(`- ${advisory.group_slug}: ${advisory.status}`);
  console.log(`  mediator: ${advisory.suggested_mediator}`);
  console.log(`  advisory: ${advisory.advisory.slice(0, 140)}...`);
}

const agents = [
  { slug: "creative-director-a", personal_conflict: ["brand-owner-b"] },
  { slug: "brand-owner-b", personal_conflict: ["creative-director-a"] },
  { slug: "neutral-evaluator" },
];
const derivedRegistry = deriveFromAgentFields(agents);
const personal = checkPersonalConflict(agents.map(agent => agent.slug), derivedRegistry);

console.log("\n=== Agent-declared conflict ===");
console.log(`has_personal_conflict: ${personal.has_personal_conflict}`);
for (const fire of personal.fires) {
  console.log(`- ${fire.rule}: ${fire.parties.join(" vs ")} (${fire.conflict_type})`);
  console.log(`  advisory: ${fire.advisory}`);
}
