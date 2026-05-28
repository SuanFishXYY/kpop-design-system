// engine/voice-synthesis.mjs
// v3.3.0 ? Group voice prompt synthesis and hard veto trigger checks.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function parseInlineArray(raw) {
  const m = String(raw || "").match(/^\[([\s\S]*)\]$/);
  if (!m) return [];
  return m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

function readGroupRaw(groupSlug) {
  const aliases = { blackpink: "bp", babymonster: "bm", newjeans: "nj", lesserafim: "lsf" };
  const slug = aliases[groupSlug] || groupSlug;
  return readFileSync(join(ROOT, "groups", `${slug}.md`), "utf-8");
}

export function loadVoiceTemplate(groupSlug) {
  const raw = readGroupRaw(groupSlug);
  const fm = raw.replace(/\r\n/g, "\n").match(/^---\s*\n([\s\S]+?)\n---/)?.[1] || "";
  const start = fm.split("\n").findIndex(l => /^voice:\s*$/.test(l));
  if (start < 0) return null;
  const voice = {};
  const lines = fm.split("\n").slice(start + 1);
  for (const line of lines) {
    if (/^\S/.test(line)) break;
    const kv = line.match(/^\s{2}(\w+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) value = parseInlineArray(value);
    else value = value.replace(/^["']|["']$/g, "");
    voice[kv[1]] = value;
  }
  return Object.keys(voice).length ? voice : null;
}

export function synthesizeVoice(groupSlug, scenario = {}) {
  const voice = loadVoiceTemplate(groupSlug);
  if (!voice) throw new Error(`missing voice template for ${groupSlug}`);
  const trait = scenario.trait || "core trait";
  const question = (voice.question_template || "Does this fit {trait}?").replace("{trait}", trait);
  return [
    voice.identity,
    voice.position_statement,
    `Scenario: ${scenario.brief || scenario.text || "design review"}`,
    `Ask: ${question}`,
    `Hard veto triggers: ${(voice.veto_triggers || []).join(", ")}`,
  ].filter(Boolean).join("\n");
}

export function checkVetoTriggers(groupSlug, proposalText) {
  const voice = loadVoiceTemplate(groupSlug);
  const lower = String(proposalText || "").toLowerCase();
  const triggered_keywords = (voice?.veto_triggers || []).filter(k => lower.includes(String(k).toLowerCase()));
  return { triggered: triggered_keywords.length > 0, triggered_keywords };
}
