#!/usr/bin/env node
// scripts/export-female-roster.mjs
// Export full female idol roster + design attributes to docs/FEMALE-IDOL-ROSTER.md

import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadIdols } from "../engine/council-assembly.mjs";
import { classifyIdolSpecialty, SPECIALTY_LABELS } from "../engine/specialty.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const VERSION = pkg.version;

const idols = loadIdols();
const tier0 = idols.filter(i => i.tier === 0);
const tier1 = idols.filter(i => i.tier === 1);
const tier2 = idols.filter(i => i.tier === 2);

// Group by group name
const byGroup = {};
for (const i of idols) {
  const g = i.group || "Solo";
  byGroup[g] = byGroup[g] || [];
  byGroup[g].push(i);
}

// Specialty stats
const specStats = {};
for (const label of SPECIALTY_LABELS) specStats[label] = [];
specStats["general"] = [];
for (const i of idols) {
  for (const s of classifyIdolSpecialty(i)) {
    specStats[s] = specStats[s] || [];
    specStats[s].push(i);
  }
}

const labelsZh = {
  typography: "字体/排版", motion: "动效/节奏", palette: "配色/色板",
  layout: "布局/架构", brand: "品牌/标识", hero: "首屏/KV",
  interaction: "交互/微交互", illustration: "插画/图形", photography: "摄影/镜头",
  copy: "文案/语调", general: "综合视觉"
};

let md = `# K-pop 女 idol 完整名单 & 设计属性大全

> 自动生成于 v${VERSION} · 共 **${idols.length}** 位女 idol · Tier 0: **${tier0.length}** 人 · Tier 1: **${tier1.length}** 人 · Tier 2: **${tier2.length}** 人

---

## 一、按设计风格维度分类

`;

for (const [spec, list] of Object.entries(specStats).sort((a, b) => b[1].length - a[1].length)) {
  md += `\n### ${spec} · ${labelsZh[spec] || spec} — ${list.length} 人\n\n`;
  md += "| Idol | 团体 | 时代 | UI 专长 |\n|---|---|---|---|\n";
  for (const i of list.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name))) {
    md += `| ${i.name} | ${i.group || "Solo"} | ${i.era || ""} | ${i.ui_specialty || ""} |\n`;
  }
}

md += `\n---\n\n## 二、按团体/时代分类\n\n`;

const sortedGroups = Object.keys(byGroup).sort((a, b) => {
  const eraA = byGroup[a][0]?.era || "";
  const eraB = byGroup[b][0]?.era || "";
  return eraA.localeCompare(eraB) || a.localeCompare(b);
});

for (const group of sortedGroups) {
  const members = byGroup[group].sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  md += `\n### ${group} — ${members.length} 人（${members[0]?.era || ""}）\n\n`;
  md += "| Idol | Tier | 角色 | UI 专长 | 设计风格 |\n|---|---|---|---|---|\n";
  for (const i of members) {
    const specs = classifyIdolSpecialty(i).join(", ");
    md += `| ${i.name} | ${i.tier} | ${i.role || ""} | ${i.ui_specialty || ""} | ${specs} |\n`;
  }
}

md += `\n---\n\n## 三、纯 Solo 艺人名单\n\n`;
md += "| Idol | 时代 | UI 专长 | 设计风格 |\n|---|---|---|---|\n";
for (const i of idols.filter(x => !x.group || x.group === "Solo").sort((a, b) => a.name.localeCompare(b.name))) {
  md += `| ${i.name} | ${i.era || ""} | ${i.ui_specialty || ""} | ${classifyIdolSpecialty(i).join(", ")} |\n`;
}

md += `\n---\n\n## 四、统计摘要\n\n- 总人数：${idols.length}\n- Tier 0（TOP 人气 + 队长）：${tier0.length}\n- Tier 1（知名成员）：${tier1.length}
- Tier 2（其他成员）：${tier2.length}\n- 团体数：${Object.keys(byGroup).length}\n- 设计风格维度：${SPECIALTY_LABELS.length + 1}（含 general）\n`;

writeFileSync(join(ROOT, "docs", "FEMALE-IDOL-ROSTER.md"), md, "utf-8");
console.log(`Exported ${idols.length} idols to docs/FEMALE-IDOL-ROSTER.md`);
