#!/usr/bin/env node
// scripts/gen-v30-eras.mjs
// v3.0 Phase 1 · Era Universe 数据注入器
// 把 `eras:` 字段插入到现有 groups/*.md frontmatter (在 signature_tracks 之后)
// 12 顶级团: 每团 3-4 个 era; 其余团: 1 个 default era 兜底

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GROUPS = join(ROOT, "groups");

// ============ 12 顶级团 · 完整 era 数据 ============

const TOP_ERAS = {
  twice: [
    {
      era_slug: "cheer_up", era_name: "Cheer Up Era", year: 2016, album: "Page Two",
      palette: { primary: "#FFB6E1", secondary: "#FFEFA0", accent: "#FF80AB" },
      mood: ["甜美", "校园", "高饱和", "shooting star"],
      typography_keywords: ["圆润", "贴纸感", "Y2K", "marker"],
      mv_grammar: "校园 + 操场 + 粉色滤镜 + cheerleader",
      photocard_style: "polaroid + sticker",
      generation: "3代初",
      motion_hint: { bpm: 132, easing: "snappy bouncy", duration: "short loop" },
      forbidden: ["工业灰", "冷调", "杂志大片", "极简留白"]
    },
    {
      era_slug: "fancy", era_name: "Fancy Era", year: 2019, album: "Fancy You",
      palette: { primary: "#2E2E3E", secondary: "#B8A0C9", accent: "#D4AF7A" },
      mood: ["冷感", "高级", "杂志", "都市孤独"],
      typography_keywords: ["Didot", "Bodoni", "衬线", "大留白"],
      mv_grammar: "工业空间 + 冷光 + 定格凝视 + 高对比",
      photocard_style: "杂志大片 + 哑光",
      generation: "3代末",
      motion_hint: { bpm: 122, easing: "slow burn", duration: "long sustain" },
      forbidden: ["Y2K 贴纸", "高饱和粉", "校园元素", "可爱字体"]
    },
    {
      era_slug: "formula_of_love", era_name: "Formula of Love Era", year: 2021, album: "Formula of Love: O+T=<3",
      palette: { primary: "#E8C5E5", secondary: "#A4D4F4", accent: "#F4D26B" },
      mood: ["甜糖", "实验室", "科学少女", "粉彩"],
      typography_keywords: ["手写体 + 等宽 mono", "化学公式排版", "试管 ascii"],
      mv_grammar: "实验室 + 试管 + 化学公式 + 糖果",
      photocard_style: "化学卡片 + 试纸贴",
      generation: "4代初",
      motion_hint: { bpm: 110, easing: "bubble pop", duration: "medium" },
      forbidden: ["工业冷调", "monochrome"]
    },
    {
      era_slug: "ready_to_be", era_name: "Ready to Be Era", year: 2023, album: "Ready to Be",
      palette: { primary: "#FFFFFF", secondary: "#F0E6D2", accent: "#000000" },
      mood: ["极简", "蓄势", "成熟", "白色力量"],
      typography_keywords: ["sans serif 紧凑", "极简 hero", "数字 1 切"],
      mv_grammar: "极简白空间 + 大字母 + 静态构图",
      photocard_style: "极简白底 + 一字标题",
      generation: "4代中",
      motion_hint: { bpm: 102, easing: "calm precise", duration: "long sustain" },
      forbidden: ["糖果色", "贴纸", "校园", "繁复"]
    }
  ],
  bp: [
    {
      era_slug: "square_one", era_name: "Square One Era", year: 2016, album: "Square One",
      palette: { primary: "#FF1493", secondary: "#000000", accent: "#FFD700" },
      mood: ["出道宣战", "炸街", "硬核"],
      typography_keywords: ["sans serif bold", "标点炸裂", "all caps"],
      mv_grammar: "都市街头 + 高对比 + 4 人对决站位",
      photocard_style: "纯黑底 + 单一 hot pink 描边",
      generation: "3代",
      motion_hint: { bpm: 130, easing: "punch", duration: "short hit" },
      forbidden: ["治愈系", "可爱字体", "粉嫩"]
    },
    {
      era_slug: "kill_this_love", era_name: "Kill This Love Era", year: 2019, album: "Kill This Love",
      palette: { primary: "#000000", secondary: "#FF0066", accent: "#B8860B" },
      mood: ["军队", "宣战", "brass", "巴洛克"],
      typography_keywords: ["serif + sans 撞色", "金属箔感", "对称镜像"],
      mv_grammar: "战车 + 大军 + 铜管军号 + 黑白巴洛克",
      photocard_style: "封面式金箔",
      generation: "3代中",
      motion_hint: { bpm: 132, easing: "march", duration: "long sustain" },
      forbidden: ["治愈", "甜美", "粉嫩"]
    },
    {
      era_slug: "born_pink", era_name: "Born Pink Era", year: 2022, album: "Born Pink",
      palette: { primary: "#FF1493", secondary: "#0A0A0A", accent: "#FFFFFF" },
      mood: ["奢华黑粉", "Pink Venom", "毒"],
      typography_keywords: ["奢侈品 wordmark", "极简全大写", "黑底粉描"],
      mv_grammar: "蛇 + 蓝染水墨 + 极致对比 + 奢侈品空间",
      photocard_style: "奢侈品包装片",
      generation: "3代末",
      motion_hint: { bpm: 90, easing: "trap slow", duration: "long sustain" },
      forbidden: ["校园", "贴纸", "可爱"]
    }
  ],
  ive: [
    {
      era_slug: "eleven", era_name: "ELEVEN Era", year: 2021, album: "ELEVEN",
      palette: { primary: "#E8B7C9", secondary: "#FFFFFF", accent: "#C9A87C" },
      mood: ["出道公主", "数字宣告", "梦幻"],
      typography_keywords: ["serif elegant", "数字大字符", "象牙白底"],
      mv_grammar: "宫殿 + 镜子 + 数字 11 反复 + 公主登场",
      photocard_style: "公主肖像油画",
      generation: "4代",
      motion_hint: { bpm: 116, easing: "regal", duration: "medium" },
      forbidden: ["街头", "暗黑", "重口味"]
    },
    {
      era_slug: "after_like", era_name: "After Like Era", year: 2022, album: "After Like",
      palette: { primary: "#F5B5C5", secondary: "#9B7BB8", accent: "#FFF2CC" },
      mood: ["disco 复古", "I Will Survive", "甜炸"],
      typography_keywords: ["复古 disco", "rounded sans", "彩虹色"],
      mv_grammar: "夜总会 + 旋转球 + 高饱和复古",
      photocard_style: "复古唱片封套",
      generation: "4代",
      motion_hint: { bpm: 130, easing: "disco bounce", duration: "loop" },
      forbidden: ["极简", "冷调"]
    },
    {
      era_slug: "i_am", era_name: "I AM Era", year: 2023, album: "I've IVE",
      palette: { primary: "#C9F5E8", secondary: "#FFFFFF", accent: "#7CB9E8" },
      mood: ["自我宣言", "薄荷糖", "清新"],
      typography_keywords: ["大写 I AM", "几何无衬线", "薄荷色字"],
      mv_grammar: "森林 + 薄荷糖 + 自然清新 + 镜面反射",
      photocard_style: "薄荷糖盒包装",
      generation: "4代",
      motion_hint: { bpm: 116, easing: "fresh breeze", duration: "medium" },
      forbidden: ["暗黑", "工业"]
    },
    {
      era_slug: "i_have", era_name: "I HAVE Era", year: 2024, album: "I've MINE / IVE EMPATHY",
      palette: { primary: "#1A1A2E", secondary: "#E8D9C0", accent: "#D946EF" },
      mood: ["成熟蜕变", "暗夜公主", "magnetic"],
      typography_keywords: ["serif 现代", "金属紫", "夜色"],
      mv_grammar: "豪宅夜景 + 紫色霓虹 + 强 visual",
      photocard_style: "夜色金箔",
      generation: "4代末",
      motion_hint: { bpm: 100, easing: "magnetic pull", duration: "long sustain" },
      forbidden: ["校园清新", "公主梦幻"]
    }
  ],
  aespa: [
    {
      era_slug: "black_mamba", era_name: "Black Mamba Era", year: 2020, album: "SM Culture Universe Debut",
      palette: { primary: "#0F0F1E", secondary: "#FF00FF", accent: "#00FFE5" },
      mood: ["元宇宙", "AI 双生", "暗黑科技", "出道"],
      typography_keywords: ["glitch", "monospace 赛博", "镜像反转"],
      mv_grammar: "AI 虚拟空间 + 蛇 + 双重身份 + glitch",
      photocard_style: "全息卡 + AR 触发",
      generation: "4代初",
      motion_hint: { bpm: 132, easing: "glitch cut", duration: "fragmented" },
      forbidden: ["甜美", "校园", "暖色"]
    },
    {
      era_slug: "next_level", era_name: "Next Level Era", year: 2021, album: "Savage",
      palette: { primary: "#FF0080", secondary: "#1A1A1A", accent: "#FFE600" },
      mood: ["升级", "野性", "电子", "强势"],
      typography_keywords: ["all caps + 数字", "渐变描边", "电子游戏 HUD"],
      mv_grammar: "战车 + 沙漠 + 电子科技 + 战斗",
      photocard_style: "卡牌游戏卡",
      generation: "4代",
      motion_hint: { bpm: 110, easing: "level up", duration: "intense" },
      forbidden: ["柔美", "圆角"]
    },
    {
      era_slug: "drama", era_name: "Drama Era", year: 2023, album: "Drama",
      palette: { primary: "#7A0E5E", secondary: "#FFC75F", accent: "#000000" },
      mood: ["戏剧", "复仇", "歌剧", "巴洛克"],
      typography_keywords: ["serif 戏剧化", "金色描边", "对称构图"],
      mv_grammar: "歌剧院 + 黄金面具 + 戏剧化",
      photocard_style: "戏剧海报",
      generation: "4代末",
      motion_hint: { bpm: 120, easing: "dramatic build", duration: "long sustain" },
      forbidden: ["可爱", "清新"]
    },
    {
      era_slug: "supernova", era_name: "Supernova Era", year: 2024, album: "Armageddon",
      palette: { primary: "#00FFE5", secondary: "#0F0F1E", accent: "#FFFFFF" },
      mood: ["超新星", "宇宙", "极简未来"],
      typography_keywords: ["futuristic", "霓虹蓝", "极简数字"],
      mv_grammar: "宇宙 + 超新星爆炸 + 简洁线条",
      photocard_style: "霓虹蓝印刷",
      generation: "5代初",
      motion_hint: { bpm: 130, easing: "explosion", duration: "burst" },
      forbidden: ["巴洛克", "复古"]
    }
  ],
  nj: [
    {
      era_slug: "new_jeans_debut", era_name: "New Jeans Debut Era", year: 2022, album: "New Jeans",
      palette: { primary: "#FFFFFF", secondary: "#7BB1E8", accent: "#FFB6C1" },
      mood: ["Y2K 邻家", "校园", "牛仔", "纯真"],
      typography_keywords: ["手写体", "海报 collage", "丹宁蓝"],
      mv_grammar: "校园 + 老式录像带颗粒 + 自然光",
      photocard_style: "拍立得 + 手写注释",
      generation: "4代末",
      motion_hint: { bpm: 100, easing: "casual stroll", duration: "medium" },
      forbidden: ["奢华", "重金属", "巴洛克"]
    },
    {
      era_slug: "omg", era_name: "OMG Era", year: 2023, album: "OMG",
      palette: { primary: "#A4D4F4", secondary: "#FFE8C7", accent: "#FFB6C1" },
      mood: ["清新邻家", "卡通", "贴纸"],
      typography_keywords: ["卡通 sticker", "粉笔字", "彩色 mark"],
      mv_grammar: "教室 + 涂鸦 + 卡通滤镜",
      photocard_style: "卡通贴纸卡",
      generation: "4代末",
      motion_hint: { bpm: 96, easing: "playful", duration: "loop" },
      forbidden: ["奢华", "性感"]
    },
    {
      era_slug: "supershy", era_name: "Super Shy Era", year: 2023, album: "Get Up",
      palette: { primary: "#FFD9E0", secondary: "#A4E8C7", accent: "#FFE066" },
      mood: ["UK garage", "夏日", "害羞"],
      typography_keywords: ["手写慢字", "粉嫩 marker", "拍立得边框"],
      mv_grammar: "海边 + 跑动 + 自然光 + 拍立得",
      photocard_style: "拍立得 polaroid",
      generation: "4代末",
      motion_hint: { bpm: 130, easing: "shy bounce", duration: "short loop" },
      forbidden: ["暗黑", "正式衬线"]
    }
  ],
  itzy: [
    {
      era_slug: "dalla_dalla", era_name: "DALLA DALLA Era", year: 2019, album: "IT'z Different",
      palette: { primary: "#FF1493", secondary: "#FFE600", accent: "#00FFE5" },
      mood: ["自我", "宣告", "rainbow", "Z 世代"],
      typography_keywords: ["rainbow gradient", "手写大字", "贴纸"],
      mv_grammar: "高饱和街头 + 涂鸦 + Z 世代",
      photocard_style: "涂鸦卡",
      generation: "4代",
      motion_hint: { bpm: 122, easing: "snap pop", duration: "short" },
      forbidden: ["奢华", "极简"]
    },
    {
      era_slug: "wannabe", era_name: "WANNABE Era", year: 2020, album: "IT'z ME",
      palette: { primary: "#000000", secondary: "#FF0080", accent: "#FFFFFF" },
      mood: ["叛逆", "I do what I wanna do", "黑白粉"],
      typography_keywords: ["all caps 紧凑", "黑白对比", "粉色断点"],
      mv_grammar: "时装秀 + 镜头切换 + I do what I wanna do",
      photocard_style: "时装大片",
      generation: "4代",
      motion_hint: { bpm: 140, easing: "rebel", duration: "intense" },
      forbidden: ["甜美", "粉嫩"]
    },
    {
      era_slug: "born_to_be", era_name: "BORN TO BE Era", year: 2024, album: "BORN TO BE",
      palette: { primary: "#1A0033", secondary: "#FF003C", accent: "#FFFFFF" },
      mood: ["蓄力宣战", "暗黑", "5 代过渡"],
      typography_keywords: ["serif 暗黑", "血红", "罗马数字"],
      mv_grammar: "暗黑战场 + 血红 + 战士盔甲",
      photocard_style: "暗黑战士卡",
      generation: "4代末/5代初",
      motion_hint: { bpm: 134, easing: "war drum", duration: "long" },
      forbidden: ["可爱", "彩虹"]
    }
  ],
  rv: [
    {
      era_slug: "red", era_name: "Red Era", year: 2014, album: "Happiness",
      palette: { primary: "#FF0033", secondary: "#FFD700", accent: "#FFFFFF" },
      mood: ["甜美 Red", "happiness", "卡通"],
      typography_keywords: ["圆润大字", "高饱和红黄", "卡通"],
      mv_grammar: "彩色卡通 + 跳跃 + 高饱和",
      photocard_style: "卡通糖果",
      generation: "3代初",
      motion_hint: { bpm: 124, easing: "happy jump", duration: "loop" },
      forbidden: ["暗黑", "冷调"]
    },
    {
      era_slug: "velvet", era_name: "Velvet Era", year: 2017, album: "Perfect Velvet",
      palette: { primary: "#3C0033", secondary: "#C9A87C", accent: "#000000" },
      mood: ["暗黑高级", "Peek-a-boo", "悬疑"],
      typography_keywords: ["serif 黑暗", "金色细描", "哥特"],
      mv_grammar: "豪宅 + 悬疑 + 黑暗 + 金箔",
      photocard_style: "古典油画 + 金边",
      generation: "3代中",
      motion_hint: { bpm: 100, easing: "velvet glide", duration: "long sustain" },
      forbidden: ["甜美", "卡通"]
    },
    {
      era_slug: "psycho", era_name: "Psycho Era", year: 2019, album: "The ReVe Festival: Finale",
      palette: { primary: "#7A2E50", secondary: "#F5C5C5", accent: "#2A2A3E" },
      mood: ["心理戏剧", "脆弱", "复杂"],
      typography_keywords: ["serif emotional", "玫瑰金", "破碎构图"],
      mv_grammar: "心理剧 + 玫瑰 + 玻璃碎裂 + 双面",
      photocard_style: "玫瑰干花卡",
      generation: "3代末",
      motion_hint: { bpm: 110, easing: "psychological", duration: "intense" },
      forbidden: ["快乐", "高饱和"]
    }
  ],
  lsf: [
    {
      era_slug: "fearless", era_name: "FEARLESS Era", year: 2022, album: "FEARLESS",
      palette: { primary: "#FFFFFF", secondary: "#1A1A1A", accent: "#A8E6E1" },
      mood: ["无畏宣言", "现代极简", "白色出击"],
      typography_keywords: ["geometric sans", "极简全大写", "黑白对比"],
      mv_grammar: "现代空间 + 白色着装 + 锐利构图",
      photocard_style: "白底黑字极简",
      generation: "4代",
      motion_hint: { bpm: 122, easing: "sharp confident", duration: "medium" },
      forbidden: ["可爱", "复古"]
    },
    {
      era_slug: "antifragile", era_name: "ANTIFRAGILE Era", year: 2022, album: "ANTIFRAGILE",
      palette: { primary: "#FF6B35", secondary: "#1A0033", accent: "#FFE066" },
      mood: ["反脆弱", "燃烧", "拉美热度"],
      typography_keywords: ["反斜 italic", "橙红炸裂", "all caps"],
      mv_grammar: "拉美街头 + 火焰橘 + 力量舞蹈",
      photocard_style: "热度橘印刷",
      generation: "4代",
      motion_hint: { bpm: 128, easing: "fierce", duration: "intense" },
      forbidden: ["柔美", "粉嫩"]
    },
    {
      era_slug: "easy", era_name: "EASY Era", year: 2024, album: "EASY",
      palette: { primary: "#E8C5A0", secondary: "#000000", accent: "#FFFFFF" },
      mood: ["轻盈成熟", "easy 不费力", "高级 nude"],
      typography_keywords: ["sans serif 轻盈", "nude 色字", "极简留白"],
      mv_grammar: "白色空间 + nude 调 + 优雅动作",
      photocard_style: "nude 色高级哑光",
      generation: "4代末",
      motion_hint: { bpm: 100, easing: "effortless", duration: "long" },
      forbidden: ["重口味", "高饱和"]
    }
  ],
  idle: [
    {
      era_slug: "latata", era_name: "LATATA Era", year: 2018, album: "I am",
      palette: { primary: "#D946EF", secondary: "#000000", accent: "#FFC75F" },
      mood: ["异域", "自制", "中东风"],
      typography_keywords: ["serif 异域", "金色细线", "对称"],
      mv_grammar: "中东装饰 + 自创音乐 + 神秘",
      photocard_style: "异域纹样",
      generation: "3-4 代交接",
      motion_hint: { bpm: 110, easing: "mystic", duration: "medium" },
      forbidden: ["甜美 Y2K"]
    },
    {
      era_slug: "tomboy", era_name: "TOMBOY Era", year: 2022, album: "I NEVER DIE",
      palette: { primary: "#1A1A1A", secondary: "#FF0040", accent: "#FFFFFF" },
      mood: ["反叛", "rock punk", "I'm a freaking TOMBOY"],
      typography_keywords: ["rock 字体", "划痕", "all caps red"],
      mv_grammar: "酒吧 + 摇滚 + 痞气 + 全员素颜",
      photocard_style: "punk 拼贴",
      generation: "4代中",
      motion_hint: { bpm: 130, easing: "punk", duration: "intense" },
      forbidden: ["公主", "甜美"]
    },
    {
      era_slug: "queencard", era_name: "Queencard Era", year: 2023, album: "I feel",
      palette: { primary: "#FF80AB", secondary: "#FFE066", accent: "#FFFFFF" },
      mood: ["女王自夸", "Y2K 回归", "甜炸"],
      typography_keywords: ["Y2K marker", "彩色描边", "贴纸"],
      mv_grammar: "Y2K 彩色 + 自拍 + 玫瑰",
      photocard_style: "Y2K 彩色贴纸",
      generation: "4代末",
      motion_hint: { bpm: 122, easing: "Y2K bounce", duration: "short loop" },
      forbidden: ["暗黑", "punk"]
    }
  ],
  mmm: [
    {
      era_slug: "decalcomanie", era_name: "Decalcomanie Era", year: 2016, album: "Memory",
      palette: { primary: "#0F0F2E", secondary: "#C9A87C", accent: "#FFFFFF" },
      mood: ["双面", "性感", "成熟"],
      typography_keywords: ["serif 性感", "金箔", "黑色"],
      mv_grammar: "双面镜 + 黑白对比 + 性感成熟",
      photocard_style: "双面卡",
      generation: "3代",
      motion_hint: { bpm: 95, easing: "seductive", duration: "long" },
      forbidden: ["可爱", "甜美"]
    },
    {
      era_slug: "hip", era_name: "HIP Era", year: 2019, album: "reality in BLACK",
      palette: { primary: "#FF003C", secondary: "#000000", accent: "#FFD700" },
      mood: ["自由自夸", "I'm a hip mama", "无所谓"],
      typography_keywords: ["手写大字 hip", "红黑撞色", "rebel"],
      mv_grammar: "街头 + 时装 + 自夸 hip",
      photocard_style: "hip-hop 拼贴",
      generation: "3代末",
      motion_hint: { bpm: 124, easing: "swag", duration: "loop" },
      forbidden: ["柔弱"]
    }
  ],
  illit: [
    {
      era_slug: "magnetic", era_name: "Magnetic Era", year: 2024, album: "SUPER REAL ME",
      palette: { primary: "#FFE3F0", secondary: "#FFFFFF", accent: "#A8C5E8" },
      mood: ["少女 magnetic", "Y2K 复兴", "粉嫩"],
      typography_keywords: ["Y2K 手写", "粉色描边", "贴纸"],
      mv_grammar: "校园 + Y2K 滤镜 + 卧室",
      photocard_style: "Y2K 拍立得 + 粉色边",
      generation: "5代初",
      motion_hint: { bpm: 120, easing: "magnetic pull", duration: "loop" },
      forbidden: ["暗黑", "重口"]
    },
    {
      era_slug: "cherish", era_name: "Cherish Era", year: 2024, album: "I'LL LIKE YOU",
      palette: { primary: "#FFD9E0", secondary: "#C8E6C9", accent: "#FFE066" },
      mood: ["温柔珍惜", "夏日", "拍立得"],
      typography_keywords: ["手写温柔", "薄荷糖色", "圆润"],
      mv_grammar: "夏日海边 + 拍立得 + 温柔特写",
      photocard_style: "夏日拍立得",
      generation: "5代",
      motion_hint: { bpm: 110, easing: "gentle", duration: "medium" },
      forbidden: ["暗黑", "锐利"]
    }
  ],
  meovv: [
    {
      era_slug: "meow", era_name: "MEOW Era", year: 2024, album: "Debut Single",
      palette: { primary: "#FF1493", secondary: "#000000", accent: "#FFC0CB" },
      mood: ["猫系出道", "酷甜", "YG 第二春"],
      typography_keywords: ["猫爪 logo", "黑粉撞色", "all caps"],
      mv_grammar: "暗夜街头 + 猫眼 + 黑粉对比",
      photocard_style: "黑底粉描猫卡",
      generation: "5代初",
      motion_hint: { bpm: 125, easing: "cat pounce", duration: "short" },
      forbidden: ["治愈", "可爱过头"]
    }
  ]
};

// ============ 默认 era 兜底 (其余 40 团) ============
// 基于 group 现有 palette + signature_tracks 自动派生 1 个默认 era

function buildDefaultEra(fm) {
  return {
    era_slug: "debut_default",
    era_name: `${fm.group_name || "Debut"} Default Era`,
    year: fm.founded_year || 2020,
    album: "(default — 待补充)",
    palette: fm.palette || { primary: "#FFFFFF", secondary: "#000000", accent: "#FF80AB" },
    mood: fm.mood_keywords || [fm.core_aesthetic || "default"],
    typography_keywords: ["sans serif 默认"],
    mv_grammar: fm.core_aesthetic || "default 出道 MV",
    photocard_style: "default 拍立得",
    generation: fm.era || "未知代",
    motion_hint: { bpm: (fm.signature_tracks?.[0]?.bpm) || 120, easing: "default", duration: "medium" },
    forbidden: [],
    note: "兜底 default era · 待人工补充具体 era 数据"
  };
}

// ============ Frontmatter 简易 parser (只为读 group_slug 用) ============

function getGroupSlug(raw) {
  const m = raw.match(/^---\s*\n([\s\S]+?)\n---/);
  if (!m) return null;
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^group_slug:\s*(.+)$/);
    if (kv) return kv[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

function getGroupName(raw) {
  const m = raw.match(/^group_name:\s*"?([^"\n]+)"?/m);
  return m ? m[1].trim() : "";
}

function getFoundedYear(raw) {
  const m = raw.match(/^founded_year:\s*(\d+)/m);
  return m ? Number(m[1]) : null;
}

function getCoreAesthetic(raw) {
  const m = raw.match(/^core_aesthetic:\s*"?([^"\n]+)"?/m);
  return m ? m[1].trim() : "";
}

function getEra(raw) {
  const m = raw.match(/^era:\s*"?([^"\n]+)"?/m);
  return m ? m[1].trim() : "";
}

function getPalette(raw) {
  const m = raw.match(/^palette:\s*\n((?:\s+\w+:\s*"[^"]+"\s*\n)+)/m);
  if (!m) return null;
  const p = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^\s+(\w+):\s*"?([^"\n]+)"?/);
    if (kv) p[kv[1]] = kv[2].trim();
  }
  return p;
}

function getMoodKeywords(raw) {
  const m = raw.match(/^mood_keywords:\s*\[([^\]]+)\]/m);
  if (!m) return null;
  return m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
}

function getSignatureTracks(raw) {
  const m = raw.match(/^signature_tracks:\s*\n((?:\s+- \{[^\n]+\}\s*\n)+)/m);
  if (!m) return [];
  const tracks = [];
  for (const line of m[1].split("\n")) {
    const tm = line.match(/title:\s*"?([^",}]+)"?.+?year:\s*(\d+).+?bpm:\s*(\d+)/);
    if (tm) tracks.push({ title: tm[1], year: Number(tm[2]), bpm: Number(tm[3]) });
  }
  return tracks;
}

// ============ Era YAML 序列化 ============

function serializeEras(eras) {
  const lines = ["eras:"];
  for (const e of eras) {
    lines.push(`  - era_slug: "${e.era_slug}"`);
    lines.push(`    era_name: "${e.era_name}"`);
    lines.push(`    year: ${e.year}`);
    lines.push(`    album: "${e.album}"`);
    lines.push(`    palette: { primary: "${e.palette.primary}", secondary: "${e.palette.secondary}", accent: "${e.palette.accent}" }`);
    lines.push(`    mood: [${e.mood.map(m => `"${m}"`).join(", ")}]`);
    lines.push(`    typography_keywords: [${e.typography_keywords.map(t => `"${t}"`).join(", ")}]`);
    lines.push(`    mv_grammar: "${e.mv_grammar}"`);
    lines.push(`    photocard_style: "${e.photocard_style}"`);
    lines.push(`    generation: "${e.generation}"`);
    lines.push(`    motion_hint: { bpm: ${e.motion_hint.bpm}, easing: "${e.motion_hint.easing}", duration: "${e.motion_hint.duration}" }`);
    if (e.forbidden && e.forbidden.length) {
      lines.push(`    forbidden: [${e.forbidden.map(f => `"${f}"`).join(", ")}]`);
    }
    if (e.note) {
      lines.push(`    note: "${e.note}"`);
    }
  }
  return lines.join("\n");
}

// ============ 主流程 · 注入 eras 字段 ============

function inject(file) {
  const path = join(GROUPS, file);
  const raw = readFileSync(path, "utf-8");
  
  // 已经有 eras 字段 → skip
  if (/^eras:/m.test(raw)) {
    return { file, status: "skip_existing" };
  }
  
  const slug = getGroupSlug(raw);
  if (!slug) return { file, status: "skip_no_slug" };
  
  let eras;
  if (TOP_ERAS[slug]) {
    eras = TOP_ERAS[slug];
  } else {
    // 兜底 default era
    const fm = {
      group_name: getGroupName(raw),
      founded_year: getFoundedYear(raw),
      core_aesthetic: getCoreAesthetic(raw),
      era: getEra(raw),
      palette: getPalette(raw),
      mood_keywords: getMoodKeywords(raw),
      signature_tracks: getSignatureTracks(raw),
    };
    eras = [buildDefaultEra(fm)];
  }
  
  const erasYaml = serializeEras(eras);
  
  // 在 frontmatter 闭合 --- 之前插入 eras: 块
  const closeIdx = raw.indexOf("\n---", raw.indexOf("---") + 3);
  if (closeIdx === -1) return { file, status: "skip_no_close" };
  
  const newRaw = raw.slice(0, closeIdx) + "\n" + erasYaml + raw.slice(closeIdx);
  writeFileSync(path, newRaw, "utf-8");
  
  return { file, status: "injected", slug, era_count: eras.length, kind: TOP_ERAS[slug] ? "top" : "default" };
}

// ============ Run ============

const files = readdirSync(GROUPS).filter(f => f.endsWith(".md"));
console.log(`[v3.0 Phase 1] Era Universe · 处理 ${files.length} 个 group 文件\n`);

const results = files.map(inject);
const top = results.filter(r => r.kind === "top");
const def = results.filter(r => r.kind === "default");
const skip = results.filter(r => r.status.startsWith("skip"));

console.log(`✓ 顶级团 (curated era):   ${top.length} 个 / 共 ${top.reduce((s,r) => s + r.era_count, 0)} era`);
console.log(`✓ 其余团 (default era):   ${def.length} 个`);
console.log(`⊘ 已有 eras / 跳过:        ${skip.length} 个`);
console.log(`\n顶级团明细:`);
top.forEach(r => console.log(`  ${r.slug.padEnd(12)} → ${r.era_count} era`));
console.log(`\n[v3.0 Phase 1] Done.`);
