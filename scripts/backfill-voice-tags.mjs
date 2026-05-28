// scripts/backfill-voice-tags.mjs
// v3.3.1 · Backfill group voice templates + aesthetic_tags from existing frontmatter.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GROUPS = join(ROOT, "groups");

function parseInlineArray(value = "") {
  const m = String(value).trim().match(/^\[([\s\S]*)\]$/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map(s => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function unquote(value = "") {
  let v = String(value).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

function parseFrontmatter(fmText) {
  const fm = {};
  const forbidden = [];
  const trackMoods = [];
  for (const line of fmText.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      const [, key, rawValue] = kv;
      if (rawValue.trim().startsWith("[") && rawValue.trim().endsWith("]")) fm[key] = parseInlineArray(rawValue);
      else fm[key] = unquote(rawValue);
    }

    const forbiddenMatch = line.match(/^\s*forbidden:\s*(\[[^\]]*\])/);
    if (forbiddenMatch) forbidden.push(...parseInlineArray(forbiddenMatch[1]));

    const moodMatch = line.match(/mood:\s*"([^"]+)"/);
    if (moodMatch) trackMoods.push(...moodMatch[1].split(",").map(s => s.trim()).filter(Boolean));
  }
  fm.__forbidden = [...new Set(forbidden)];
  fm.__trackMoods = [...new Set(trackMoods)];
  return fm;
}

function slugifyTag(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/\+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function addTag(tags, tag) {
  const t = slugifyTag(tag);
  if (!t) return;
  if (!tags.includes(t)) tags.push(t);
}

const tagOverrides = {
  kara: ["retro", "disco", "2nd-gen-classic", "fierce"],
  apink: ["pure", "candy-pop", "sweet", "schoolgirl"],
  bravegirls: ["mature", "disco", "comeback-energy"],
};

function inferTags(fm) {
  const slug = fm.group_slug || "";
  if (tagOverrides[slug]) return tagOverrides[slug];

  const tags = [];
  const core = `${fm.core_aesthetic || ""}`.toLowerCase();
  const moods = Array.isArray(fm.mood_keywords) ? fm.mood_keywords : [];
  const tracks = fm.__trackMoods || [];
  const haystack = `${core} ${moods.join(" ")} ${tracks.join(" ")}`.toLowerCase();

  const mappings = [
    [/公主|princess|royal|majestic/, "princess"],
    [/暗黑|dark|nightmare|witch|goth|black/, "dark-glam"],
    [/甜|可爱|cute|sweet|candy/, "candy-pop"],
    [/纯爱|治愈|innocent|pure|healing|fairy/, "pure"],
    [/复古|retro|disco|nobody|roly|swing/, "retro"],
    [/disco/, "disco"],
    [/赛博|cyber|sci-fi|metaverse|ai|electronic|edm/, "cyber"],
    [/y2k/, "y2k"],
    [/校园|school|teen|girl-next-door|fresh/, "school"],
    [/sport|体育|athletic/, "sporty"],
    [/fierce|sharp|swag|girl-crush|bold|hardcore|powerful|confident/, "fierce"],
    [/sexy|sensual|mature/, "mature"],
    [/lux|luxe|奢华|prestige/, "luxe-edge"],
    [/cinema|cinematic|narrative|drama|theatrical/, "cinematic"],
    [/natural|clean|minimal|邻家|sunny/, "natural"],
    [/vocal|soul|r&b|r-and-b/, "r-and-b"],
    [/global|multi|跨文化|多国籍/, "global"],
    [/summer|海边|rainbow/, "summer"],
    [/cosmic|宇宙|moon|月/, "cosmic"],
    [/hip-hop|trap|raw/, "hip-hop"],
  ];
  for (const [pattern, tag] of mappings) if (pattern.test(haystack)) addTag(tags, tag);

  for (const mood of [...moods, ...tracks]) {
    if (tags.length >= 5) break;
    addTag(tags, mood);
  }

  const era = fm.era || "";
  if (tags.length < 3) {
    if (/5/.test(era)) addTag(tags, "dystopian");
    else if (/4/.test(era)) addTag(tags, /cyber|ai|metaverse/.test(haystack) ? "cyber" : "minimal");
    else if (/3/.test(era)) addTag(tags, "y2k-light");
    else if (/2/.test(era)) addTag(tags, "2nd-gen-classic");
  }
  if (tags.length < 3) addTag(tags, "k-pop-core");
  if (tags.length < 3) addTag(tags, "group-signature");
  return tags.slice(0, 5);
}

function descriptor(fm) {
  const core = String(fm.core_aesthetic || "").replace(/["']/g, "").trim();
  if (core) {
    const segments = core.split(/\s*·\s*|\s*[+／/]\s*/).filter(Boolean);
    const preferred = segments[0] || core;
    return preferred.length > 18 ? preferred.slice(0, 18) : preferred;
  }
  const moods = Array.isArray(fm.mood_keywords) ? fm.mood_keywords : [];
  return moods.slice(0, 2).join(" · ") || "团魂锚点";
}

function generationVetoes(era = "") {
  if (/5/.test(era)) return ["2代浓妆", "复古 Y2K 滥用"];
  if (/2/.test(era)) return ["5代监控感", "过度赛博"];
  if (/3/.test(era)) return ["5代监控感", "后人类冷感"];
  if (/4/.test(era)) return ["2代浓妆", "过度怀旧"];
  return ["代际错位"];
}

function antiFromRivals(fm) {
  const rivals = Array.isArray(fm.rivals) ? fm.rivals : [];
  const narrative = String(fm.rivalry_narrative || fm.counterpoint_axis || "");
  const antis = [];
  if (rivals.includes("aespa") || /未来|cyber|赛博/i.test(narrative)) antis.push("过度赛博");
  if (rivals.includes("twice") || /阳光|甜美|cute/i.test(narrative)) antis.push("无边界甜美");
  if (rivals.includes("bp") || /奢华|黑粉|YG/i.test(narrative)) antis.push("空洞奢华");
  if (rivals.includes("nj") || /自然|minimal|Y2K/i.test(narrative)) antis.push("低信息自然风");
  return antis;
}

function inferVoice(fm) {
  const groupName = fm.group_name || fm.name || "Unknown Group";
  const era = fm.era || (Number(fm.founded_year) >= 2023 ? "5 代" : Number(fm.founded_year) >= 2019 ? "4 代" : Number(fm.founded_year) >= 2013 ? "3 代" : "2 代");
  const moods = Array.isArray(fm.mood_keywords) ? fm.mood_keywords : [];
  const keyMood = moods[0] || descriptor(fm);
  const anchors = [...new Set([keyMood, moods[1], descriptor(fm)].filter(Boolean))].slice(0, 2);
  const antiPool = [...new Set([...(fm.__forbidden || []), ...antiFromRivals(fm), ...generationVetoes(era)])];
  const antis = antiPool.slice(0, 2);
  const vetoes = antiPool.slice(0, 3);

  return [
    "voice:",
    `  identity: "我是 ${groupName} · ${era} · ${descriptor(fm)}"`,
    `  position_statement: "锚点: ${anchors.join(" / ")} · 反对: ${antis.join(" / ")}"`,
    `  veto_triggers: [${vetoes.map(v => `"${v}"`).join(", ")}]`,
    `  question_template: "这个方案符合 ${era} ${keyMood} 吗?"`,
  ].join("\n");
}

function hasTopLevelField(fmText, field) {
  return new RegExp(`^${field}:`, "m").test(fmText);
}

function insertAfterLine(fmText, lineRegex, block) {
  const lines = fmText.split("\n");
  const index = lines.findIndex(line => lineRegex.test(line));
  if (index === -1) return { fmText, inserted: false };
  lines.splice(index + 1, 0, block);
  return { fmText: lines.join("\n"), inserted: true };
}

const stats = {
  examined: 0,
  voiceAdded: [],
  tagsAdded: [],
  skippedComplete: [],
  unchanged: [],
};

for (const file of readdirSync(GROUPS).filter(f => f.endsWith(".md")).sort()) {
  const path = join(GROUPS, file);
  const raw = readFileSync(path, "utf-8");
  const newline = raw.includes("\r\n") ? "\r\n" : "\n";
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\s*\n([\s\S]+?)\n---/);
  if (!match) continue;

  stats.examined += 1;
  const slug = file.replace(/\.md$/, "");
  let fmText = match[1];
  const fm = parseFrontmatter(fmText);
  const hadVoice = hasTopLevelField(fmText, "voice");
  const hadTags = hasTopLevelField(fmText, "aesthetic_tags");

  if (hadVoice && hadTags) {
    stats.skippedComplete.push(slug);
    continue;
  }

  let changed = false;
  if (!hadTags) {
    const tagsLine = `aesthetic_tags: [${inferTags(fm).map(t => `"${t}"`).join(", ")}]`;
    const result = insertAfterLine(fmText, /^core_aesthetic:\s*/, tagsLine);
    fmText = result.fmText;
    if (result.inserted) {
      changed = true;
      stats.tagsAdded.push(slug);
    }
  }

  if (!hadVoice) {
    const voiceBlock = inferVoice(fm);
    const result = insertAfterLine(fmText, /^aesthetic_tags:\s*/, voiceBlock);
    fmText = result.fmText;
    if (result.inserted) {
      changed = true;
      stats.voiceAdded.push(slug);
    }
  }

  if (changed) {
    const updated = normalized.replace(match[1], fmText).replace(/\n/g, newline);
    writeFileSync(path, updated, "utf-8");
  } else {
    stats.unchanged.push(slug);
  }
}

console.log(`Groups examined: ${stats.examined}`);
console.log(`voice added to: ${stats.voiceAdded.length} groups (${stats.voiceAdded.join(", ")})`);
console.log(`aesthetic_tags added to: ${stats.tagsAdded.length} groups (${stats.tagsAdded.join(", ")})`);
console.log(`Groups already complete (skipped): ${stats.skippedComplete.length} (${stats.skippedComplete.join(", ")})`);
if (stats.unchanged.length) console.log(`Unchanged/incomplete: ${stats.unchanged.length} (${stats.unchanged.join(", ")})`);
