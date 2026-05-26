#!/usr/bin/env node
// v2.5 · 生成 116 idol 大一览表
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENTS = path.join(ROOT, 'agents');
const OUT = path.join(ROOT, 'docs', 'IDOL-ROSTER.md');

function parseFM(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return null;
  const body = m[1];
  const get = (k) => {
    const r = new RegExp('^' + k + ':\\s*"?([^"\\n]+?)"?\\s*$', 'm');
    const x = body.match(r);
    return x ? x[1].trim() : '';
  };
  return {
    slug: get('name'),
    stage: get('stage_name'),
    real: get('real_name'),
    group: get('group'),
    era: get('era'),
    role: get('role'),
    tier: get('tier'),
    weight: get('vote_weight'),
    ui_specialty: get('ui_specialty'),
    personality: get('personality'),
    vibe: get('vibe'),
    attitude: get('attitude'),
  };
}

function quoteOf(text) {
  const m = text.match(/>\s*🎤\s*\*\*\*"([^"]+)"\*\*\*/);
  return m ? m[1] : '';
}

const files = fs.readdirSync(AGENTS).filter(f => f.endsWith('.md'));
const idols = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(AGENTS, f), 'utf8');
  const fm = parseFM(text);
  if (!fm || !fm.group) continue;
  if (!fm.ui_specialty && !fm.personality) continue;
  fm.quote = quoteOf(text);
  fm.file = f;
  idols.push(fm);
}

idols.sort((a, b) => (a.group + a.stage).localeCompare(b.group + b.stage));

const byGroup = {};
for (const i of idols) {
  if (!byGroup[i.group]) byGroup[i.group] = [];
  byGroup[i.group].push(i);
}

const groups = Object.keys(byGroup).sort();
function eraOf(g) {
  const eras = byGroup[g].map(i => i.era).filter(Boolean);
  return eras[0] || '';
}

let md = `# 🎤 116 Idol 大一览表 (v2.5.0)

> 算鱼设计系统 · ${idols.length} 个 idol 的独特 DNA 标签与符号

每个 idol 都是一个**设计维度的担当**。当 LLM 写 brief 时，引擎按维度派工：typography 段交给 Jennie 的视角、motion 段 Lisa+Momo、hero 段 Jisoo+Nayeon——设计稿是 ${idols.length} 个专业视角的协同结果。

## 📊 统计

- **总数**: ${idols.length} idol
- **厂牌/团**: ${groups.length} 个
- **代际**: 2 代 / 3 代 / 4 代 / 5 代

## 🎯 目录

`;

for (const g of groups) {
  md += `- [${g}](#${g.toLowerCase().replace(/[^a-z0-9]+/g, '-')}) (${byGroup[g].length})\n`;
}

md += `\n---\n\n`;

for (const g of groups) {
  md += `## ${g}\n\n`;
  md += `**代际**: ${eraOf(g)} · **成员**: ${byGroup[g].length}\n\n`;
  md += `| Stage Name | Role | UI Specialty | Personality | Quote |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const i of byGroup[g].sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0))) {
    const stage = i.stage || i.slug;
    const role = (i.role || '').replace(/\|/g, '\\|');
    const ui = (i.ui_specialty || '').replace(/\|/g, '\\|');
    const pers = (i.personality || '').replace(/\|/g, '\\|');
    const q = (i.quote || i.attitude || '').replace(/\|/g, '\\|');
    md += `| **${stage}** | ${role} | ${ui} | ${pers} | _"${q}"_ |\n`;
  }
  md += `\n`;
}

md += `\n---\n\n## 🛠 使用方式\n\n\`\`\`js
import { aggregatePerformerDNA, getPerformersBySpecialty } from './engine/synthesize.mjs';

// 拿到 BP×TWICE landing brief 后, 查 typography 担当
const typo = getPerformersBySpecialty(council, 'typography', 3);
// → [{ name: 'Jennie', ui_specialty: 'Human Chanel · 极简奢华 typography', ... }]
\`\`\`

10 个设计维度自动分类: typography / motion / palette / layout / brand / hero / interaction / illustration / photography / copy

---

> 🎤 _"We not lucky, you not lucky, we good"_ — 不是 116 张投票牌，是 116 个**设计视角**。
`;

fs.writeFileSync(OUT, md, 'utf8');
console.log(`✅ Wrote ${OUT}`);
console.log(`   ${idols.length} idols · ${groups.length} groups`);
