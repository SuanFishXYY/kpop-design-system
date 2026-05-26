#!/usr/bin/env node
// v2.7 · 扩员 6 团 + 生成 23 idol .md
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENTS = path.join(ROOT, 'agents');

const LINEUPS = [
  // Apink (2.5 代 · 初恋系) — chorong 已存在
  { slug: 'apink-bomi', stage: 'Bomi', real: 'Yoon Bo-mi (윤보미)', group: 'Apink', era: '2.5 代', role: 'Main Dancer / Sub Vocal', ui: '兔系 motion · 蹦跶 hook 节奏', personality: '2.5代担当·活泼·兔系', vibe: '能量充电·variety queen', attitude: 'no no no', helpers: ['twice-momo','redvelvet-joy'], related: ['sistar-bora','snsd-sunny'] },
  { slug: 'apink-eunji', stage: 'Eunji', real: 'Jung Eun-ji (정은지)', group: 'Apink', era: '2.5 代', role: 'Main Vocal', ui: 'OST vocal · 痛点共鸣 microcopy', personality: '2.5代主唱·OST·共鸣', vibe: '韩剧 OST 女王 · 真音共鸣', attitude: 'mr chu', helpers: ['mmm-solar','aoa-jimin'], related: ['mmm-hwasa','rv-wendy'] },
  { slug: 'apink-naeun', stage: 'Naeun', real: 'Son Na-eun (손나은)', group: 'Apink', era: '2.5 代', role: 'Visual / Sub Vocal', ui: 'visual hero · 仙气 KV', personality: '2.5代门面·仙气·氛围', vibe: '走出画报的少女门面', attitude: 'lovely day', helpers: ['twice-tzuyu','redvelvet-irene'], related: ['snsd-yoona'] },
  { slug: 'apink-namjoo', stage: 'Namjoo', real: 'Kim Nam-joo (김남주)', group: 'Apink', era: '2.5 代', role: 'Lead Vocal / Sub Rapper', ui: 'sub vocal sparkle · 转音 micro', personality: '2.5代副主唱·灵动·甜', vibe: '声线晶莹 · 灵动转音', attitude: 'remember', helpers: ['snsd-taeyeon','iu'], related: ['twice-jihyo'] },
  { slug: 'apink-hayoung', stage: 'Hayoung', real: 'Oh Ha-young (오하영)', group: 'Apink', era: '2.5 代', role: 'Maknae / Vocal', ui: 'maknae brightness · sticker 系装饰', personality: '2.5代maknae·阳光·撒娇', vibe: '团内开心果·正能量', attitude: 'dumhdurum', helpers: ['twice-chaeyoung','itzy-yeji'], related: ['mmm-moonbyul'] },

  // T-ara (2.5 代 · 群舞女王) — eunjung 已存在
  { slug: 'tara-boram', stage: 'Boram', real: 'Jeon Bo-ram (전보람)', group: 'T-ara', era: '2.5 代', role: 'Sub Vocal / Eldest', ui: '反差萌 microcopy · 长辈系亲和', personality: '2.5代姐姐·反差萌·星二代', vibe: '团内大姐·反差萌爱豆', attitude: 'roly poly', helpers: ['mmm-moonbyul','snsd-tiffany'], related: ['girlsday-sojin'] },
  { slug: 'tara-qri', stage: 'Qri', real: 'Lee Ji-hyun (이지현)', group: 'T-ara', era: '2.5 代', role: 'Visual / Sub Vocal', ui: '复古 hero · vintage 视觉锚', personality: '2.5代门面·复古·清纯', vibe: '复古韩流氛围 visual', attitude: 'we were in love', helpers: ['snsd-yuri','wg-sunye'], related: ['rv-irene'] },
  { slug: 'tara-soyeon', stage: 'Soyeon', real: 'Park So-yeon (박소연)', group: 'T-ara', era: '2.5 代', role: 'Main Vocal', ui: 'main vocal · 高音 brand voice', personality: '2.5代主唱·高音·清亮', vibe: '团内 main vocal · 清亮高音', attitude: 'cry cry', helpers: ['snsd-taeyeon','sistar-hyolyn'], related: ['apink-eunji'] },
  { slug: 'tara-hyomin', stage: 'Hyomin', real: 'Park Sun-young (박선영)', group: 'T-ara', era: '2.5 代', role: 'Lead Rapper / Vocal / Producer', ui: 'producer ia · 自制曲 architect', personality: '2.5代rapper·制作人·跨界', vibe: '跨界制作 · 全能 rapper', attitude: 'sketch', helpers: ['idle-soyeon','itzy-chaeryeong'], related: ['mmm-hwasa'] },
  { slug: 'tara-jiyeon', stage: 'Jiyeon', real: 'Park Ji-yeon (박지연)', group: 'T-ara', era: '2.5 代', role: 'Lead Vocal / Lead Dancer / Center', ui: 'killing part · 视线锁定 hero', personality: '2.5代center·性感·氛围', vibe: '舞台杀气 · 视线锁定 center', attitude: 'numuna', helpers: ['snsd-yoona','aoa-seolhyun'], related: ['twice-tzuyu'] },

  // KISS OF LIFE (4 代 · Y2K + R&B) — julie 已存在
  { slug: 'kol-natty', stage: 'Natty', real: 'Anchilee Scott-Kemmis (낫띠)', group: 'KISS OF LIFE', era: '4 代', role: 'Main Dancer / Sub Vocal', ui: 'global motion · 国际舞蹈 hook', personality: '4代海外·dance·泰意混血', vibe: '国际化舞蹈担当 · 跨文化', attitude: 'midas touch', helpers: ['twice-momo','katseye-yoonchae'], related: ['itzy-ryujin'] },
  { slug: 'kol-belle', stage: 'Belle', real: 'Belle Choi (벨)', group: 'KISS OF LIFE', era: '4 代', role: 'Leader / Main Vocal', ui: 'r&b main vocal · groove brand voice', personality: '4代队长·r&b·jazzy', vibe: 'r&b 唱腔 · groove leader', attitude: 'shhh', helpers: ['mmm-solar','rv-seulgi'], related: ['nmixx-haewon'] },
  { slug: 'kol-haneul', stage: 'Haneul', real: 'Kim Ha-neul (김하늘)', group: 'KISS OF LIFE', era: '4 代', role: 'Main Rapper / Producer', ui: 'producer rapper · self-made hook', personality: '4代rapper·制作人·sharp', vibe: '自制曲 producer rapper', attitude: 'bad news', helpers: ['idle-soyeon','itzy-chaeryeong'], related: ['tara-hyomin'] },

  // KiiiKiii (5 代 · Starship Y2K girl crush) — leesa 已存在
  { slug: 'kiii-sui', stage: 'Sui', real: 'Sui (수이)', group: 'KiiiKiii', era: '5 代', role: 'Leader / Main Vocal', ui: '5代 leader · sharp brand voice', personality: '5代队长·main vocal·sharp', vibe: '新生代 5 代队长 · clean main vocal', attitude: 'i do me', helpers: ['ive-yujin','illit-yunah'], related: ['izna-jiyoon'] },
  { slug: 'kiii-haum', stage: 'Haum', real: 'Haum (하음)', group: 'KiiiKiii', era: '5 代', role: 'Lead Dancer / Sub Vocal', ui: 'fresh motion · 5代 dance hook', personality: '5代dancer·清新·活力', vibe: '5 代 dance pulse · 清新能量', attitude: 'i do me', helpers: ['ive-rei','illit-iroha'], related: ['nmixx-jiwoo'] },
  { slug: 'kiii-kya', stage: 'Kya', real: 'Kya (카야)', group: 'KiiiKiii', era: '5 代', role: 'Main Rapper / Lead Dancer', ui: 'rapper hook · sharp tagline', personality: '5代rapper·sharp·attitude', vibe: '5 代 sharp rapper · 短句 hook', attitude: 'i do me', helpers: ['nmixx-bae','itzy-ryujin'], related: ['idle-soyeon'] },
  { slug: 'kiii-kasia', stage: 'Kasia', real: 'Kasia (카샤)', group: 'KiiiKiii', era: '5 代', role: 'Visual / Sub Vocal / Maknae', ui: 'visual maknae hero · fresh KV', personality: '5代maknae·visual·清纯', vibe: '5 代清新门面 · maknae hero', attitude: 'i do me', helpers: ['ive-leeseo','nj-hyein'], related: ['illit-wonhee'] },

  // Girl's Day (2.5 代) — sojin 已存在
  { slug: 'girlsday-minah', stage: 'Minah', real: 'Bang Min-ah (방민아)', group: "Girl's Day", era: '2.5 代', role: 'Main Vocal', ui: 'main vocal · 甜美 microcopy', personality: '2.5代主唱·甜美·邻家', vibe: '邻家 main vocal · 甜美音色', attitude: 'female president', helpers: ['apink-eunji','snsd-tiffany'], related: ['sistar-soyou'] },
  { slug: 'girlsday-yura', stage: 'Yura', real: 'Kim Ah-young (김아영)', group: "Girl's Day", era: '2.5 代', role: 'Lead Dancer / Visual', ui: 'sexy motion hook · 长腿 hero', personality: '2.5代dancer·性感·腿', vibe: '舞蹈担当 · 性感 visual', attitude: 'something', helpers: ['aoa-jimin','sistar-bora'], related: ['fx-victoria'] },
  { slug: 'girlsday-hyeri', stage: 'Hyeri', real: 'Lee Hye-ri (이혜리)', group: "Girl's Day", era: '2.5 代', role: 'Maknae / Vocal / Actress', ui: 'cross-platform 出圈 brand voice', personality: '2.5代maknae·演员·爱嘤', vibe: '应回我的 1988 国民妹妹', attitude: 'expectation', helpers: ['mmm-wheein','iu'], related: ['apink-hayoung'] },

  // SISTAR (2.5 代 · 夏日清爽) — hyolyn 已存在
  { slug: 'sistar-bora', stage: 'Bora', real: 'Yoon Bo-ra (윤보라)', group: 'SISTAR', era: '2.5 代', role: 'Main Rapper / Lead Dancer', ui: '夏日 rapper hook · 短句 tagline', personality: '2.5代rapper·腿·夏日', vibe: '夏日 rapper · 长腿担当', attitude: 'shake it', helpers: ['aoa-jimin','girlsday-yura'], related: ['mmm-hwasa'] },
  { slug: 'sistar-soyou', stage: 'Soyou', real: 'Kang Ji-hyun (강지현)', group: 'SISTAR', era: '2.5 代', role: 'Lead Vocal', ui: 'duet vocal · 二重唱 harmony', personality: '2.5代副主唱·二重唱·情歌', vibe: '二重唱女王 · 情歌氛围', attitude: 'some', helpers: ['mmm-solar','snsd-tiffany'], related: ['girlsday-minah'] },
  { slug: 'sistar-dasom', stage: 'Dasom', real: 'Kim Da-som (김다솜)', group: 'SISTAR', era: '2.5 代', role: 'Visual / Sub Vocal / Maknae', ui: 'maknae visual · 夏日 hero KV', personality: '2.5代maknae·visual·甜美', vibe: '夏日 maknae 门面 · 甜美 visual', attitude: 'touch my body', helpers: ['twice-tzuyu','aoa-seolhyun'], related: ['apink-naeun'] },
];

const tpl = (i) => `---
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
- **关联圣人**: ${JSON.stringify(i.related)}

## 🌐 触发短语

- \`"用 ${i.stage} 风格设计 ..."\`
- \`"${i.group} 议会"\`
- \`"${i.attitude} 的 UI"\`
- \`"${i.ui} ..."\`

---

> 🎤 ***"${i.attitude}"*** — ${i.stage} of ${i.group}
`;

let created = 0, skipped = 0;
for (const i of LINEUPS) {
  const p = path.join(AGENTS, `${i.slug}.md`);
  if (fs.existsSync(p)) { skipped++; continue; }
  fs.writeFileSync(p, tpl(i), 'utf8');
  created++;
}
console.log(`✅ created=${created}  skipped=${skipped}`);
