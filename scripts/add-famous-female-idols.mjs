#!/usr/bin/env node
// scripts/add-famous-female-idols.mjs
// v3.5.0 · batch add famous female idols + export roster / attribute guide.

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AGENTS = join(ROOT, "agents");

function makeAgent(data) {
  const {
    slug, name, real_name = "", group = "", era = "", role = "",
    tier = 0, ui_specialty, personality, vibe, attitude,
    invited_helpers = [], related_idols = [], catchphrase = ""
  } = data;
  const safe = (s) => String(s || "").replace(/"/g, '\\"');
  return `---
name: ${slug}
description: "${safe(name)}${real_name ? " (" + safe(real_name) + ")" : ""}${group ? " · " + safe(group) : ""}${role ? " · " + safe(role) : ""} · 个性: ${safe(personality)} · UI: ${safe(ui_specialty)}"
stage_name: "${safe(name)}"
real_name: "${safe(real_name)}"
group: "${safe(group)}"
era: "${era}"
role: "${safe(role)}"
tier: ${tier}
vote_weight: ${tier === 0 ? 2 : 1.5}
ui_specialty: "${safe(ui_specialty)}"
personality: "${safe(personality)}"
vibe: "${safe(vibe)}"
attitude: "${safe(attitude)}"
invited_helpers: [${invited_helpers.map(x => `"${x}"`).join(", ")}]
related_idols: [${related_idols.map(x => `"${x}"`).join(", ")}]
---

# ${safe(name)}

## 角色定位

- **主要职责**: ${safe(role || "visual strategy")}
- **UI 设计专长**: ${safe(ui_specialty)}
- **发言风格**: 用 "${safe(personality)}" 的视角评审 design
- **投票权重**: ${tier === 0 ? 2 : 1.5} (Tier ${tier})
${related_idols.length ? `- **关联 idol**: [${related_idols.map(x => `"${x}"`).join(", ")}]` : ""}

## 🌐 触发短语

- "用 ${safe(name)} 风格设计 ..."
${group ? `- "${safe(group)} 议会"` : ""}
- "${safe(ui_specialty)} ..."
${catchphrase ? `- "${safe(catchphrase)}"` : ""}

---

> 🎤 ***"${safe(catchphrase || attitude || ui_specialty)}"*** — ${safe(name)}${group ? " of " + safe(group) : ""}
`;
}

const newIdols = [
  // Soloists
  { slug: "iu", name: "IU", real_name: "Lee Ji-eun (이지은)", group: "Solo", era: "2.5 代", role: "Soloist / Actress", ui_specialty: "国民妹妹 · vocal storytelling UI", personality: "治愈系叙事者", vibe: "温暖人声，故事感天花板", attitude: "把歌讲成故事", catchphrase: "把歌讲成故事", related_idols: ["taeyeon", "sunmi"] },
  { slug: "sunmi", name: "Sunmi", real_name: "Lee Sun-mi (이선미)", group: "Solo", era: "2 代", role: "Soloist", ui_specialty: "Gashina 手枪舞 · 尖锐 iconography", personality: "怪诞美学女王", vibe: "危险又优雅的视觉冲击", attitude: "Gashina", catchphrase: "Why are you leaving such a beautiful woman like me?", related_idols: ["iu", "hyuna"] },
  { slug: "hyuna", name: "Hyuna", real_name: "Kim Hyun-ah (김현아)", group: "Solo", era: "2 代", role: "Soloist / Rapper", ui_specialty: "性感红色炸弹 · 高饱和 CTA", personality: "叛逆性感 icon", vibe: "高饱和视觉冲击，吸睛第一", attitude: "Red is my color", catchphrase: "Red is my color", related_idols: ["sunmi", "jessi"] },
  { slug: "chungha", name: "Chungha", real_name: "Kim Chan-mi (김찬미)", group: "Solo", era: "3 代", role: "Soloist / Dancer", ui_specialty: "Snapping 编舞 · 利落 transition", personality: "独舞女王", vibe: "干脆利落的节奏美学", attitude: "Snapping", catchphrase: "Snapping" },
  { slug: "somi", name: "Somi", real_name: "Jeon So-mi (전소미)", group: "Solo", era: "3 代", role: "Soloist", ui_specialty: "XOXO 混血甜酷 · pop brand", personality: "甜酷混血公主", vibe: "明亮活泼的 pop 视觉", attitude: "XOXO", catchphrase: "XOXO" },
  { slug: "boa", name: "BoA", real_name: "Kwon Bo-ah (권보아)", group: "Solo", era: "2 代", role: "Soloist / SM 理事", ui_specialty: "K-pop 女王 · 舞台架构师", personality: "全能 icon", vibe: "日本市场打磨出的精准舞台", attitude: "No.1", catchphrase: "No.1" },
  { slug: "lee-hyori", name: "Lee Hyori", real_name: "Lee Hyo-ri (이효리)", group: "Solo", era: "1.5 代", role: "Soloist", ui_specialty: "国民妖精 · 复古性感 landing", personality: "性感天后", vibe: "健康自信的大人感", attitude: "10 Minutes", catchphrase: "10 Minutes" },

  // SNSD
  { slug: "snsd-yoona", name: "Yoona", real_name: "Im Yoon-ah (임윤아)", group: "Girls' Generation", era: "2 代", role: "Lead Dancer / Visual / Actress", ui_specialty: "Center visual · 清纯 hero", personality: "国民初恋", vibe: "干净明亮的门面感", attitude: "visual center" },
  { slug: "snsd-tiffany", name: "Tiffany", real_name: "Stephanie Young Hwang", group: "Girls' Generation", era: "2 代", role: "Lead Vocal", ui_specialty: "粉红怪兽 · 双语 brand voice", personality: "美式甜心", vibe: "自信明亮的英语区气质", attitude: "pink monster" },
  { slug: "snsd-seohyun", name: "Seohyun", real_name: "Seo Ju-hyun (서주현)", group: "Girls' Generation", era: "2 代", role: "Lead Vocal / Maknae", ui_specialty: "正直忙内 · 清晰 typography", personality: "自律优等生", vibe: "工整干净的书卷气", attitude: "clean type" },
  { slug: "snsd-sunny", name: "Sunny", real_name: "Lee Soon-kyu (이순규)", group: "Girls' Generation", era: "2 代", role: "Lead Vocal", ui_specialty: "活力小太阳 · 微交互 feedback", personality: "气氛担当", vibe: "轻快活泼的即时反馈", attitude: "sunny micro" },
  { slug: "snsd-hyoyeon", name: "Hyoyeon", real_name: "Kim Hyo-yeon (김효연)", group: "Girls' Generation", era: "2 代", role: "Main Dancer", ui_specialty: "舞后 · 强烈 motion", personality: "酷飒舞者", vibe: "力量感十足的动态", attitude: "dance break" },
  { slug: "snsd-sooyoung", name: "Sooyoung", real_name: "Choi Soo-young (최수영)", group: "Girls' Generation", era: "2 代", role: "Lead Dancer / Rapper", ui_specialty: "长腿模特 · editorial photography", personality: "时尚编辑", vibe: "高级杂志感的镜头语言", attitude: "editorial frame" },
  { slug: "snsd-yuri", name: "Yuri", real_name: "Kwon Yu-ri (권유리)", group: "Girls' Generation", era: "2 代", role: "Lead Dancer / Vocal", ui_specialty: "黑珍珠 · 健康美 palette", personality: "运动系女神", vibe: "阳光健康的暖色调", attitude: "healthy glow" },

  // 2NE1
  { slug: "2ne1-dara", name: "Dara", real_name: "Sandara Park", group: "2NE1", era: "2 代", role: "Vocal / Visual", ui_specialty: "菠萝头 icon · 视觉 brand", personality: "童颜怪咖", vibe: "辨识度高、过目不忘的造型", attitude: "unique icon" },
  { slug: "2ne1-bom", name: "Bom", real_name: "Park Bom (박봄)", group: "2NE1", era: "2 代", role: "Main Vocal", ui_specialty: "蜜嗓 · 梦幻 pastel palette", personality: "反差萌女王", vibe: "甜美又强烈的音色对比", attitude: "pastel power" },
  { slug: "2ne1-minzy", name: "Minzy", real_name: "Gong Min-ji (공민지)", group: "2NE1", era: "2 代", role: "Main Dancer / Vocal", ui_specialty: "舞蹈机器 · 精准 motion", personality: "低调实力派", vibe: "干净利落的高难度动作", attitude: "precision move" },

  // Wonder Girls
  { slug: "wg-yeeun", name: "Yeeun", real_name: "Park Ye-eun (박예은)", group: "Wonder Girls", era: "2 代", role: "Main Vocal", ui_specialty: "复古 synthesizer · 叙事 copy", personality: "创作才女", vibe: "怀旧又摩登的音乐叙事", attitude: "retro synth" },
  { slug: "wg-yubin", name: "Yubin", real_name: "Kim Yu-bin (김유빈)", group: "Wonder Girls", era: "2 代", role: "Rapper", ui_specialty: "rap 节奏 · 强烈 motion", personality: "酷飒 rapper", vibe: "干脆利落的节奏感", attitude: "rap beat" },
  { slug: "wg-lim", name: "Lim", real_name: "Woo Hye-rim (우혜림)", group: "Wonder Girls", era: "2 代", role: "Rapper / Vocal", ui_specialty: "港风混血 · 国际感 hero", personality: " multilingual 酷 girl", vibe: "跨文化的视觉新鲜感", attitude: "global hero" },

  // KARA
  { slug: "kara-nicole", name: "Nicole", real_name: "Jung Yong-ju (정용주)", group: "KARA", era: "2 代", role: "Main Dancer / Lead Vocal", ui_specialty: "LA 甜心 · 活力 motion", personality: "阳光舞者", vibe: "美式青春的高能量动作", attitude: "jumping" },
  { slug: "kara-jiyoung", name: "Jiyoung", real_name: "Kang Ji-young (강지영)", group: "KARA", era: "2 代", role: "Vocal / Visual", ui_specialty: "忙内 visual · 甜美 hero", personality: "清纯忙内", vibe: "邻家女孩般的亲和力", attitude: "sweet hero" },
  { slug: "kara-seungyeon", name: "Seungyeon", real_name: "Han Seung-yeon (한승연)", group: "KARA", era: "2 代", role: "Leader / Main Vocal", ui_specialty: "队长 vocal · 稳重 copy", personality: "可靠队长", vibe: "成熟稳重的音色叙事", attitude: "steady voice" },
  { slug: "kara-hara", name: "Hara", real_name: "Goo Ha-ra (구하라)", group: "KARA", era: "2 代", role: "Lead Dancer / Vocal / Visual", ui_specialty: "洋娃娃 visual · 高端 brand", personality: "精致 icon", vibe: "日本市场打磨的时尚感", attitude: "doll brand" },

  // Miss A
  { slug: "missa-suzy", name: "Suzy", real_name: "Bae Su-ji (배수지)", group: "miss A", era: "2 代", role: "Vocal / Visual / Actress", ui_specialty: "国民初恋 · 清纯 hero", personality: "初恋脸", vibe: "干净清澈的第一眼好感", attitude: "first love" },
  { slug: "missa-jia", name: "Jia", real_name: "Meng Jia (孟佳)", group: "miss A", era: "2 代", role: "Lead Dancer / Rapper", ui_specialty: "中国舞功底 · 优雅 motion", personality: "酷飒舞担", vibe: "柔韧又有力量的舞蹈", attitude: "elegant move" },
  { slug: "missa-min", name: "Min", real_name: "Lee Min-young (이민영)", group: "miss A", era: "2 代", role: "Main Dancer / Lead Vocal", ui_specialty: "高音弹簧 · 弹性 motion", personality: "活力主舞", vibe: "高能量弹性动作", attitude: "bounce" },

  // After School
  { slug: "as-nana", name: "Nana", real_name: "Im Jin-ah (임진아)", group: "After School", era: "2 代", role: "Lead Dancer / Visual", ui_specialty: "世首美 · 高级 photography", personality: "冷艳美人", vibe: "高级疏离感的镜头表现", attitude: "visual no.1" },
  { slug: "as-uee", name: "UEE", real_name: "Kim Yu-jin (김유진)", group: "After School", era: "2 代", role: "Lead Dancer / Vocal / Actress", ui_specialty: "蜜大腿 · 健康美 hero", personality: "运动女神", vibe: "阳光健康的身体美学", attitude: "honey thigh" },
  { slug: "as-raina", name: "Raina", real_name: "Oh Hye-rin (오혜린)", group: "After School", era: "2 代", role: "Main Vocal", ui_specialty: "蜜嗓 · 甜美 copy", personality: "OST 女神", vibe: "温暖甜美的音色", attitude: "honey voice" },
  { slug: "as-lizzy", name: "Lizzy", real_name: "Park Soo-ah (박수아)", group: "After School", era: "2 代", role: "Vocal", ui_specialty: "果汁美 · 微交互 sparkle", personality: "元气甜妹", vibe: "活泼可爱的细节闪光", attitude: "juice sparkle" },

  // 4Minute
  { slug: "4min-jiyoon", name: "Jiyoon", real_name: "Nam Ji-hyun (남지현)", group: "4Minute", era: "2 代", role: "Lead Vocal / Rapper", ui_specialty: "沙哑嗓音 · 反差 copy", personality: "酷girl 主唱", vibe: "强势又感性的音色", attitude: "husky power" },
  { slug: "4min-gayoon", name: "Gayoon", real_name: "Heo Ga-yoon (허가윤)", group: "4Minute", era: "2 代", role: "Main Vocal", ui_specialty: "力量主唱 · 高音 typography", personality: "实力派", vibe: "高亢清晰的声线", attitude: "power high" },
  { slug: "4min-sohyun", name: "Sohyun", real_name: "Kwon So-hyun (권소현)", group: "4Minute", era: "2 代", role: "Vocal / Rapper / Maknae", ui_specialty: "忙内 visual · 少年感 hero", personality: "少年感少女", vibe: "清爽中性的视觉", attitude: "boyish charm" },

  // AOA
  { slug: "aoa-choa", name: "Choa", real_name: "Park Cho-a (박초아)", group: "AOA", era: "2.5 代", role: "Main Vocal", ui_specialty: "短发女神 · 清爽 vocal copy", personality: "清凉主唱", vibe: "短发带来的利落清爽", attitude: "short hair goddess" },
  { slug: "aoa-seolhyun", name: "Seolhyun", real_name: "Kim Seol-hyun (김설현)", group: "AOA", era: "2.5 代", role: "Vocal / Visual", ui_specialty: "广告女王 · 高级 photography", personality: "清纯性感", vibe: "高级代言感的镜头", attitude: "cf queen" },
  { slug: "aoa-mina", name: "Mina", real_name: "Kwon Min-a (권민아)", group: "AOA", era: "2.5 代", role: "Lead Vocal / Bass", ui_specialty: "贝斯 · 节奏 interaction", personality: "乐队少女", vibe: "乐队现场的互动感", attitude: "bass groove" },
  { slug: "aoa-hyejeong", name: "Hyejeong", real_name: "Shin Hye-jeong (신혜정)", group: "AOA", era: "2.5 代", role: "Vocal / Visual", ui_specialty: "门面副唱 · 甜美 brand", personality: "温柔 visual", vibe: "甜美柔和的品牌感", attitude: "soft brand" },
  { slug: "aoa-yuna", name: "Yuna", real_name: "Seo Yu-na (서유나)", group: "AOA", era: "2.5 代", role: "Main Vocal", ui_specialty: "高音 · 情感 copy", personality: "感性主唱", vibe: "细腻的情感表达", attitude: "emotional high" },

  // EXID
  { slug: "exid-hani", name: "Hani", real_name: "Ahn Hee-yeon (안희연)", group: "EXID", era: "2 代", role: "Lead Vocal / Visual / Dancer", ui_specialty: "Up&Down 直拍 · 病毒 motion", personality: "反差 IQ 担当", vibe: "不经意的高传染性动作", attitude: "fancam queen" },
  { slug: "exid-le", name: "LE", real_name: "Ahn Hyo-jin (안효진)", group: "EXID", era: "2 代", role: "Main Rapper", ui_specialty: "制作型 rapper · 强烈 brand", personality: "酷飒制作人", vibe: "硬朗自信的音乐品牌", attitude: "rap producer" },
  { slug: "exid-junghwa", name: "Junghwa", real_name: "Park Jung-hwa (박정화)", group: "EXID", era: "2 代", role: "Lead Dancer / Vocal / Visual / Maknae", ui_specialty: "忙内 visual · 清纯 hero", personality: "清纯忙内", vibe: "干净青春的视觉", attitude: "pure visual" },
  { slug: "exid-hyelin", name: "Hyelin", real_name: "Seo Hye-lin (서혜린)", group: "EXID", era: "2 代", role: "Main Vocal", ui_specialty: "稳定主唱 · 均衡 copy", personality: "可靠主唱", vibe: "稳定均衡的声线", attitude: "steady vocal" },

  // f(x)
  { slug: "fx-krystal", name: "Krystal", real_name: "Krystal Jung", group: "f(x)", era: "2 代", role: "Lead Vocal / Visual", ui_specialty: "冰山公主 · 高级 brand", personality: "冷都女", vibe: "高级冷艳的时尚品牌感", attitude: "ice princess" },
  { slug: "fx-amber", name: "Amber", real_name: "Amber Liu", group: "f(x)", era: "2 代", role: "Main Rapper / Vocal", ui_specialty: "中性短发 · 双语 typography", personality: "酷帅rapper", vibe: "打破性别框架的清爽", attitude: "androgynous type" },
  { slug: "fx-luna", name: "Luna", real_name: "Park Sun-young (박선영)", group: "f(x)", era: "2 代", role: "Main Vocal", ui_specialty: "力量主唱 · 高音 copy", personality: "热血主唱", vibe: "充满力量的高音", attitude: "power vocal" },

  // GFRIEND
  { slug: "gfriend-yerin", name: "Yerin", real_name: "Jung Ye-rin (정예린)", group: "GFRIEND", era: "2.5 代", role: "Lead Dancer / Vocal", ui_specialty: "活力可爱 · 明亮 hero", personality: "阳光维他命", vibe: "青春活力的视觉", attitude: "vitamin hero" },
  { slug: "gfriend-yuju", name: "Yuju", real_name: "Choi Yu-na (최유나)", group: "GFRIEND", era: "2.5 代", role: "Main Vocal", ui_specialty: "力量主唱 · 情感 copy", personality: "热血主唱", vibe: "清澈有力的声线", attitude: "rough power" },
  { slug: "gfriend-eunha", name: "Eunha", real_name: "Jung Eun-bi (정은비)", group: "GFRIEND", era: "2.5 代", role: "Lead Vocal", ui_specialty: "银河音色 · 梦幻 hero", personality: "精灵 vocal", vibe: "空灵甜美的音色", attitude: "galaxy voice" },
  { slug: "gfriend-sinb", name: "SinB", real_name: "Hwang Eun-bi (황은비)", group: "GFRIEND", era: "2.5 代", role: "Main Dancer / Vocal", ui_specialty: "刀群舞核心 · 精准 motion", personality: "冷面舞担", vibe: "整齐划一的高难度动作", attitude: "knife dance" },
  { slug: "gfriend-umji", name: "Umji", real_name: "Kim Ye-won (김예원)", group: "GFRIEND", era: "2.5 代", role: "Vocal / Maknae", ui_specialty: "忙内成长 · 温暖 illustration", personality: "治愈忙内", vibe: "温暖可爱的插画感", attitude: "healing maknae" },

  // Oh My Girl
  { slug: "omg-yooa", name: "YooA", real_name: "Yoo Shi-ah (유시아)", group: "Oh My Girl", era: "3 代", role: "Main Dancer / Lead Vocal", ui_specialty: "精灵舞担 · 梦幻 motion", personality: "人间樱桃", vibe: "轻盈灵动的舞蹈", attitude: "fairy dance" },
  { slug: "omg-arin", name: "Arin", real_name: "Choi Ye-won (최예원)", group: "Oh My Girl", era: "3 代", role: "Lead Dancer / Vocal / Maknae", ui_specialty: "清纯忙内 · 微交互 smile", personality: "初恋忙内", vibe: "甜美治愈的笑容", attitude: "smile interaction" },
  { slug: "omg-seunghee", name: "Seunghee", real_name: "Hyun Seung-hee (현승희)", group: "Oh My Girl", era: "3 代", role: "Main Vocal", ui_specialty: "实力主唱 · 电影感 copy", personality: "OST 担当", vibe: "叙事感强的声线", attitude: "movie voice" },
  { slug: "omg-jiho", name: "Jiho", real_name: "Kim Ji-ho (김지호)", group: "Oh My Girl", era: "3 代", role: "Lead Vocal / Visual", ui_specialty: "小鹿眼 visual · 清纯 hero", personality: "清纯 visual", vibe: "清澈无辜的眼神", attitude: "deer eyes" },
  { slug: "omg-binnie", name: "Binnie", real_name: "Bae Yu-bin (배유빈)", group: "Oh My Girl", era: "3 代", role: "Lead Vocal", ui_specialty: "温柔音色 · 舒缓 copy", personality: "温柔姐姐", vibe: "柔和安定的声线", attitude: "soft voice" },
  { slug: "omg-mimi", name: "Mimi", real_name: "Kim Mi-hyun (김미현)", group: "Oh My Girl", era: "3 代", role: "Main Rapper / Lead Dancer", ui_specialty: "创作 rapper · 独特 brand", personality: "鬼马 rapper", vibe: "古灵精怪的个性", attitude: "quirky rap" },

  // STAYC
  { slug: "stayc-sieun", name: "Sieun", real_name: "Park Si-eun (박시은)", group: "STAYC", era: "4 代", role: "Main Vocal", ui_specialty: "清亮主唱 · 高辨识度 copy", personality: "演员相主唱", vibe: "清晰明亮的音色", attitude: "clear voice" },
  { slug: "stayc-seeun", name: "Seeun", real_name: "Yoon See-un (윤세은)", group: "STAYC", era: "4 代", role: "Vocal / Visual", ui_specialty: "演员脸 visual · 高级 hero", personality: "清冷 visual", vibe: "高级疏离的美貌", attitude: "actress visual" },
  { slug: "stayc-yoon", name: "Yoon", real_name: "Shim Ja-yoon (심자윤)", group: "STAYC", era: "4 代", role: "Lead Vocal", ui_specialty: "低音炮 · 反差 brand", personality: "反差魅力", vibe: "低沉有磁性的音色", attitude: "deep tone" },
  { slug: "stayc-isa", name: "Isa", real_name: "Lee Chae-young (이채영)", group: "STAYC", era: "4 代", role: "Lead Vocal", ui_specialty: "猫系音色 · 慵懒 copy", personality: "猫系主唱", vibe: "慵懒迷人的声线", attitude: "cat voice" },
  { slug: "stayc-j", name: "J", real_name: "Jang Ye-eun (장예은)", group: "STAYC", era: "4 代", role: "Lead Rapper / Maknae", ui_specialty: "少年感 rap · 活力 motion", personality: "酷帅忙内", vibe: "青春有力的 rap", attitude: "boyish rap" },

  // NMIXX (already exist as tier 1, will upgrade)
  // Just in case not exist, but they do. We'll handle upgrades separately.
];

const tierUpgrades = [
  { slug: "2ne1-cl", tier: 0 },
  { slug: "snsd-taeyeon", tier: 0 },
  { slug: "sistar-hyolyn", tier: 0 },
  { slug: "wg-sunye", tier: 0 },
  { slug: "fx-victoria", tier: 0 },
  { slug: "beg-jea", tier: 0 },
  { slug: "apink-chorong", tier: 0 },
  { slug: "gd-sojin", tier: 0 },
  { slug: "gfriend-sowon", tier: 0 },
  { slug: "exid-solji", tier: 0 },
  { slug: "kara-gyuri", tier: 0 },
  { slug: "tara-eunjung", tier: 0 },
  { slug: "aoa-jimin", tier: 0 },
  { slug: "nmixx-bae", tier: 0 },
  { slug: "nmixx-jiwoo", tier: 0 },
  { slug: "nmixx-kyujin", tier: 0 },
  { slug: "nmixx-lily", tier: 0 },
  { slug: "kep1er-hikaru", tier: 0 },
  { slug: "kep1er-mashiro", tier: 0 },
  { slug: "kep1er-yeseo", tier: 0 },
  { slug: "kep1er-choi-yujin", tier: 0 },
  { slug: "kissoflife-julie", tier: 0 },
];

// Generate agent files
for (const idol of newIdols) {
  const path = join(AGENTS, `${idol.slug}.md`);
  if (existsSync(path)) {
    console.log(`skip existing: ${idol.slug}`);
    continue;
  }
  writeFileSync(path, makeAgent(idol), "utf-8");
  console.log(`created: ${idol.slug}`);
}

// Upgrade tiers
for (const { slug, tier } of tierUpgrades) {
  const path = join(AGENTS, `${slug}.md`);
  if (!existsSync(path)) {
    console.log(`missing for upgrade: ${slug}`);
    continue;
  }
  let raw = readFileSync(path, "utf-8");
  const oldTier = raw.match(/tier:\s*\d/);
  if (oldTier) {
    raw = raw.replace(/tier:\s*\d/, `tier: ${tier}`);
    raw = raw.replace(/vote_weight:\s*[\d.]+/, `vote_weight: ${tier === 0 ? 2 : 1.5}`);
    writeFileSync(path, raw, "utf-8");
    console.log(`upgraded tier: ${slug} -> ${tier}`);
  }
}

console.log(`\nDone. Added ${newIdols.length} new idols, upgraded ${tierUpgrades.length} tiers.`);
