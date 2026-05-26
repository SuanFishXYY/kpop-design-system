#!/usr/bin/env node
// v2.6 · 按 ui_specialty 维度反查 — "谁管 typography?"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENTS = path.join(ROOT, 'agents');
const OUT = path.join(ROOT, 'docs', 'SPECIALTY-INDEX.md');

const SPECIALTY = {
  typography:   { re: /typo|font|衬线|字|serif|sans|letter|kerning|leading|tagline|copy[\s-]?tone/i, icon: '🔤', desc: '字体 · 排印 · 文字层级' },
  motion:       { re: /motion|animation|动效|easing|spring|节奏|tempo|transition|hook|pulse|bpm/i,    icon: '🎬', desc: '动效 · 节奏 · 转场' },
  palette:      { re: /palette|color|配色|hex|swatch|hue|tone|gradient|彩|色/i,                       icon: '🎨', desc: '配色 · 色彩系统' },
  layout:       { re: /layout|grid|ia|architect|架构|栏|布局|composition|阵型|form/i,                  icon: '📐', desc: '版式 · 栅格 · 信息架构' },
  brand:        { re: /brand|品牌|logo|identity|mark|象征|signature|voice/i,                          icon: '🏷️', desc: '品牌调性 · 标识 · 声音' },
  hero:         { re: /hero|kv|key.?visual|首屏|landing|banner|门面|visual/i,                         icon: '🎯', desc: 'Hero · KV · 首屏视觉' },
  interaction:  { re: /micro|interaction|hover|交互|tap|gesture|haptic|click/i,                       icon: '👆', desc: '微交互 · 手势 · 反馈' },
  illustration: { re: /illust|绘|graphic|icon|插画|sticker|kawaii/i,                                   icon: '🖌️', desc: '插画 · 图标 · 装饰元素' },
  photography:  { re: /photo|拍|镜头|frame|cinematic|filmic|reels|视频/i,                              icon: '📸', desc: '摄影 · 镜头 · 视频' },
  copy:         { re: /copy|文案|tone|voice|tagline|claim|wording|maknae|microcopy/i,                  icon: '✍️', desc: '文案 · tagline · microcopy' },
};

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
    stage: get('stage_name'),
    group: get('group'),
    role: get('role'),
    weight: Number(get('vote_weight')) || 0,
    ui_specialty: get('ui_specialty'),
    personality: get('personality'),
    vibe: get('vibe'),
    attitude: get('attitude'),
  };
}

const files = fs.readdirSync(AGENTS).filter(f => f.endsWith('.md'));
const idols = [];
for (const f of files) {
  const fm = parseFM(fs.readFileSync(path.join(AGENTS, f), 'utf8'));
  if (!fm || !fm.group || (!fm.ui_specialty && !fm.personality)) continue;
  fm.blob = [fm.ui_specialty, fm.personality, fm.vibe, fm.attitude].filter(Boolean).join(' · ');
  idols.push(fm);
}

const index = {};
const uncategorized = [];
for (const i of idols) {
  let hit = false;
  for (const [dim, { re }] of Object.entries(SPECIALTY)) {
    if (re.test(i.blob)) {
      if (!index[dim]) index[dim] = [];
      index[dim].push(i);
      hit = true;
    }
  }
  if (!hit) uncategorized.push(i);
}

let md = `# 🔍 116 Idol · 按维度反查索引 (v2.6.0)

> "谁管 typography?" "motion 派谁?" — 一查就到.

10 个设计维度自动反查 ${idols.length} 个 idol. 同一 idol 可在多维度出现 (因为 ui_specialty + personality + vibe + attitude 多关键词).

## 📊 维度覆盖

| 维度 | 担当数 |
|---|---|
`;

for (const dim of Object.keys(SPECIALTY)) {
  md += `| ${SPECIALTY[dim].icon} ${dim} | ${(index[dim] || []).length} |\n`;
}
md += `\n## 🎯 目录\n\n`;
for (const dim of Object.keys(SPECIALTY)) {
  md += `- [${SPECIALTY[dim].icon} ${dim}](#${dim}) — ${SPECIALTY[dim].desc}\n`;
}
md += `\n---\n\n`;

for (const dim of Object.keys(SPECIALTY)) {
  const list = (index[dim] || []).sort((a, b) => b.weight - a.weight);
  md += `## ${SPECIALTY[dim].icon} ${dim}\n\n_${SPECIALTY[dim].desc}_ · **${list.length} 担当**\n\n`;
  if (!list.length) { md += `_(暂无匹配)_\n\n`; continue; }
  md += `| Stage Name | Group | Weight | UI Specialty / DNA |\n|---|---|---|---|\n`;
  for (const i of list) {
    const dna = (i.ui_specialty || i.personality || '').replace(/\|/g, '\\|');
    md += `| **${i.stage}** | ${i.group} | ${i.weight} | ${dna} |\n`;
  }
  md += `\n`;
}

md += `\n---\n\n## 🛠 程序化反查\n\n\`\`\`js
import { getPerformersBySpecialty } from './engine/synthesize.mjs';

// "谁管 typography?"
const typo = getPerformersBySpecialty(council, 'typography', 5);
// → [{ name: 'Jennie', group: 'BLACKPINK', ... }, ...]
\`\`\`

## 📋 其他参考

- [116 Idol 大一览表](./IDOL-ROSTER.md) — 按 group 分组完整列表
`;

fs.writeFileSync(OUT, md, 'utf8');
console.log(`✅ ${OUT}`);
for (const dim of Object.keys(SPECIALTY)) {
  console.log(`  ${SPECIALTY[dim].icon} ${dim}: ${(index[dim] || []).length}`);
}
if (uncategorized.length) console.log(`  ⚠ 未归类: ${uncategorized.length}`);
