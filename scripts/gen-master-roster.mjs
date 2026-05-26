#!/usr/bin/env node
// v2.7 · MASTER-ROSTER · 评委 + 团魂 + idol 三层合一
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'docs', 'MASTER-ROSTER.md');

function parseFM(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return null;
  const body = m[1];
  const get = (k) => {
    const r = new RegExp('^' + k + ':\\s*(.+?)\\s*$', 'm');
    const x = body.match(r);
    if (!x) return '';
    let v = x[1].trim();
    // strip wrapping quotes if balanced
    if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) v = v.slice(1, -1);
    // 处理 YAML 双重引号 ""xxx"" → "xxx" → 再剥一次
    if (v.startsWith('"')) v = v.replace(/^"+/, '');
    if (v.endsWith('"')) v = v.replace(/"+$/, '');
    return v;
  };
  const list = (k) => {
    const r = new RegExp('^' + k + ':\\s*\\[([^\\]]+)\\]', 'm');
    const x = body.match(r);
    if (!x) return [];
    return x[1].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  };
  return { get, list };
}

// 1. judges
const judges = fs.readdirSync(path.join(ROOT, 'judges')).filter(f => f.endsWith('.md')).map(f => {
  const fm = parseFM(fs.readFileSync(path.join(ROOT, 'judges', f), 'utf8'));
  return {
    slug: fm.get('judge_slug'),
    name: fm.get('judge_name'),
    ko: fm.get('judge_ko'),
    label: fm.get('label'),
    founded: fm.get('founded_year'),
    style: fm.get('judging_style'),
    manifesto: fm.get('manifesto').replace(/^"+|"+$/g, ''),
    portfolio: fm.list('portfolio'),
  };
});

// 2. group souls
const souls = {};
for (const f of fs.readdirSync(path.join(ROOT, 'groups')).filter(f => f.endsWith('.md'))) {
  const fm = parseFM(fs.readFileSync(path.join(ROOT, 'groups', f), 'utf8'));
  const slug = fm.get('group_slug');
  souls[slug] = {
    slug,
    name: fm.get('group_name'),
    era: fm.get('era'),
    founded: fm.get('founded_year'),
    aesthetic: fm.get('core_aesthetic'),
    manifesto: fm.get('soul_manifesto').replace(/^"+|"+$/g, ''),
    fandom: fm.get('fandom_name'),
  };
}

// 3. idols
const idols = [];
for (const f of fs.readdirSync(path.join(ROOT, 'agents')).filter(f => f.endsWith('.md'))) {
  const text = fs.readFileSync(path.join(ROOT, 'agents', f), 'utf8');
  const fm = parseFM(text);
  if (!fm.get('stage_name')) continue;
  const quote = (text.match(/>\s*🎤\s*\*\*\*"([^"]+)"\*\*\*/) || [,''])[1];
  idols.push({
    stage: fm.get('stage_name'),
    group: fm.get('group'),
    era: fm.get('era'),
    role: fm.get('role'),
    weight: Number(fm.get('vote_weight')) || 0,
    ui: fm.get('ui_specialty'),
    personality: fm.get('personality'),
    quote,
  });
}

// group idols by group name → match to soul
const idolByGroup = {};
for (const i of idols) {
  if (!idolByGroup[i.group]) idolByGroup[i.group] = [];
  idolByGroup[i.group].push(i);
}

// map judge label → simple icon
const judgeIcon = { 'JYP Entertainment': '🟢', 'YG Entertainment': '🖤', 'SM Entertainment': '💎', 'HYBE': '🌐', 'ADOR': '🐰', 'Starship Entertainment': '👑', 'THEBLACKLABEL': '🎛️' };

// build label → judge portfolio map (group_slug → judge)
const slugToJudge = {};
for (const j of judges) for (const g of j.portfolio) slugToJudge[g.toLowerCase()] = j;

let md = `# 🎤 K-pop 议会 · 名单大全 (v2.7.0)

> 算鱼设计系统 · **${judges.length} 评委 + ${Object.keys(souls).length} 团魂 + ${idols.length} idol** 三层完整名单

唯一权威名单. 之前的 \`IDOL-ROSTER.md\` 和 \`SPECIALTY-INDEX.md\` 已合并到本表.

---

## 📊 速览

| 层 | 数量 | 权重 | 角色 |
|---|---|---|---|
| 🏛 评委 (judges) | ${judges.length} | 5 | 厂牌级 veto · portfolio_only |
| 👯 团魂 (group souls) | ${Object.keys(souls).length} | 3 | 集体 DNA 守护 · 高于个体 idol |
| 🌟 idol (Tier 0+1) | ${idols.length} | 1.5-2 | 设计维度专业担当 |

---

## 🏛 评委层 (${judges.length})

`;

for (const j of judges) {
  const icon = judgeIcon[j.label] || '🎙';
  md += `### ${icon} ${j.name} · ${j.label}\n\n`;
  md += `- **创立**: ${j.founded}\n`;
  md += `- **评审风格**: ${j.style}\n`;
  md += `- **宣言**: > _${j.manifesto}_\n`;
  md += `- **旗下团 (portfolio)**: ${j.portfolio.map(p => `\`${p}\``).join(' · ')}\n\n`;
}

md += `---\n\n## 👯 团魂 + Idol 全员 (${Object.keys(souls).length} 团)\n\n`;
md += `每个团展示: **代际 / 美学基因 / 集体宣言 / fandom** + 全员 idol 表\n\n---\n\n`;

const orderedGroups = Object.keys(idolByGroup).sort();
for (const groupName of orderedGroups) {
  const members = idolByGroup[groupName];
  // find soul by matching group_name
  const soul = Object.values(souls).find(s => s.name === groupName);
  const judge = soul ? slugToJudge[soul.slug.toLowerCase()] : null;
  const judgeIco = judge ? (judgeIcon[judge.label] || '🎙') : '';

  md += `### ${groupName}${judge ? `  ${judgeIco} ${judge.label}` : ''}\n\n`;
  if (soul) {
    md += `**代际**: ${soul.era} · **出道**: ${soul.founded || '-'} · **fandom**: ${soul.fandom || '-'}\n\n`;
    md += `**美学基因**: ${soul.aesthetic}\n\n`;
    md += `> 🌟 **团魂宣言**: _${soul.manifesto}_\n\n`;
  } else {
    md += `_(无团魂条目)_\n\n`;
  }
  md += `**成员 (${members.length})**:\n\n`;
  md += `| Stage | Role | UI Specialty | Personality | Quote |\n|---|---|---|---|---|\n`;
  for (const m of members.sort((a, b) => b.weight - a.weight)) {
    const role = (m.role || '').replace(/\|/g, '\\|');
    const ui = (m.ui || '').replace(/\|/g, '\\|');
    const p = (m.personality || '').replace(/\|/g, '\\|');
    const q = (m.quote || '').replace(/\|/g, '\\|');
    md += `| **${m.stage}** | ${role} | ${ui} | ${p} | _"${q}"_ |\n`;
  }
  md += `\n---\n\n`;
}

md += `## 🛠 程序化查询\n\n\`\`\`js
import { loadAllAgents } from './engine/dispatch.mjs';
import { getPerformersBySpecialty } from './engine/synthesize.mjs';

const { judges, souls, idols } = loadAllAgents();
const typo = getPerformersBySpecialty({ idols }, 'typography', 5);
\`\`\`

## 🔄 维护

| 命令 | 作用 |
|---|---|
| \`node scripts/gen-master-roster.mjs\` | 重新生成本文档 |
| \`node scripts/gen-lineup-expansion.mjs\` | 补全 6 团缺员 (v2.7 已用) |

后续加 idol / 改团魂 → 跑一次脚本同步.
`;

fs.writeFileSync(OUT, md, 'utf8');
console.log(`✅ ${OUT}`);
console.log(`   judges=${judges.length} souls=${Object.keys(souls).length} idols=${idols.length} groups=${orderedGroups.length}`);
