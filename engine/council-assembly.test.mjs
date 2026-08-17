
import { test } from "node:test";
import assert from "node:assert";
import { assembleCouncil, determineDRI, applyUserOverrides, resolveMemberSlug, deriveCouncilId } from "./council-assembly.mjs";
import { classifyIdolSpecialty } from "./specialty.mjs";

test("basic expansion starts from group DRI and invites sister groups", () => {
  const council = assembleCouncil("IVE comeback landing");
  assert.equal(determineDRI("IVE comeback").slug, "ive");
  assert(council.members.some(m => m.slug === "ive"));
  assert(council.invitation_chain.some(i => i.from === "ive" && i.to !== "ive"));
});

test("default council enforces 5-member cap", () => {
  const council = assembleCouncil("IVE comeback landing");
  assert(council.members.length <= 5);
  assert.equal(council.max_members, 5);
});

test("cross-generation or cross-agency brief upgrades cap to 7", () => {
  const council = assembleCouncil("IVE aespa TWICE cross-gen HYBE SM YG agency comeback");
  assert.equal(council.max_members, 7);
  assert(council.members.length <= 7);
});

test("council with four or more members keeps at least two idols and two groups", () => {
  const council = assembleCouncil("IVE comeback landing");
  const groups = council.members.filter(m => m.type === "group").length;
  const idols = council.members.filter(m => m.type === "idol").length;
  assert(council.members.length >= 4);
  assert(groups >= 2, `groups=${groups}`);
  assert(idols >= 2, `idols=${idols}`);
});

test("cycle defense prevents duplicate members during BFS", () => {
  const council = assembleCouncil("IVE aespa rivalry council");
  const keys = council.members.map(m => `${m.type}:${m.slug}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("style-first summons idols without explicit name mention", () => {
  const council = assembleCouncil("typography and motion landing page");
  const idolSlugs = council.members.filter(m => m.type === "idol").map(m => m.slug);
  assert(idolSlugs.length >= 2, `expected at least 2 style idols, got ${idolSlugs.length}`);
  assert(council.invitation_chain.some(i => i.reason === "style match"));
});

test("style matching coexists with group mention", () => {
  const council = assembleCouncil("IVE comeback motion typography");
  assert(council.members.some(m => m.slug === "ive"));
  const styleReasons = council.invitation_chain.filter(i => i.reason === "style match");
  assert(styleReasons.length >= 1, "expected at least one style-matched idol");
});

test("name-assisted recall still works for explicitly mentioned idols", () => {
  const council = assembleCouncil("Karina typography clean layout");
  assert(council.members.some(m => m.slug === "aespa-karina"));
});

test("style-first council still satisfies mix quotas", () => {
  const council = assembleCouncil("bold color palette and hero banner");
  const groups = council.members.filter(m => m.type === "group").length;
  const idols = council.members.filter(m => m.type === "idol").length;
  assert(groups >= 2, `groups=${groups}`);
  assert(idols >= 2, `idols=${idols}`);
});

test("style selection covers multiple design dimensions from brief", () => {
  const council = assembleCouncil("typography and motion landing page");
  const idolSpecs = council.members
    .filter(m => m.type === "idol")
    .flatMap(i => classifyIdolSpecialty(i));
  assert(idolSpecs.includes("typography"), `missing typography in ${idolSpecs.join(",")}`);
  assert(idolSpecs.includes("motion"), `missing motion in ${idolSpecs.join(",")}`);
});

test("rival groups are not summoned together unless conflict is requested", () => {
  const council = assembleCouncil("aespa comeback futuristic landing");
  const groupSlugs = council.members.filter(m => m.type === "group").map(m => m.slug);
  assert(!groupSlugs.includes("ive"), `unexpected rival group ive in ${groupSlugs.join(",")}`);
  assert(!groupSlugs.includes("rv"), `unexpected rival group rv in ${groupSlugs.join(",")}`);
});

test("conflict keyword allows rival groups to coexist", () => {
  const council = assembleCouncil("aespa vs IVE battle landing page");
  const groupSlugs = council.members.filter(m => m.type === "group").map(m => m.slug);
  assert(groupSlugs.includes("aespa"), "expected aespa");
  assert(groupSlugs.includes("ive"), "expected ive when conflict keyword is present");
});

test("agency cap prevents a single label from dominating the council", () => {
  const council = assembleCouncil("LE SSERAFIM NewJeans ILLIT collaboration");
  // HYBE umbrella (Source / ADOR / Belift / Pledis) treated as one parent for cap
  const hybeAgencies = new Set(["ADOR", "Belift", "Source", "Pledis", "HYBE"]);
  const hybeCount = council.members.filter(m => hybeAgencies.has(m.agency)).length;
  assert(hybeCount <= 3, `HYBE umbrella members capped at 3, got ${hybeCount}`);
});

test("resolveMemberSlug matches exact slug, name, and partial tokens", () => {
  assert.equal(resolveMemberSlug("aespa-karina")?.member?.slug, "aespa-karina");
  assert.equal(resolveMemberSlug("Karina")?.member?.slug, "aespa-karina");
  assert.equal(resolveMemberSlug("karina")?.member?.slug, "aespa-karina");
  assert.equal(resolveMemberSlug("IVE")?.member?.slug, "ive");
  assert.equal(resolveMemberSlug("blackpink")?.member?.slug, "bp");
  assert.equal(resolveMemberSlug("no-such-idol"), null);
});

test("applyUserOverrides can add idols/groups by fuzzy name and veto by slug", () => {
  const council = assembleCouncil("typography landing page");
  const withOverrides = applyUserOverrides(council, { addSlugs: ["Karina", "IVE"], vetoSlugs: ["rv"] });
  assert(withOverrides.members.some(m => m.slug === "aespa-karina"), "expected Karina added");
  assert(withOverrides.members.some(m => m.slug === "ive"), "expected IVE group added");
  assert(!withOverrides.members.some(m => m.slug === "rv"), "expected rv vetoed");
  assert(withOverrides.members.some(m => m.type === "user"), "user seat preserved");
});

test("deriveCouncilId is deterministic for the same brief and members", () => {
  const council = assembleCouncil("IVE comeback landing");
  const id1 = deriveCouncilId("IVE comeback landing", council.members, council.max_members);
  const id2 = deriveCouncilId("IVE comeback landing", council.members, council.max_members);
  assert.equal(id1, id2);
  assert.match(id1, /^mixed-[a-f0-9]{10}$/);
});

test("different briefs produce different council ids", () => {
  const a = assembleCouncil("IVE comeback landing");
  const b = assembleCouncil("aespa futuristic dashboard");
  assert.notEqual(a.council_id, b.council_id);
});

test("applyUserOverrides strictSize trims added members to respect cap", () => {
  const council = assembleCouncil("IVE comeback landing");
  const withOverrides = applyUserOverrides(council, { addSlugs: ["Karina", "Winter", "Jimin"], strictSize: true });
  assert.equal(withOverrides.members.length, withOverrides.max_members);
  assert(withOverrides.members.some(m => m.type === "user"), "user seat preserved");
});

test("applyUserOverrides strictSize trims lowest-relevance members", () => {
  const brief = "IVE comeback landing";
  const council = assembleCouncil(brief);
  const withOverrides = applyUserOverrides(council, { addSlugs: ["Karina", "Winter"], strictSize: true, brief });
  assert.equal(withOverrides.members.length, council.max_members);
  assert(withOverrides.members.some(m => m.slug === "aespa-karina"), "user-added Karina preserved");
  assert(withOverrides.members.some(m => m.slug === "aespa-winter"), "user-added Winter preserved");
  assert(withOverrides.members.some(m => m.slug === "ive"), "seed group IVE preserved over low-relevance fillers");
});

test("council assembly tries to include multiple generations when roster allows", () => {
  const council = assembleCouncil("bold color palette and hero banner");
  const eras = new Set(council.members.filter(m => m.type !== "user").map(m => m.era || "").filter(Boolean));
  assert(eras.size >= 1, "expected at least one identifiable generation");
});
