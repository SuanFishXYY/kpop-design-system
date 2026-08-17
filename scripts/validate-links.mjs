// scripts/validate-links.mjs
// Validates cross-references between agents, groups, and judges markdown files.
// No external dependencies.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AGENTS_DIR = join(ROOT, "agents");
const GROUPS_DIR = join(ROOT, "groups");
const JUDGES_DIR = join(ROOT, "judges");
const REPORTS_DIR = join(ROOT, "reports");

function listBasenames(dir) {
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith(".md"))
      .map(f => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

function parseArray(value) {
  const m = String(value || "").trim().match(/^\[([\s\S]*)\]/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map(s => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function parseFrontmatter(raw) {
  const match = raw.replace(/\r\n/g, "\n").match(/^---\s*\n([\s\S]+?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) value = parseArray(value);
    else value = value.replace(/^["']|["']$/g, "");
    fm[kv[1]] = value;
  }
  return fm;
}

function getBody(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\s*\n([\s\S]+?)\n---/);
  return match ? normalized.slice(match[0].length) : normalized;
}

function extractBodyRelatedIdols(body) {
  const inline = body.match(/\*\*关联 idol\*\*:\s*\[([^\]]*)\]/);
  if (inline) {
    return inline[1]
      .split(",")
      .map(s => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  // Also support a markdown list immediately following `**关联 idol**:`.
  const listMatch = body.match(/\*\*关联 idol\*\*:\s*\n((?:\s*[-*]\s+.+\n?)+)/);
  if (listMatch) {
    return listMatch[1]
      .split("\n")
      .map(line => line.replace(/^\s*[-*]\s+/, "").trim())
      .filter(Boolean);
  }

  return [];
}

function validateField(filePath, fm, field, targetSet, typeLabel, dead, warnings) {
  const rawValue = fm[field];
  if (rawValue === undefined) return;
  const values = Array.isArray(rawValue) ? rawValue : parseArray(rawValue);
  if (!Array.isArray(rawValue) && String(rawValue || "").trim().startsWith("[")) {
    // Parsed successfully from string representation.
  } else if (!Array.isArray(rawValue) && String(rawValue || "").trim() !== "") {
    warnings.push({
      file: filePath,
      field,
      slug: String(rawValue),
      expected: typeLabel,
      reason: "unexpected scalar value for list field",
    });
    return;
  }
  for (const slug of values) {
    if (!targetSet.has(slug)) {
      dead.push({
        file: filePath,
        field,
        slug,
        expected: typeLabel,
      });
    }
  }
}

function main() {
  const agentSlugs = new Set(listBasenames(AGENTS_DIR));
  const groupSlugs = new Set(listBasenames(GROUPS_DIR));
  const judgeSlugs = new Set(listBasenames(JUDGES_DIR));

  const dead = [];
  const warnings = [];

  // Validate agents
  for (const file of readdirSync(AGENTS_DIR).filter(f => f.endsWith(".md"))) {
    const filePath = join("agents", file);
    const raw = readFileSync(join(AGENTS_DIR, file), "utf-8");
    const fm = parseFrontmatter(raw);
    validateField(filePath, fm, "invited_helpers", agentSlugs, "agents/*.md", dead, warnings);
    validateField(filePath, fm, "related_idols", agentSlugs, "agents/*.md", dead, warnings);
    validateField(filePath, fm, "rivals", groupSlugs, "groups/*.md", dead, warnings);

    const bodyRelated = extractBodyRelatedIdols(getBody(raw));
    for (const slug of bodyRelated) {
      if (!agentSlugs.has(slug)) {
        dead.push({
          file: filePath,
          field: "body 关联 idol",
          slug,
          expected: "agents/*.md",
        });
      }
    }
  }

  // Validate groups
  for (const file of readdirSync(GROUPS_DIR).filter(f => f.endsWith(".md"))) {
    const filePath = join("groups", file);
    const raw = readFileSync(join(GROUPS_DIR, file), "utf-8");
    const fm = parseFrontmatter(raw);
    validateField(filePath, fm, "rivals", groupSlugs, "groups/*.md", dead, warnings);
    validateField(filePath, fm, "fusion_compatible", groupSlugs, "groups/*.md", dead, warnings);
  }

  // Validate judges
  for (const file of readdirSync(JUDGES_DIR).filter(f => f.endsWith(".md"))) {
    const filePath = join("judges", file);
    const raw = readFileSync(join(JUDGES_DIR, file), "utf-8");
    const fm = parseFrontmatter(raw);
    validateField(filePath, fm, "portfolio", groupSlugs, "groups/*.md", dead, warnings);
    validateField(filePath, fm, "inter_label_tension", judgeSlugs, "judges/*.md", dead, warnings);
  }

  const summary = {
    agents: agentSlugs.size,
    groups: groupSlugs.size,
    judges: judgeSlugs.size,
    dead: dead.length,
    warnings: warnings.length,
  };

  mkdirSync(REPORTS_DIR, { recursive: true });

  const json = { summary, dead, warnings };
  writeFileSync(join(REPORTS_DIR, "link-validation.json"), JSON.stringify(json, null, 2), "utf-8");

  const md = [`# Link Validation Report

Generated by \`scripts/validate-links.mjs\`.

## Summary

| Metric | Value |
|--------|-------|
| Agents | ${summary.agents} |
| Groups | ${summary.groups} |
| Judges | ${summary.judges} |
| Dead links | ${summary.dead} |
| Warnings | ${summary.warnings} |
`];

  if (dead.length) {
    md.push(`\n## Dead links\n\n| File | Field | Slug | Expected target |\n|------|-------|------|-----------------|\n`);
    for (const d of dead) {
      md.push(`| ${d.file} | ${d.field} | ${d.slug} | ${d.expected} |\n`);
    }
  }

  if (warnings.length) {
    md.push(`\n## Warnings\n\n| File | Field | Value | Reason |\n|------|-------|-------|--------|\n`);
    for (const w of warnings) {
      md.push(`| ${w.file} | ${w.field} | ${w.slug} | ${w.reason} |\n`);
    }
  }

  if (!dead.length && !warnings.length) {
    md.push(`\n✅ No dead links or warnings found.\n`);
  }

  writeFileSync(join(REPORTS_DIR, "link-validation.md"), md.join(""), "utf-8");

  console.log(`Agents: ${summary.agents}, Groups: ${summary.groups}, Judges: ${summary.judges}`);
  console.log(`Dead links: ${summary.dead}, Warnings: ${summary.warnings}`);
  console.log(`Wrote reports/link-validation.md and reports/link-validation.json`);

  if (dead.length) {
    process.exitCode = 1;
  }
}

main();
