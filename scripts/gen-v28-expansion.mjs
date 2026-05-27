#!/usr/bin/env node
// v2.8 · 7 团扩容: fromis_9 + LOONA + EVERGLOW + Brave Girls + XG + NiziU + Lapillus
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ============= 7 GROUP SOULS =============
const GROUPS = [
  {
    slug: 'fromis', name: 'fromis_9', era: '4 代', founded: 2018,
    aesthetic: '邻家青春 · 9 人晴天',
    manifesto: '"to heart"——9 个最亲近的姐妹, 把青春写成 demo',
    fandom: 'flover',
    palette: { primary: '#FFC4C4', secondary: '#FFE5B4', accent: '#67D5FF' },
    mood: ['fresh', 'sweet', 'sunny'],
    tracks: [
      { title: 'DM', year: 2022, mood: 'y2k,sunny', bpm: 130 },
      { title: 'Stay This Way', year: 2022, mood: 'summer,fresh', bpm: 126 },
      { title: '#menow', year: 2019, mood: 'cute,bubbly', bpm: 122 },
    ],
    fusion: ['weeekly', 'stayc', 'oh-my-girl'],
    rivals: ['stayc', 'kep1er'],
  },
  {
    slug: 'loona', name: 'LOONA', era: '4 代', founded: 2018,
    aesthetic: '月之少女 · 世界观 12 章',
    manifesto: '"orbit"——12 个月亮, 每个独立颜色独立宇宙, 拼成完整月相',
    fandom: 'Orbit',
    palette: { primary: '#9D6FCF', secondary: '#F5E6FF', accent: '#FFB7C5' },
    mood: ['ethereal', 'concept', 'cinematic'],
    tracks: [
      { title: 'Hi High', year: 2018, mood: 'fresh,ethereal', bpm: 105 },
      { title: 'Why Not?', year: 2020, mood: 'edm,maximal', bpm: 128 },
      { title: 'PTT (Paint The Town)', year: 2021, mood: 'baroque,intense', bpm: 120 },
    ],
    fusion: ['aespa', 'gfriend', 'dreamcatcher'],
    rivals: ['aespa'],
  },
  {
    slug: 'everglow', name: 'EVERGLOW', era: '4 代', founded: 2019,
    aesthetic: '冷艳 dance 军团 · sharp killing',
    manifesto: '"forever"——6 个人就是一个 dance machine, 永远不会失误',
    fandom: 'FOREVER',
    palette: { primary: '#1A1A1A', secondary: '#FFD700', accent: '#FF3366' },
    mood: ['sharp', 'dance', 'fierce'],
    tracks: [
      { title: 'DUN DUN', year: 2020, mood: 'sharp,brass', bpm: 128 },
      { title: 'LA DI DA', year: 2020, mood: 'fierce,dance', bpm: 132 },
      { title: 'FIRST', year: 2021, mood: 'march,intense', bpm: 130 },
    ],
    fusion: ['itzy', 'bp', 'bm'],
    rivals: ['itzy'],
  },
  {
    slug: 'bravegirls', name: 'Brave Girls', era: '2.5 代', founded: 2011,
    aesthetic: '夏日翻红 · 军营 anthem',
    manifesto: '"rollin"——再被遗忘也不放弃, 第 10 年逆袭神话',
    fandom: 'Fearless',
    palette: { primary: '#FF6B35', secondary: '#FFE066', accent: '#1976D2' },
    mood: ['summer', 'anthem', 'comeback'],
    tracks: [
      { title: 'Rollin\'', year: 2017, mood: 'summer,nostalgia', bpm: 128 },
      { title: 'Chi Mat Ba Ram', year: 2021, mood: 'summer,breezy', bpm: 122 },
      { title: 'After We Ride', year: 2021, mood: 'sunset,fresh', bpm: 124 },
    ],
    fusion: ['sistar', 'tara', 'apink'],
    rivals: [],
  },
  {
    slug: 'xg', name: 'XG', era: '5 代', founded: 2022,
    aesthetic: '全英 K-pop · 日本制造 hip-hop',
    manifesto: '"x-gene"——extraordinary girls, 不是 K-pop 也不是 J-pop, 是 X',
    fandom: 'ALPHAZ',
    palette: { primary: '#000000', secondary: '#C0C0C0', accent: '#FF1744' },
    mood: ['hip-hop', 'sharp', 'global'],
    tracks: [
      { title: 'Mascara', year: 2023, mood: 'r&b,attitude', bpm: 92 },
      { title: 'Woke Up', year: 2024, mood: 'trap,sharp', bpm: 95 },
      { title: 'Tippy Toes', year: 2023, mood: 'minimal,confident', bpm: 100 },
    ],
    fusion: ['katseye', 'meovv', 'bm'],
    rivals: ['katseye'],
  },
  {
    slug: 'niziu', name: 'NiziU', era: '4 代', founded: 2020,
    aesthetic: 'J-pop 治愈 + K-pop 训练 · nizi project',
    manifesto: '"make you happy"——9 个彩虹色 (niji), 把日本治愈系融进 K-pop 训练',
    fandom: 'WithU',
    palette: { primary: '#FF6F61', secondary: '#FFD54F', accent: '#4FC3F7' },
    mood: ['rainbow', 'healing', 'j-pop'],
    tracks: [
      { title: 'Make You Happy', year: 2020, mood: 'sunny,uplifting', bpm: 116 },
      { title: 'Take a picture', year: 2021, mood: 'cute,j-pop', bpm: 118 },
      { title: 'HEARTRIS', year: 2024, mood: 'mature,pop', bpm: 120 },
    ],
    fusion: ['twice', 'fromis', 'stayc'],
    rivals: [],
  },
  {
    slug: 'lapillus', name: 'Lapillus', era: '4 代', founded: 2022,
    aesthetic: '多国籍 latin pop · MLD 万花筒',
    manifesto: '"lapis"——多国籍少女拼成的宝石, 拉丁节奏 + 韩流舞台',
    fandom: 'Lapis',
    palette: { primary: '#7B1FA2', secondary: '#FFB300', accent: '#00ACC1' },
    mood: ['latin', 'global', 'sparkle'],
    tracks: [
      { title: 'HIT YA!', year: 2022, mood: 'latin,bouncy', bpm: 128 },
      { title: 'GRATATA', year: 2023, mood: 'latin,sharp', bpm: 130 },
      { title: 'BEWITCHED', year: 2023, mood: 'mystic,latin', bpm: 124 },
    ],
    fusion: ['katseye', 'kep1er', 'twice'],
    rivals: [],
  },
];

const groupTpl = (g) => `---
name: group-soul-${g.slug}
description: 团魂 · ${g.name} 集体灵魂 · era ${g.era} · '${g.aesthetic}'. 当 brief 提到 ${g.name} 团名时优先激活——召集本团 idol 之前先宣读团魂宣言, 确保设计方案承载该团的集体 DNA.
layer: group_anchor
group_slug: ${g.slug}
group_name: "${g.name}"
era: "${g.era}"
founded_year: ${g.founded}
core_aesthetic: "${g.aesthetic}"
soul_manifesto: "${g.manifesto}"
vote_weight: 3
priority: above_tier_0
fusion_compatible: ${JSON.stringify(g.fusion)}
fusion_synergy: "跨团协同 · 待评议"
fusion_rules: "保留本团核心基因不丢"
rivals: ${JSON.stringify(g.rivals)}
rivalry_narrative: "同代竞争 · 风格差异化"
fandom_name: "${g.fandom}"
palette:
  primary: "${g.palette.primary}"
  secondary: "${g.palette.secondary}"
  accent: "${g.palette.accent}"
mood_keywords: ${JSON.stringify(g.mood)}
signature_tracks:
${g.tracks.map(t => `  - { title: "${t.title}", year: ${t.year}, mood: "${t.mood}", bpm: ${t.bpm} }`).join('\n')}
---

# 👯 团魂 · ${g.name} (${g.era} · ${g.founded})

## 集体灵魂

> "**${g.manifesto}**"

## 美学基因

${g.aesthetic}

## UI 设计宣言

按团魂宣言展开, 配色 + mood + bpm 锁定整体调性, 留细节给 idol 层执行.

## 议会角色

- 当用户 brief 提及 **${g.name}** 或本团成员时, **团魂优先激活**
- 团魂宣读集体宣言后, 再召集本团 Tier 0/1 idol 入会
- 团魂在投票时 vote_weight = 3, 高于个体 idol

## 触发关键词

\`${g.name}\` · \`${g.slug}\` · \`${g.name.toLowerCase()}风格\` · 本团任一成员名

---

> 自动生成 · v2.8 7 团扩容
`;

// ============= IDOL LINEUPS =============
const IDOLS = [
  // fromis_9 (9)
  { slug: 'fromis-saerom', stage: 'Saerom', real: 'Lee Sae-rom (이새롬)', group: 'fromis_9', era: '4 代', role: 'Leader / Lead Dancer', ui: 'leader brand voice · 9 人统筹 layout', personality: '4代队长·成熟·稳重', vibe: '可靠 leader · 9 人 anchor', attitude: 'to heart', helpers: ['twice-jihyo','ive-yujin'], related: ['stayc-sumin'] },
  { slug: 'fromis-hayoung', stage: 'Hayoung', real: 'Song Ha-young (송하영)', group: 'fromis_9', era: '4 代', role: 'Main Vocal', ui: 'main vocal · clean high note hero', personality: '4代主唱·清亮·稳定', vibe: 'main vocal · 高音清亮', attitude: 'dm', helpers: ['snsd-taeyeon','rv-wendy'], related: ['ive-liz'] },
  { slug: 'fromis-gyuri', stage: 'Gyuri', real: 'Jang Gyu-ri (장규리)', group: 'fromis_9', era: '4 代', role: 'Visual / Vocal', ui: 'visual hero KV · 仙气 photography', personality: '4代门面·氛围·清纯', vibe: '走出画报 visual', attitude: 'feel good', helpers: ['twice-tzuyu','apink-naeun'], related: ['ive-jang-wonyoung'] },
  { slug: 'fromis-jiwon', stage: 'Jiwon', real: 'Park Ji-won (박지원)', group: 'fromis_9', era: '4 代', role: 'Main Vocal', ui: 'duo main vocal harmony · 二重唱', personality: '4代双主唱·稳重·真挚', vibe: '与 Hayoung 双主唱搭档', attitude: 'love bomb', helpers: ['sistar-soyou','snsd-tiffany'], related: ['mmm-solar'] },
  { slug: 'fromis-jisun', stage: 'Jisun', real: 'Roh Ji-sun (노지선)', group: 'fromis_9', era: '4 代', role: 'Vocal / Visual', ui: 'sub visual sparkle · soft KV', personality: '4代副门面·甜美·温柔', vibe: '团内温柔担当', attitude: 'fun!', helpers: ['ive-rei','illit-minju'], related: ['stayc-isa'] },
  { slug: 'fromis-seoyeon', stage: 'Seoyeon', real: 'Lee Seo-yeon (이서연)', group: 'fromis_9', era: '4 代', role: 'Vocal / Lead Dancer', ui: 'dance lead motion · group choreo', personality: '4代dancer·活泼·可爱', vibe: '舞蹈担当 · 活泼能量', attitude: 'love bomb', helpers: ['twice-momo','itzy-yeji'], related: ['stayc-yoon'] },
  { slug: 'fromis-chaeyoung', stage: 'Chaeyoung', real: 'Lee Chae-young (이채영)', group: 'fromis_9', era: '4 代', role: 'Vocal / Rapper', ui: 'rapper hook · sharp tagline', personality: '4代rapper·sharp·attitude', vibe: '团内 rapper · 短句 hook', attitude: 'unlock my world', helpers: ['idle-soyeon','nmixx-bae'], related: ['stayc-jay'] },
  { slug: 'fromis-nagyung', stage: 'Nagyung', real: 'Lee Na-gyung (이나경)', group: 'fromis_9', era: '4 代', role: 'Vocal / Visual', ui: 'soft sub visual · soft palette', personality: '4代柔美·甜美·温柔', vibe: '柔美 visual · 邻家姐姐', attitude: 'glass shoes', helpers: ['ive-leeseo','apink-namjoo'], related: ['stayc-seeun'] },
  { slug: 'fromis-jiheon', stage: 'Jiheon', real: 'Baek Ji-heon (백지헌)', group: 'fromis_9', era: '4 代', role: 'Maknae / Vocal', ui: 'maknae brightness · sticker 装饰', personality: '4代maknae·活泼·开朗', vibe: 'maknae 开心果 · 阳光', attitude: 'we go!', helpers: ['nj-hyein','illit-iroha'], related: ['ive-leeseo'] },

  // LOONA (6 most iconic)
  { slug: 'loona-heejin', stage: 'Heejin', real: 'Jeon Hee-jin (전희진)', group: 'LOONA', era: '4 代', role: 'Center / Sub Vocal', ui: 'concept center · world building visual', personality: '4代中心·世界观·清纯', vibe: 'LOONA 一号 · 概念中心', attitude: 'why not?', helpers: ['nj-haerin','idle-miyeon'], related: ['aespa-karina'] },
  { slug: 'loona-hyunjin', stage: 'Hyunjin', real: 'Kim Hyun-jin (김현진)', group: 'LOONA', era: '4 代', role: 'Main Vocal', ui: 'main vocal · ethereal harmony', personality: '4代主唱·氛围·治愈', vibe: '主唱 · ethereal 氛围', attitude: 'around you', helpers: ['rv-wendy','mmm-solar'], related: ['gfriend-yuju'] },
  { slug: 'loona-haseul', stage: 'Haseul', real: 'Jo Ha-seul (조하슬)', group: 'LOONA', era: '4 代', role: 'Leader / Vocal', ui: 'leader brand voice · 12 人统筹', personality: '4代队长·温柔·担当', vibe: 'LOONA 队长 · 12 人 anchor', attitude: 'let me in', helpers: ['twice-jihyo','rv-irene'], related: ['gfriend-sowon'] },
  { slug: 'loona-kim-lip', stage: 'Kim Lip', real: 'Kim Jung-eun (김정은)', group: 'LOONA', era: '4 代', role: 'Sub Vocal / Visual', ui: 'eclipse aesthetic · 红色 sharp KV', personality: '4代sharp·氛围·性感', vibe: 'Eclipse · 红色 sharp center', attitude: 'eclipse', helpers: ['rv-irene','bp-jennie'], related: ['aespa-karina'] },
  { slug: 'loona-chuu', stage: 'Chuu', real: 'Kim Ji-woo (김지우)', group: 'LOONA', era: '4 代', role: 'Sub Vocal / 出圈担当', ui: 'sunny sticker · heart 装饰 graphic', personality: '4代阳光·爱心·治愈', vibe: 'Heart Attack · 团内阳光', attitude: 'heart attack', helpers: ['twice-nayeon','mmm-wheein'], related: ['nj-danielle'] },
  { slug: 'loona-yves', stage: 'Yves', real: 'Ha Sooyoung (하수영)', group: 'LOONA', era: '4 代', role: 'Sub Vocal', ui: 'mature concept · 复古 photography', personality: '4代成熟·氛围·禁果', vibe: '禁果概念 · 成熟氛围', attitude: 'new', helpers: ['rv-seulgi','idle-minnie'], related: ['gfriend-sinb'] },

  // EVERGLOW (6)
  { slug: 'everglow-eu', stage: 'E:U', real: 'Park Ji-won (박지원)', group: 'EVERGLOW', era: '4 代', role: 'Leader / Main Rapper', ui: 'leader rapper · sharp killing tagline', personality: '4代队长·rapper·sharp', vibe: 'EVERGLOW 队长 · sharp rapper', attitude: 'dun dun', helpers: ['itzy-ryujin','idle-soyeon'], related: ['bp-lisa'] },
  { slug: 'everglow-sihyeon', stage: 'Sihyeon', real: 'Han Si-hyeon (한시현)', group: 'EVERGLOW', era: '4 代', role: 'Main Vocal / Visual', ui: 'main vocal hero · sharp visual KV', personality: '4代主唱·visual·sharp', vibe: '主唱 visual 双 anchor', attitude: 'la di da', helpers: ['rv-seulgi','aespa-karina'], related: ['ive-jang-wonyoung'] },
  { slug: 'everglow-mia', stage: 'Mia', real: 'Han Eun-ji (한은지)', group: 'EVERGLOW', era: '4 代', role: 'Main Dancer / Lead Vocal', ui: 'dance motion · 力量 hook 节拍', personality: '4代dancer·力量·sharp', vibe: 'dance 担当 · 力量舞蹈', attitude: 'first', helpers: ['twice-momo','itzy-chaeryeong'], related: ['nmixx-jiwoo'] },
  { slug: 'everglow-onda', stage: 'Onda', real: 'Jo Se-rim (조세림)', group: 'EVERGLOW', era: '4 代', role: 'Sub Vocal / Lead Dancer', ui: 'soft sub vocal · 反差柔美 copy', personality: '4代反差·柔美·dance', vibe: '反差萌 · 柔美 dance', attitude: 'pirate', helpers: ['mmm-wheein','idle-minnie'], related: ['stayc-isa'] },
  { slug: 'everglow-aisha', stage: 'Aisha', real: 'Heo Yoo-rim (허유림)', group: 'EVERGLOW', era: '4 代', role: 'Lead Vocal / Lead Rapper', ui: 'cross-lingual copy · 中英韩 tagline', personality: '4代多语·rapper·全能', vibe: '多语跨界 · 全能 utility', attitude: 'adios', helpers: ['twice-sana','katseye-lara'], related: ['nmixx-bae'] },
  { slug: 'everglow-yiren', stage: 'Yiren', real: 'Wang Yi-ren (왕이런)', group: 'EVERGLOW', era: '4 代', role: 'Visual / Maknae', ui: 'maknae visual hero · 中国担当 KV', personality: '4代maknae·visual·中国', vibe: '中国成员 · maknae visual', attitude: 'last melody', helpers: ['twice-tzuyu','idle-yuqi'], related: ['kep1er-xiaoting'] },

  // Brave Girls / BBGIRLS (4)
  { slug: 'bravegirls-minyoung', stage: 'Minyoung', real: 'Min Young-won (민영원)', group: 'Brave Girls', era: '2.5 代', role: 'Leader / Main Vocal', ui: 'main vocal · 翻红 anthem brand voice', personality: '2.5代队长·主唱·翻红', vibe: '10 年逆袭 · 主唱 leader', attitude: 'rollin', helpers: ['sistar-hyolyn','snsd-taeyeon'], related: ['tara-soyeon'] },
  { slug: 'bravegirls-yujeong', stage: 'Yujeong', real: 'Hong Yu-jeong (홍유정)', group: 'Brave Girls', era: '2.5 代', role: 'Lead Vocal / Visual', ui: 'visual sub vocal · summer hero', personality: '2.5代visual·夏日·甜美', vibe: '夏日 visual · 翻红担当', attitude: 'chi mat ba ram', helpers: ['sistar-dasom','apink-naeun'], related: ['girlsday-minah'] },
  { slug: 'bravegirls-eunji', stage: 'Eunji', real: 'No Hye-ran (노혜란)', group: 'Brave Girls', era: '2.5 代', role: 'Main Dancer / Lead Rapper', ui: 'dance + rapper hook · 军舞 motion', personality: '2.5代dancer·rapper·sharp', vibe: '舞蹈 + rapper 双担当', attitude: 'we ride', helpers: ['aoa-jimin','tara-hyomin'], related: ['sistar-bora'] },
  { slug: 'bravegirls-yuna', stage: 'Yuna', real: 'Lee Yu-na (이유나)', group: 'Brave Girls', era: '2.5 代', role: 'Maknae / Vocal', ui: 'maknae sub vocal · soft microcopy', personality: '2.5代maknae·甜美·清纯', vibe: 'maknae · 甜美 sub vocal', attitude: 'high heels', helpers: ['apink-hayoung','girlsday-hyeri'], related: ['sistar-soyou'] },

  // XG (7)
  { slug: 'xg-jurin', stage: 'Jurin', real: 'JURIN (ジュリン)', group: 'XG', era: '5 代', role: 'Leader / Main Vocal', ui: 'leader r&b vocal · sharp brand voice', personality: '5代队长·r&b·sharp', vibe: 'XG 队长 · sharp main vocal', attitude: 'mascara', helpers: ['mmm-solar','bp-rose'], related: ['katseye-manon'] },
  { slug: 'xg-chisa', stage: 'Chisa', real: 'CHISA (チサ)', group: 'XG', era: '5 代', role: 'Main Vocal / Lead Rapper', ui: 'main vocal · 全英 r&b copy', personality: '5代全能·r&b·成熟', vibe: 'r&b 全英主唱 · 成熟', attitude: 'tippy toes', helpers: ['rv-wendy','bp-rose'], related: ['katseye-lara'] },
  { slug: 'xg-hinata', stage: 'Hinata', real: 'HINATA (ヒナタ)', group: 'XG', era: '5 代', role: 'Main Dancer / Sub Vocal', ui: 'dance motion · sharp killing part', personality: '5代dancer·sharp·力量', vibe: '舞蹈担当 · sharp 力量', attitude: 'left right', helpers: ['twice-momo','nmixx-jiwoo'], related: ['katseye-yoonchae'] },
  { slug: 'xg-harvey', stage: 'Harvey', real: 'HARVEY (ハーヴィー)', group: 'XG', era: '5 代', role: 'Main Rapper', ui: 'main rapper · 全英 hip-hop hook', personality: '5代rapper·全英·attitude', vibe: '全英 rapper · attitude 担当', attitude: 'shooting star', helpers: ['idle-soyeon','katseye-lara'], related: ['nmixx-bae'] },
  { slug: 'xg-juria', stage: 'Juria', real: 'JURIA (ジュリア)', group: 'XG', era: '5 代', role: 'Lead Rapper / Lead Dancer', ui: 'sub rapper + dance · 短句 hook', personality: '5代双rapper·dance·sharp', vibe: '双 rapper line · sharp dancer', attitude: 'undefeated', helpers: ['nmixx-bae','kiii-kya'], related: ['katseye-megan'] },
  { slug: 'xg-maya', stage: 'Maya', real: 'MAYA (マヤ)', group: 'XG', era: '5 代', role: 'Lead Vocal / Sub Rapper', ui: 'sub vocal · velvet r&b texture', personality: '5代sub vocal·velvet·成熟', vibe: 'velvet r&b · 成熟 sub vocal', attitude: 'something ain\'t right', helpers: ['mmm-solar','rv-seulgi'], related: ['kol-belle'] },
  { slug: 'xg-cocona', stage: 'Cocona', real: 'COCONA (ココナ)', group: 'XG', era: '5 代', role: 'Maknae / Sub Vocal / Rapper', ui: 'maknae rapper · fresh hip-hop hook', personality: '5代maknae·rapper·fresh', vibe: '最小但 sharp · maknae rapper', attitude: 'in the rain', helpers: ['nj-hyein','illit-iroha'], related: ['katseye-yoonchae'] },

  // NiziU (9)
  { slug: 'niziu-mako', stage: 'Mako', real: 'Yamaguchi Mako (山口真子)', group: 'NiziU', era: '4 代', role: 'Leader / Main Dancer', ui: 'leader brand voice · J-K hybrid layout', personality: '4代队长·dance·稳重', vibe: 'NiziU 队长 · J-K 桥梁', attitude: 'make you happy', helpers: ['twice-mina','twice-jihyo'], related: ['stayc-sumin'] },
  { slug: 'niziu-rio', stage: 'Rio', real: 'Hanabashi Rio (花橋梨緒)', group: 'NiziU', era: '4 代', role: 'Lead Vocal / Lead Dancer', ui: 'visual + vocal + dance triple anchor', personality: '4代全能·visual·dance', vibe: '全能 anchor · J-pop visual', attitude: 'step and a step', helpers: ['twice-sana','twice-momo'], related: ['stayc-isa'] },
  { slug: 'niziu-maya', stage: 'Maya', real: 'Katsumura Maya (勝村摩耶)', group: 'NiziU', era: '4 代', role: 'Lead Rapper / Vocal', ui: 'rapper hook · J-pop sweet tagline', personality: '4代rapper·甜美·反差', vibe: 'rapper line · 甜美反差', attitude: 'asobo', helpers: ['twice-chaeyoung','idle-yuqi'], related: ['fromis-chaeyoung'] },
  { slug: 'niziu-riku', stage: 'Riku', real: 'Oe Riku (大江梨空)', group: 'NiziU', era: '4 代', role: 'Main Vocal', ui: 'main vocal · clean tone hero', personality: '4代主唱·清亮·稳定', vibe: 'main vocal · 清亮稳定', attitude: 'super summer', helpers: ['snsd-taeyeon','twice-jihyo'], related: ['fromis-hayoung'] },
  { slug: 'niziu-ayaka', stage: 'Ayaka', real: 'Niinuma Ayaka (新沼希空)', group: 'NiziU', era: '4 代', role: 'Vocal / Visual', ui: 'soft visual · pastel palette KV', personality: '4代柔美·visual·治愈', vibe: '柔美 visual · pastel 治愈', attitude: 'paradise', helpers: ['twice-tzuyu','apink-naeun'], related: ['ive-rei'] },
  { slug: 'niziu-mayuka', stage: 'Mayuka', real: 'Hanabashi Mayuka (花橋舞優香)', group: 'NiziU', era: '4 代', role: 'Vocal / Visual', ui: 'sub visual sparkle · cute graphic icon', personality: '4代甜美·治愈·撒娇', vibe: '甜美治愈 · cute 担当', attitude: 'make you happy', helpers: ['twice-sana','apink-namjoo'], related: ['fromis-jisun'] },
  { slug: 'niziu-rima', stage: 'Rima', real: 'Yokoi Rima (横井里茉)', group: 'NiziU', era: '4 代', role: 'Main Rapper / Lead Dancer', ui: 'rapper + dance · 全英短句 hook', personality: '4代rapper·attitude·dance', vibe: 'main rapper · 跨界 attitude', attitude: 'chopstick', helpers: ['idle-soyeon','itzy-ryujin'], related: ['nmixx-bae'] },
  { slug: 'niziu-miihi', stage: 'Miihi', real: 'Suzuno Miihi (鈴野美羽)', group: 'NiziU', era: '4 代', role: 'Lead Vocal / Visual', ui: 'lead vocal · visual sparkle harmony', personality: '4代副主唱·visual·甜美', vibe: '副主唱 visual 双担当', attitude: 'make you happy', helpers: ['twice-sana','rv-wendy'], related: ['fromis-nagyung'] },
  { slug: 'niziu-nina', stage: 'Nina', real: 'Hillman Nina (ヒルマンニナ)', group: 'NiziU', era: '4 代', role: 'Maknae / Main Vocal', ui: 'maknae main vocal · clean high note', personality: '4代maknae·main vocal·清亮', vibe: 'maknae 主唱 · 美日混血 visual', attitude: 'take a picture', helpers: ['twice-tzuyu','nj-hyein'], related: ['fromis-jiheon'] },

  // Lapillus (6)
  { slug: 'lapillus-chanty', stage: 'Chanty', real: 'Chanty (찬티)', group: 'Lapillus', era: '4 代', role: 'Leader / Main Vocal', ui: 'leader main vocal · 拉丁 brand voice', personality: '4代队长·主唱·拉丁混血', vibe: 'Lapillus 队长 · 菲律宾血统', attitude: 'hit ya', helpers: ['twice-jihyo','katseye-manon'], related: ['niziu-mako'] },
  { slug: 'lapillus-bessie', stage: 'Bessie', real: 'Bessie (베시)', group: 'Lapillus', era: '4 代', role: 'Main Dancer / Vocal', ui: 'dance + latin pulse motion', personality: '4代dancer·拉丁·活力', vibe: '舞蹈担当 · 拉丁节奏', attitude: 'gratata', helpers: ['twice-momo','katseye-yoonchae'], related: ['everglow-mia'] },
  { slug: 'lapillus-yue', stage: 'Yue', real: 'Yue (유에)', group: 'Lapillus', era: '4 代', role: 'Lead Vocal / Lead Rapper', ui: 'cross-lingual copy · 中英 tagline', personality: '4代多语·rapper·清亮', vibe: '中国成员 · 多语 utility', attitude: 'bewitched', helpers: ['idle-yuqi','everglow-yiren'], related: ['kep1er-xiaoting'] },
  { slug: 'lapillus-shana', stage: 'Shana', real: 'Shana (샤나)', group: 'Lapillus', era: '4 代', role: 'Main Rapper / Sub Vocal', ui: 'main rapper · sharp 拉丁 hook', personality: '4代rapper·sharp·日本', vibe: '日本 main rapper · sharp', attitude: 'hit ya', helpers: ['niziu-rima','idle-soyeon'], related: ['xg-harvey'] },
  { slug: 'lapillus-haeun', stage: 'Haeun', real: 'Haeun (하은)', group: 'Lapillus', era: '4 代', role: 'Sub Vocal / Visual', ui: 'sub visual · soft sparkle KV', personality: '4代柔美·visual·甜美', vibe: '柔美 visual · 韩国担当', attitude: 'gratata', helpers: ['apink-naeun','niziu-ayaka'], related: ['fromis-nagyung'] },
  { slug: 'lapillus-seowon', stage: 'Seowon', real: 'Seowon (서원)', group: 'Lapillus', era: '4 代', role: 'Maknae / Vocal', ui: 'maknae brightness · sticker 装饰', personality: '4代maknae·活泼·甜美', vibe: 'maknae 开心果', attitude: 'hit ya', helpers: ['ive-leeseo','niziu-nina'], related: ['fromis-jiheon'] },
];

const idolTpl = (i) => `---
name: ${i.slug}
description: "${i.real} · ${i.group} · ${i.role} · 个性: ${i.personality} · UI: ${i.ui}"
stage_name: "${i.stage}"
real_name: "${i.real}"
group: "${i.group}"
era: "${i.era}"
role: "${i.role}"
tier: 0
vote_weight: 2
ui_specialty: "${i.ui}"
personality: "${i.personality}"
vibe: "${i.vibe}"
attitude: "${i.attitude}"
invited_helpers: ${JSON.stringify(i.helpers)} 时, 优先邀请
- **发言风格**: 用 "${i.personality}" 的视角评审 design
- **投票权重**: 2 (Tier 0)
- **关联 idol**: ${JSON.stringify(i.related)}

## 🌐 触发短语

- \`"用 ${i.stage} 风格设计 ..."\`
- \`"${i.group} 议会"\`
- \`"${i.attitude} 的 UI"\`
- \`"${i.ui} ..."\`

---

> 🎤 ***"${i.attitude}"*** — ${i.stage} of ${i.group}
`;

// Write groups
let g_created = 0;
for (const g of GROUPS) {
  const p = path.join(ROOT, 'groups', `${g.slug}.md`);
  if (fs.existsSync(p)) continue;
  fs.writeFileSync(p, groupTpl(g), 'utf8');
  g_created++;
}

// Write idols
let i_created = 0;
for (const i of IDOLS) {
  const p = path.join(ROOT, 'agents', `${i.slug}.md`);
  if (fs.existsSync(p)) continue;
  fs.writeFileSync(p, idolTpl(i), 'utf8');
  i_created++;
}

console.log(`✅ groups created=${g_created}/${GROUPS.length}  idols created=${i_created}/${IDOLS.length}`);
