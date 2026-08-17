#!/usr/bin/env node
// bin/mcp-server.mjs
// Lightweight stdio MCP server exposing the kpop-design-system engine as tools.

import readline from "node:readline";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import {
  assembleCouncil,
  applyUserOverrides,
  deriveCouncilId,
  explainCouncil,
  resolveMemberSlug,
} from "../engine/council-assembly.mjs";
import { orchestrateDeliberation } from "../engine/deliberation.mjs";
import { classifyClauses, tallyVote, produceVerdictDocument } from "../engine/verdict.mjs";
import { synthesizeDesignBrief } from "../engine/synthesize.mjs";
import { getReviewers } from "../engine/reviewers.mjs";
import { checkLabelDisputeAwareness, checkPersonalConflict, LABEL_DISPUTE_ADVISORIES } from "../engine/conflicts.mjs";
import { synthesizeVoice, checkVetoTriggers } from "../engine/voice-synthesis.mjs";
import { derivePersona } from "../engine/voice-persona.mjs";
import { speakInCharacter } from "../engine/speak.mjs";
import { buildHostPrompt } from "../engine/host-prompt.mjs";
import { loadIdols } from "../engine/council-assembly.mjs";
import { loadGroups } from "../engine/relations.mjs";

const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8")).version;
const MAX_HTTP_BODY_BYTES = 10 * 1024 * 1024; // 10 MiB cap for MCP HTTP requests

const TOOLS = [
  {
    name: "kpop_assemble_council",
    description: "Assemble a style-first idol council for a design brief.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Design brief text" },
        size: { type: "integer", description: "Council cap (default 5)" },
        add: { type: "array", items: { type: "string" }, description: "Force-add idol/group slugs or names" },
        veto: { type: "array", items: { type: "string" }, description: "Veto idol/group slugs or names" },
        strict_size: { type: "boolean", description: "If true, add/veto cannot push council beyond size cap" },
      },
      required: ["brief"],
    },
  },
  {
    name: "kpop_run_deliberation",
    description: "Run a full council deliberation and return a verdict document.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Design brief text" },
        size: { type: "integer", description: "Council cap (default 5)" },
        add: { type: "array", items: { type: "string" } },
        veto: { type: "array", items: { type: "string" } },
        user_vote: { type: "string", enum: ["for", "against", "abstain"], description: "User verdict (default: for)" },
        strict_size: { type: "boolean", description: "If true, add/veto cannot push council beyond size cap" },
        rebuttals: { type: "boolean", description: "Include R2b counter-rebuttals after cross-examination" },
      },
      required: ["brief"],
    },
  },
  {
    name: "kpop_generate_design_brief",
    description: "Generate a complete design brief from a short description.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Short design description" },
        format: { type: "string", enum: ["markdown", "json"], description: "Output format" },
      },
      required: ["brief"],
    },
  },
  {
    name: "kpop_review_design",
    description: "Run a panel review with default design reviewers.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Design brief text" },
      },
      required: ["brief"],
    },
  },
  {
    name: "kpop_list_roster",
    description: "List idols, groups, or the full roster.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["idols", "groups", "all"], description: "What to list" },
        limit: { type: "integer", description: "Max items per list (0 = unlimited)" },
        offset: { type: "integer", description: "Skip first N items" },
      },
      required: ["type"],
    },
  },
  {
    name: "kpop_conflicts",
    description: "Check a council for label disputes and personal conflicts.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Design brief text" },
        size: { type: "integer", description: "Council cap (default 5)" },
        add: { type: "array", items: { type: "string" } },
        veto: { type: "array", items: { type: "string" } },
        strict_size: { type: "boolean", description: "If true, add/veto cannot push council beyond size cap" },
      },
      required: ["brief"],
    },
  },
  {
    name: "kpop_synthesize_voice",
    description: "Generate a voice identity prompt for an idol or group.",
    inputSchema: {
      type: "object",
      properties: {
        member: { type: "string", description: "Idol or group slug" },
        brief: { type: "string", description: "Design brief for scenario context" },
      },
      required: ["member"],
    },
  },
  {
    name: "kpop_search_roster",
    description: "Search idols and/or groups by name, slug, or filters.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Substring to match against slug or name" },
        type: { type: "string", enum: ["idols", "groups", "all"], description: "What to search" },
        group: { type: "string", description: "Filter idols by group name/slug" },
        era: { type: "string", description: "Filter by generation era" },
        specialty: { type: "string", description: "Filter idols by ui_specialty/role substring" },
        agency: { type: "string", description: "Filter by agency" },
        aesthetic_tag: { type: "string", description: "Filter groups by aesthetic tag" },
        exact: { type: "boolean", description: "Require exact slug/name match" },
        limit: { type: "integer", description: "Max results per category" },
        offset: { type: "integer", description: "Skip first N results" },
      },
      required: ["query", "type"],
    },
  },
  {
    name: "kpop_compare_idols",
    description: "Compare two roster members (idols or groups) across identity dimensions.",
    inputSchema: {
      type: "object",
      properties: {
        left: { type: "string", description: "Slug or name of first member" },
        right: { type: "string", description: "Slug or name of second member" },
      },
      required: ["left", "right"],
    },
  },
  {
    name: "kpop_get_member_persona",
    description: "Get a deterministic speaking-persona guide for an idol or group.",
    inputSchema: {
      type: "object",
      properties: {
        member: { type: "string", description: "Idol or group slug/name" },
        brief: { type: "string", description: "Design brief for context" },
        tension: { type: "integer", minimum: 0, maximum: 10, description: "Conflict tension level (0-10)" },
      },
      required: ["member"],
    },
  },
  {
    name: "kpop_speak_in_character",
    description: "Generate a deterministic first-person speaking line for an idol or group.",
    inputSchema: {
      type: "object",
      properties: {
        member: { type: "string", description: "Idol or group slug/name" },
        brief: { type: "string", description: "Design brief for context" },
        stance: { type: "string", enum: ["agree", "reserve", "dissent"], description: "Speaking stance (default: agree)" },
        topic: { type: "string", description: "Specific topic phrase to address (default: brief)" },
        tension: { type: "integer", minimum: 0, maximum: 10, description: "Conflict tension level (0-10)" },
      },
      required: ["member"],
    },
  },
  {
    name: "kpop_build_host_prompt",
    description: "Build a host-AI system prompt for running an in-character idol council.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Design brief text" },
        size: { type: "integer", description: "Council cap (default 5)" },
        add: { type: "array", items: { type: "string" }, description: "Force-add idol/group slugs or names" },
        veto: { type: "array", items: { type: "string" }, description: "Veto idol/group slugs or names" },
        strict_size: { type: "boolean", description: "If true, add/veto cannot push council beyond size cap" },
        include_sample_lines: { type: "boolean", description: "Include agree/reserve/dissent sample lines per member" },
      },
      required: ["brief"],
    },
  },
];

function applyRequestedSize(council, size) {
  const target = Number.isInteger(size) && size >= 2 ? size : (council.max_members || 5);
  const user = council.members.find(m => m.type === "user") || { type: "user", slug: "user", name: "User", vote: 1 };
  const nonUser = council.members.filter(m => m.type !== "user").slice(0, Math.max(1, target - 1));
  return { ...council, members: [...nonUser, user], max_members: target };
}

function buildCouncil(brief, { size, add = [], veto = [], strict_size = false } = {}) {
  let council = assembleCouncil(brief);
  council = applyRequestedSize(council, size);
  council = applyUserOverrides(council, { addSlugs: add, vetoSlugs: veto, strictSize: strict_size, brief });
  if (!strict_size && council.members.length > council.max_members) {
    council = { ...council, max_members: council.members.length };
  }
  council.council_id = deriveCouncilId(brief, council.members, council.max_members);
  return council;
}

function voteFromStance(stance) {
  if (stance === "dissent") return "against";
  if (stance === "reserve") return "abstain";
  return "for";
}

function runDeliberation(brief, opts) {
  const council = buildCouncil(brief, opts);
  const deliberation = orchestrateDeliberation(council, brief, { rebuttals: opts.rebuttals });
  const userVerdict = ["for", "against", "abstain"].includes(opts.userVote) ? opts.userVote : "for";
  for (const member of council.members) {
    if (member.type === "user") {
      member.vote_decision = userVerdict;
      continue;
    }
    const stance = deliberation.rounds.R3[member.slug]?.stance || "agree";
    member.vote_decision = voteFromStance(stance);
  }
  const classified = classifyClauses(deliberation.rounds.R3);
  const tally = tallyVote(council, classified, null, false, false);
  tally.user_intervention = `user vote via MCP: ${userVerdict}`;
  const verdict = produceVerdictDocument(council, brief, classified, tally);
  return { council, deliberation, tally, verdict };
}

function formatDesignBrief(dna) {
  return [
    `# Design Brief · ${dna.brief}`,
    ``,
    `## Panel`,
    Array.isArray(dna.lineup.panel) ? dna.lineup.panel.join(", ") : String(dna.lineup.panel || ""),
    ``,
    `## Anchors`,
    Array.isArray(dna.lineup.anchors) ? dna.lineup.anchors.join(", ") : String(dna.lineup.anchors || ""),
    ``,
    `## Palette`,
    dna.palette.all_hex.join(", "),
    ``,
    `## Motion`,
    `- BPM: ${dna.motion.bpm_min}-${dna.motion.bpm_max} (avg ${dna.motion.bpm_avg})`,
    `- Hint: ${JSON.stringify(dna.motion.hint)}`,
    ``,
    `## Typography`,
    dna.typography.suggested_stack.join(", "),
    ``,
    `## Copy Tone`,
    dna.copy_tone.join(", "),
    ``,
  ].join("\n");
}

function resolveVoiceMember(slug) {
  const groups = loadGroups();
  const group = groups.find(g => g.slug.toLowerCase() === slug.toLowerCase());
  if (group) return { type: "group", slug: group.slug, name: group.name };
  const idols = loadIdols();
  const idol = idols.find(i => i.slug.toLowerCase() === slug.toLowerCase());
  if (idol) {
    const idolGroup = groups.find(g => g.name.toLowerCase() === (idol.group || "").toLowerCase());
    return { type: "idol", slug: idol.slug, name: idol.name, groupSlug: idolGroup?.slug || idol.group };
  }
  return null;
}

function resolvePersonaMember(slug) {
  const resolved = resolveMemberSlug(slug);
  if (!resolved) return null;
  if (resolved.type === "group") return { type: "group", ...resolved.member };
  return { type: "idol", ...resolved.member };
}

function normalized(str) { return String(str || "").toLowerCase(); }

function groupForMember(member) {
  if (!member || member.type === "group") return member || null;
  return loadGroups().find(g => normalized(g.name) === normalized(member.group)) || null;
}

function matchesQuery(item, query, exact) {
  const q = normalized(query);
  const name = normalized(item.name);
  const slug = normalized(item.slug);
  if (!q) return true;
  if (exact) return name === q || slug === q;
  return name.includes(q) || slug.includes(q);
}

function rankItem(item, query) {
  const q = normalized(query);
  if (!q) return 0;
  const name = normalized(item.name);
  const slug = normalized(item.slug);
  if (name === q || slug === q) return 3;
  if (name.startsWith(q) || slug.startsWith(q)) return 2;
  if (name.includes(q) || slug.includes(q)) return 1;
  return 0;
}

function eraFilter(value, filter) {
  return normalized(value || "").includes(normalized(filter));
}

function searchRoster(args) {
  const groupsMap = new Map(loadGroups().map(g => [normalized(g.name), g]));
  const limit = Number.isInteger(args.limit) && args.limit > 0 ? args.limit : Infinity;
  const offset = Number.isInteger(args.offset) && args.offset >= 0 ? args.offset : 0;
  const payload = { meta: { offset, limit: Number.isFinite(limit) ? limit : null }, totals: {} };

  const groupFilter = (g) => {
    if (args.era && !eraFilter(g.era, args.era)) return false;
    if (args.agency && !eraFilter(g.agency, args.agency)) return false;
    if (args.aesthetic_tag && !g.aesthetic_tags.some(t => normalized(t).includes(normalized(args.aesthetic_tag)))) return false;
    return true;
  };

  const idolFilter = (i) => {
    const g = groupsMap.get(normalized(i.group));
    if (args.group && !(normalized(i.group).includes(normalized(args.group)) || normalized(g?.slug).includes(normalized(args.group)))) return false;
    if (args.era && !eraFilter(i.era || g?.era, args.era)) return false;
    if (args.agency && !eraFilter(i.agency || g?.agency, args.agency)) return false;
    if (args.specialty && ![i.specialty, i.ui_specialty, i.role].some(v => normalized(v || "").includes(normalized(args.specialty)))) return false;
    return true;
  };

  if (args.type === "idols" || args.type === "all") {
    const all = loadIdols()
      .filter(i => matchesQuery(i, args.query, args.exact))
      .filter(idolFilter)
      .map(i => ({ slug: i.slug, name: i.name, group: i.group, era: i.era || groupsMap.get(normalized(i.group))?.era || "", specialty: i.ui_specialty || i.specialty || i.role || "" }))
      .sort((a, b) => rankItem(b, args.query) - rankItem(a, args.query));
    payload.totals.idols = all.length;
    payload.idols = all.slice(offset, offset + limit);
  }
  if (args.type === "groups" || args.type === "all") {
    const all = loadGroups()
      .filter(g => matchesQuery(g, args.query, args.exact))
      .filter(groupFilter)
      .map(g => ({ slug: g.slug, name: g.name, era: g.era, agency: g.agency, aesthetic_tags: g.aesthetic_tags }))
      .sort((a, b) => rankItem(b, args.query) - rankItem(a, args.query));
    payload.totals.groups = all.length;
    payload.groups = all.slice(offset, offset + limit);
  }
  return payload;
}

function compareMembers(leftSlug, rightSlug) {
  const leftRes = resolveMemberSlug(leftSlug);
  const rightRes = resolveMemberSlug(rightSlug);
  if (!leftRes) throw new Error(`Unknown member: ${leftSlug}`);
  if (!rightRes) throw new Error(`Unknown member: ${rightSlug}`);
  const left = leftRes.member;
  const right = rightRes.member;
  const leftGroup = groupForMember(left);
  const rightGroup = groupForMember(right);

  const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k] ?? null]));
  const leftProfile = left.type === "group"
    ? { ...pick(left, ["slug", "name", "type", "era", "agency", "aesthetic_tags", "rivals", "counterpoint_axis"]) }
    : { ...pick(left, ["slug", "name", "type", "group", "era", "agency", "tier", "specialty", "ui_specialty", "role", "personality", "vibe", "attitude", "rivals", "personal_conflict"]), era: left.era || leftGroup?.era || "" };
  const rightProfile = right.type === "group"
    ? { ...pick(right, ["slug", "name", "type", "era", "agency", "aesthetic_tags", "rivals", "counterpoint_axis"]) }
    : { ...pick(right, ["slug", "name", "type", "group", "era", "agency", "tier", "specialty", "ui_specialty", "role", "personality", "vibe", "attitude", "rivals", "personal_conflict"]), era: right.era || rightGroup?.era || "" };

  const leftRivals = new Set((left.rivals || []).map(normalized));
  const rightRivals = new Set((right.rivals || []).map(normalized));
  const commonRivals = [...leftRivals].filter(r => rightRivals.has(r));

  const leftTags = new Set((leftGroup?.aesthetic_tags || left.aesthetic_tags || []).map(normalized));
  const rightTags = new Set((rightGroup?.aesthetic_tags || right.aesthetic_tags || []).map(normalized));
  const commonTags = [...leftTags].filter(t => rightTags.has(t));

  const sameGroup = left.type === "idol" && right.type === "idol" && normalized(left.group) === normalized(right.group);
  const sameAgency = normalized(leftProfile.agency) && normalized(leftProfile.agency) === normalized(rightProfile.agency);
  const sameEra = normalized(leftProfile.era) && normalized(leftProfile.era) === normalized(rightProfile.era);

  let relationship = "unrelated";
  if (commonRivals.length) relationship = "rivals";
  else if (sameGroup) relationship = "same_group";
  else if (sameAgency) relationship = "same_agency";
  else if (sameEra) relationship = "same_era";

  const dimensions = ["specialty", "ui_specialty", "role", "vibe", "attitude", "personality"];
  let differences = 0;
  for (const dim of dimensions) {
    if (normalized(left[dim] || leftGroup?.[dim] || "") !== normalized(right[dim] || rightGroup?.[dim] || "")) differences++;
  }
  const styleDistance = differences / dimensions.length;

  return {
    left: leftProfile,
    right: rightProfile,
    relationship,
    same_group: sameGroup,
    same_agency: sameAgency,
    same_era: sameEra,
    common_rivals: commonRivals,
    common_aesthetic_tags: commonTags,
    style_distance: Number(styleDistance.toFixed(2)),
  };
}

function validateString(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`Invalid or missing ${field}: expected non-empty string`);
}

function validateEnum(value, field, allowed) {
  if (value !== undefined && !allowed.includes(value)) throw new Error(`Invalid ${field}: must be one of ${allowed.join(", ")}`);
}

function validateInteger(value, field, { min = -Infinity, max = Infinity } = {}) {
  if (value === undefined) return;
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid ${field}: expected integer between ${min} and ${max}`);
}

function validateStringArray(value, field) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some(v => typeof v !== "string")) throw new Error(`Invalid ${field}: expected array of strings`);
}

function validateBoolean(value, field) {
  if (value === undefined) return;
  if (typeof value !== "boolean") throw new Error(`Invalid ${field}: expected boolean`);
}

const VALIDATORS = {
  kpop_assemble_council(args) {
    validateString(args.brief, "brief");
    validateInteger(args.size, "size", { min: 2, max: 50 });
    validateStringArray(args.add, "add");
    validateStringArray(args.veto, "veto");
    validateBoolean(args.strict_size, "strict_size");
  },
  kpop_run_deliberation(args) {
    validateString(args.brief, "brief");
    validateInteger(args.size, "size", { min: 2, max: 50 });
    validateStringArray(args.add, "add");
    validateStringArray(args.veto, "veto");
    validateEnum(args.user_vote, "user_vote", ["for", "against", "abstain"]);
    validateBoolean(args.strict_size, "strict_size");
    validateBoolean(args.rebuttals, "rebuttals");
  },
  kpop_generate_design_brief(args) {
    validateString(args.brief, "brief");
    validateEnum(args.format, "format", ["markdown", "json"]);
  },
  kpop_review_design(args) {
    validateString(args.brief, "brief");
  },
  kpop_list_roster(args) {
    validateEnum(args.type, "type", ["idols", "groups", "all"]);
    validateInteger(args.limit, "limit", { min: 0, max: 10000 });
    validateInteger(args.offset, "offset", { min: 0, max: 100000 });
  },
  kpop_conflicts(args) {
    validateString(args.brief, "brief");
    validateInteger(args.size, "size", { min: 2, max: 50 });
    validateStringArray(args.add, "add");
    validateStringArray(args.veto, "veto");
    validateBoolean(args.strict_size, "strict_size");
  },
  kpop_synthesize_voice(args) {
    validateString(args.member, "member");
    if (args.brief !== undefined) validateString(args.brief, "brief");
  },
  kpop_search_roster(args) {
    if (typeof args.query !== "string") throw new Error("Invalid query: expected string");
    validateEnum(args.type, "type", ["idols", "groups", "all"]);
    validateInteger(args.limit, "limit", { min: 0, max: 10000 });
    validateInteger(args.offset, "offset", { min: 0, max: 100000 });
    validateBoolean(args.exact, "exact");
    for (const f of ["group", "era", "specialty", "agency", "aesthetic_tag"]) {
      if (args[f] !== undefined) validateString(args[f], f);
    }
  },
  kpop_compare_idols(args) {
    validateString(args.left, "left");
    validateString(args.right, "right");
  },
  kpop_get_member_persona(args) {
    validateString(args.member, "member");
    if (args.brief !== undefined) validateString(args.brief, "brief");
    validateInteger(args.tension, "tension", { min: 0, max: 10 });
  },
  kpop_speak_in_character(args) {
    validateString(args.member, "member");
    if (args.brief !== undefined) validateString(args.brief, "brief");
    if (args.topic !== undefined) validateString(args.topic, "topic");
    if (args.stance !== undefined) validateEnum(args.stance, "stance", ["agree", "reserve", "dissent"]);
    validateInteger(args.tension, "tension", { min: 0, max: 10 });
  },
  kpop_build_host_prompt(args) {
    validateString(args.brief, "brief");
    validateInteger(args.size, "size", { min: 2, max: 50 });
    validateStringArray(args.add, "add");
    validateStringArray(args.veto, "veto");
    validateBoolean(args.strict_size, "strict_size");
    validateBoolean(args.include_sample_lines, "include_sample_lines");
  },
};

const HANDLERS = {
  initialize() {
    return {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "kpop-design-system", version: VERSION },
    };
  },
  "tools/list"() {
    return { tools: TOOLS };
  },
  "tools/call"({ name, arguments: args }) {
    const validate = VALIDATORS[name];
    if (validate) validate(args || {});
    switch (name) {
      case "kpop_assemble_council": {
        const council = buildCouncil(args.brief, { size: args.size, add: args.add, veto: args.veto, strict_size: args.strict_size });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              council_id: council.council_id,
              max_members: council.max_members,
              members: council.members.map(m => ({ slug: m.slug, name: m.name, type: m.type })),
              explanations: explainCouncil(council, args.brief),
            }, null, 2),
          }],
        };
      }
      case "kpop_run_deliberation": {
        const { council, deliberation, tally, verdict } = runDeliberation(args.brief, { size: args.size, add: args.add, veto: args.veto, userVote: args.user_vote, strict_size: args.strict_size, rebuttals: args.rebuttals });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              council_id: council.council_id,
              members: council.members.map(m => ({ slug: m.slug, name: m.name, type: m.type, vote_decision: m.vote_decision })),
              deliberation: { mode: deliberation.mode, rounds: deliberation.rounds },
              tally,
              verdict,
            }, null, 2),
          }],
        };
      }
      case "kpop_generate_design_brief": {
        const dna = synthesizeDesignBrief(args.brief);
        const format = args.format === "json" ? "json" : "markdown";
        const text = format === "json"
          ? JSON.stringify(dna, null, 2)
          : formatDesignBrief(dna);
        return { content: [{ type: "text", text }] };
      }
      case "kpop_review_design": {
        const reviewers = getReviewers(args.brief);
        const forCount = reviewers.filter(r => r.verdict === "pass").length;
        const againstCount = reviewers.filter(r => r.verdict === "reject").length;
        const abstainCount = reviewers.filter(r => r.verdict === "abstain").length;
        const result = forCount > againstCount ? "pass" : againstCount > forCount ? "reject" : "abstain";
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ reviewers, for: forCount, against: againstCount, abstain: abstainCount, result }, null, 2),
          }],
        };
      }
      case "kpop_list_roster": {
        const limit = Number.isInteger(args.limit) && args.limit > 0 ? args.limit : Infinity;
        const offset = Number.isInteger(args.offset) && args.offset >= 0 ? args.offset : 0;
        const slice = arr => arr.slice(offset, offset + limit);
        const payload = {
          meta: { offset, limit: Number.isFinite(limit) ? limit : null },
          totals: {},
        };
        if (args.type === "idols" || args.type === "all") {
          const all = loadIdols().map(i => ({ slug: i.slug, name: i.name, group: i.group }));
          payload.totals.idols = all.length;
          payload.idols = slice(all);
        }
        if (args.type === "groups" || args.type === "all") {
          const all = loadGroups().map(g => ({ slug: g.slug, name: g.name, era: g.era }));
          payload.totals.groups = all.length;
          payload.groups = slice(all);
        }
        return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
      }
      case "kpop_conflicts": {
        const council = buildCouncil(args.brief, { size: args.size, add: args.add, veto: args.veto, strict_size: args.strict_size });
        const groupsByName = new Map(loadGroups().map(g => [g.name.toLowerCase(), g.slug]));
        function memberGroupSlug(m) {
          if (m.type === "group") return groupsByName.get((m.name || "").toLowerCase()) || m.slug;
          return groupsByName.get((m.group || "").toLowerCase()) || m.group || m.slug;
        }
        const souls = council.members.map(m => ({ slug: m.slug, group_slug: memberGroupSlug(m) }));
        // Normalize group slugs to the keys used by conflict advisories.
        const advisoryGroupKeys = new Map();
        for (const adv of LABEL_DISPUTE_ADVISORIES) {
          const g = loadGroups().find(gg => gg.slug.toLowerCase() === adv.group_slug.toLowerCase() || gg.name.toLowerCase() === adv.group_slug.toLowerCase());
          if (g) {
            advisoryGroupKeys.set(g.slug.toLowerCase(), adv.group_slug);
            advisoryGroupKeys.set(g.name.toLowerCase(), adv.group_slug);
          }
        }
        for (const soul of souls) {
          const key = (soul.group_slug || "").toLowerCase();
          if (advisoryGroupKeys.has(key)) soul.group_slug = advisoryGroupKeys.get(key);
        }
        const label = checkLabelDisputeAwareness(souls);
        const expandedSlugs = [];
        for (const m of council.members) {
          expandedSlugs.push(m.slug);
          if (m.type === "group") {
            const gname = (m.name || "").toLowerCase();
            expandedSlugs.push(...loadIdols().filter(i => (i.group || "").toLowerCase() === gname).map(i => i.slug));
          }
        }
        const personal = checkPersonalConflict(expandedSlugs);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              council_id: council.council_id,
              members: council.members.map(m => ({ slug: m.slug, name: m.name, type: m.type })),
              label_dispute: label,
              personal_conflict: personal,
            }, null, 2),
          }],
        };
      }
      case "kpop_synthesize_voice": {
        const resolved = resolveVoiceMember(args.member);
        if (!resolved) throw new Error(`Unknown member: ${args.member}`);
        const groupSlug = resolved.type === "group" ? resolved.slug : resolved.groupSlug;
        if (!groupSlug) throw new Error(`No group voice template for ${args.member}`);
        const voiceText = synthesizeVoice(groupSlug, { trait: resolved.type === "idol" ? resolved.name : "group voice", brief: args.brief || "design review" });
        const veto = args.brief ? checkVetoTriggers(groupSlug, args.brief) : { triggered: false, triggered_keywords: [] };
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ member: args.member, resolved, voice: voiceText, veto_triggers: veto }, null, 2),
          }],
        };
      }
      case "kpop_search_roster": {
        const payload = searchRoster(args);
        return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
      }
      case "kpop_compare_idols": {
        const comparison = compareMembers(args.left, args.right);
        return { content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }] };
      }
      case "kpop_get_member_persona": {
        const resolved = resolvePersonaMember(args.member);
        if (!resolved) throw new Error(`Unknown member: ${args.member}`);
        const persona = derivePersona(resolved, args.brief || "", { tension: args.tension });
        return { content: [{ type: "text", text: JSON.stringify(persona, null, 2) }] };
      }
      case "kpop_speak_in_character": {
        const resolved = resolvePersonaMember(args.member);
        if (!resolved) throw new Error(`Unknown member: ${args.member}`);
        const persona = derivePersona(resolved, args.brief || "", { tension: args.tension });
        const line = speakInCharacter(persona, {
          topic: args.topic || args.brief || "这个方案",
          stance: args.stance || "agree",
        });
        return { content: [{ type: "text", text: JSON.stringify({ member: args.member, tone: persona.tone, stance: args.stance || "agree", line, persona }, null, 2) }] };
      }
      case "kpop_build_host_prompt": {
        const council = buildCouncil(args.brief, { size: args.size, add: args.add, veto: args.veto, strict_size: args.strict_size });
        const prompt = buildHostPrompt(council, {
          brief: args.brief,
          includeSampleLines: args.include_sample_lines,
        });
        return { content: [{ type: "text", text: JSON.stringify({ council_id: council.council_id, members: council.members.map(m => ({ slug: m.slug, name: m.name, type: m.type })), prompt }, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  },
};

function processRequest(request, sendResponse) {
  let parsed;
  try {
    parsed = JSON.parse(request);
  } catch {
    sendResponse({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null });
    return;
  }

  const { id, method, params } = parsed;
  const handler = HANDLERS[method];

  if (!handler) {
    if (id !== undefined) {
      sendResponse({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
    }
    return;
  }

  try {
    const result = handler(params || {});
    if (id !== undefined) {
      sendResponse({ jsonrpc: "2.0", id, result });
    }
  } catch (err) {
    if (id !== undefined) {
      sendResponse({ jsonrpc: "2.0", id, error: { code: -32603, message: err.message } });
    }
  }
}

function runStdioTransport() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on("line", line => processRequest(line, msg => process.stdout.write(JSON.stringify(msg) + "\n")));
}

function runHttpTransport(port, host) {
  const sessions = new Map();

  function sendToSession(sessionId, message) {
    const session = sessions.get(sessionId);
    if (!session || session.ended) return false;
    session.res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
    return true;
  }

  function closeSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.ended = true;
    try { session.res.end(); } catch {}
    sessions.delete(sessionId);
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);

    if (req.method === "GET" && url.pathname === "/sse") {
      const sessionId = randomUUID();
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      const endpoint = `${url.origin}/messages?sessionId=${sessionId}`;
      res.write(`event: endpoint\ndata: ${endpoint}\n\n`);
      sessions.set(sessionId, { res, ended: false });
      req.on("close", () => closeSession(sessionId));
      req.on("error", () => closeSession(sessionId));
      return;
    }

    if (req.method === "POST" && url.pathname === "/messages") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Session not found" }));
        return;
      }
      let body = "";
      let bodyBytes = 0;
      req.setEncoding("utf8");
      req.on("data", chunk => {
        body += chunk;
        bodyBytes += Buffer.byteLength(chunk, "utf8");
        if (bodyBytes > MAX_HTTP_BODY_BYTES) {
          res.writeHead(413, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({ error: "Request body exceeds 10 MiB limit" }));
          req.destroy();
        }
      });
      req.on("end", () => {
        if (req.destroyed) return;
        processRequest(body, msg => sendToSession(sessionId, msg));
        res.writeHead(202, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ status: "accepted" }));
      });
      return;
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(port, host, () => {
    console.error(`kpop MCP HTTP server listening on http://${host}:${port}`);
  });
}

const { values } = parseArgs({
  options: {
    transport: { type: "string", default: "stdio" },
    port: { type: "string", default: "3000" },
    host: { type: "string", default: "127.0.0.1" },
  },
});

if (values.transport === "http") {
  runHttpTransport(Number(values.port) || 3000, values.host);
} else {
  runStdioTransport();
}
