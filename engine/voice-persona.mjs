// engine/voice-persona.mjs
// v3.6.1 · Per-member speaking persona for host-AI roleplay.
//
// This module turns a roster member (idol or group) into a deterministic
// speaking-style guide that the host AI can use to make each council seat
// sound distinct. It is NOT an LLM call — it derives voice from existing
// frontmatter, group voice templates, and the current brief.

import { loadVoiceTemplate } from "./voice-synthesis.mjs";
import { classifyBriefSpecialties, classifyIdolSpecialty } from "./specialty.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GROUPS_DIR = join(__dirname, "..", "groups");

function normalized(str) { return String(str || "").toLowerCase(); }

function parseInlineArray(value) {
  const m = String(value || "").match(/^\[([\s\S]*)\]$/);
  if (!m) return [];
  return m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

function loadGroupMeta(file) {
  const raw = readFileSync(join(GROUPS_DIR, file), "utf-8");
  const fm = raw.replace(/\r\n/g, "\n").match(/^---\s*\n([\s\S]+?)\n---/)?.[1] || "";
  const meta = {};
  for (const line of fm.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) value = parseInlineArray(value);
    else value = value.replace(/^["']|["']$/g, "");
    meta[kv[1]] = value;
  }
  return meta;
}

let groupsMapCache = null;
function buildGroupsMap() {
  if (groupsMapCache) return groupsMapCache;
  const entries = readdirSync(GROUPS_DIR)
    .filter(f => f.endsWith(".md"))
    .map(file => {
      const meta = loadGroupMeta(file);
      const voice = loadVoiceTemplate(meta.group_slug || file.replace(/\.md$/, ""));
      return [
        normalized(meta.group_name || meta.name || file.replace(/\.md$/, "")),
        {
          slug: meta.group_slug || file.replace(/\.md$/, ""),
          name: meta.group_name || meta.name || file.replace(/\.md$/, ""),
          era: meta.era || "",
          core_aesthetic: meta.core_aesthetic || "",
          aesthetic_tags: Array.isArray(meta.aesthetic_tags) ? meta.aesthetic_tags : [],
          mood_keywords: Array.isArray(meta.mood_keywords) ? meta.mood_keywords : [],
          rivals: Array.isArray(meta.rivals) ? meta.rivals : [],
          counterpoint_axis: meta.counterpoint_axis || "",
          fusion_rules: meta.fusion_rules || "",
          voice,
        },
      ];
    });
  groupsMapCache = new Map(entries);
  return groupsMapCache;
}

function groupForMember(member, groupsMap) {
  if (member.type === "group") {
    return groupsMap?.get(normalized(member.slug))
      || groupsMap?.get(normalized(member.group))
      || member;
  }
  return groupsMap?.get(normalized(member.group));
}

function cueBlob(group, member) {
  // Note: voice.position_statement is intentionally excluded because it often
  // lists negative examples ("反对：Y2K/甜美") that would distort tone detection.
  return [
    (group?.aesthetic_tags || []).join(" "),
    group?.core_aesthetic || "",
    (group?.mood_keywords || []).join(" "),
    group?.voice?.identity || "",
    member?.vibe || "",
    member?.attitude || "",
    member?.personality || "",
  ]
    .join(" ")
    .toLowerCase();
}

const TONE_RULES = [
  {
    keys: ["cyber", "metaverse", "futuristic", "sci-fi", "æ", "ai ", "kwangya"],
    tone: "冷峻、数据化、未来感",
  },
  {
    keys: ["princess", "elegant", "royal", "majestic", "高级感", "公主", "贵族", "仪式"],
    tone: "高贵、克制、仪式感",
  },
  {
    keys: ["baroque", "dramatic", "opera", "戏剧", "复仇", "心理", "psyche", "dual-concept", "dual-mode", "velvet", "odd", "magic"],
    tone: "华丽、戏剧、张力感",
  },
  {
    keys: ["ethereal", "concept", "cinematic", "月之", "梦幻", "dreamy", "电影感", "世界观"],
    tone: "空灵、概念化、电影感",
  },
  {
    keys: ["pure", "candy-pop", "sweet", "fresh", "lovely", "bubblegum", "bright", "sunny", "cute", "邻家", "清纯", "治愈", "正能量", "花束"],
    tone: "活泼、亲和、略带俏皮",
  },
  {
    keys: ["natural", "呼吸感", "minimal", "清新", "薄荷", "极简", "自然"],
    tone: "清淡、克制、呼吸感",
  },
  {
    keys: ["sensual", "r&b", "mature", "warm", "丝绒", "慵懒", "性感"],
    tone: "慵懒、性感、丝绒感",
  },
  {
    keys: ["mixxpop", "switch", "multi", "experimental", "mashup", "混搭"],
    tone: "混搭、实验、高能量",
  },
  {
    keys: ["latin", "global", "sparkle", "bouncy", "latin pop"],
    tone: "热辣、弹跳、节奏感",
  },
  {
    keys: ["theatrical", "bold", "self-made", "charismatic", "individual", "制作人", "自我表达", "舞台架构师", "宣言"],
    tone: "锋利、宣言式、剧场感",
  },
  {
    keys: ["grotesque", "怪诞", "诡异", "危险", "视觉冲击", "危险又优雅"],
    tone: "怪诞、优雅、危险感",
  },
  {
    keys: ["dark-glam", "luxe-edge", "lethal", "sharp", "fearless", "girl-crush", "hip-hop", "trap", "swag", "rebel", "fierce", "raw", "monster", "hardcore", "杀气", "对决", "icon", "女王", "天后", "国民"],
    tone: "锋利、直接、压迫感",
  },
  {
    keys: ["retro", "disco", "vintage", "y2k", "复古"],
    tone: "复古、松弛、颗粒感",
  },
];

const SOURCE_WEIGHT = {
  core_aesthetic: 3,
  mood_keywords: 2,
  aesthetic_tags: 1,
  voice_identity: 1,
  member_vibe: 1,
  member_attitude: 1,
  member_personality: 1,
};

function scoreRule(rule, group, member) {
  let score = 0;
  const textFor = {
    core_aesthetic: normalized(group?.core_aesthetic),
    mood_keywords: (group?.mood_keywords || []).join(" ").toLowerCase(),
    aesthetic_tags: (group?.aesthetic_tags || []).join(" ").toLowerCase(),
    voice_identity: normalized(group?.voice?.identity),
    member_vibe: normalized(member?.vibe),
    member_attitude: normalized(member?.attitude),
    member_personality: normalized(member?.personality),
  };

  for (const source of Object.keys(SOURCE_WEIGHT)) {
    const haystack = textFor[source] || "";
    if (rule.keys.some(k => haystack.includes(k))) {
      score += SOURCE_WEIGHT[source];
    }
  }
  return score;
}

function toneFrom(group, member) {
  let best = null;
  let bestScore = 0;
  for (const rule of TONE_RULES) {
    const score = scoreRule(rule, group, member);
    if (score > bestScore) {
      best = rule.tone;
      bestScore = score;
    }
  }

  if (best) return best;

  const personality = normalized(member?.personality);
  if (personality.includes("strategic") || personality.includes("analytical")) {
    return "理性、结构化、爱用比喻";
  }

  return "专业、冷静、以设计证据说话";
}

function habitsFrom(member, group) {
  const habits = [];

  if (member.type === "group") {
    const core = cleanQuoted(group?.core_aesthetic || "");
    if (core) habits.push(`用 ${core} 作为判断滤镜`);
    if (group?.voice?.identity) habits.push(`开场常以「${group.voice.identity}」自报家门`);
    if (group?.counterpoint_axis) habits.push(`言必提及对位轴：${group.counterpoint_axis}`);
    if (group?.fusion_rules) habits.push(`言必守护团体底线：${group.fusion_rules}`);
    if (group?.rivals?.length) habits.push("宿敌团体在场时声调会立刻收紧");
    if (Array.isArray(group?.aesthetic_tags) && group.aesthetic_tags.length) {
      habits.push(`关键词挂在嘴边：${group.aesthetic_tags.slice(0, 3).join("、")}`);
    }
    if (habits.length === 0) habits.push("用团体标签说话，代表整体审美表态");
    return habits;
  }

  const role = normalized(member?.role);
  const personality = normalized(member?.personality);
  const vibe = normalized(member?.vibe);
  const attitude = normalized(member?.attitude);

  if (role.includes("leader") || role.includes("main vocal")) habits.push("习惯结论先行，再补理由");
  if (role.includes("rapper")) habits.push("短句密集，押韵感强，节奏如 flow");
  if (role.includes("dance")) habits.push("用身体/动效隐喻表达立场");
  if (personality.includes("blunt") || personality.includes("direct") || attitude.includes("sharp")) {
    habits.push("不绕弯子，会直接点名问题");
  }
  if (personality.includes("strategic") || personality.includes("analytical")) {
    habits.push("爱用系统词：锚点、维度、语法、DNA");
  }
  if (vibe.includes("playful")) habits.push("会用反问或玩笑缓冲冲突");

  const attitudePhrase = member?.attitude?.replace(/^["']|["']$/g, "").trim();
  if (attitudePhrase && attitudePhrase.length <= 40) {
    habits.push(`常以「${attitudePhrase}」作结或起势`);
  }

  if (group?.fusion_rules) habits.push(`言必守护团体底线：${group.fusion_rules}`);
  if (group?.rivals?.length) habits.push("宿敌在场时立场会立刻收紧");
  if (group?.counterpoint_axis) habits.push(`言必提及对位轴：${group.counterpoint_axis}`);
  if (habits.length === 0) habits.push("用设计事实说话，少情绪");

  return habits;
}

function postureFor(tension, memberType, rivalsPresent = false) {
  if (memberType === "user") return "judge";
  if (rivalsPresent || tension >= 3) return "attack";
  if (tension >= 1) return "defend";
  return "collaborate";
}

function cleanQuoted(str) {
  return String(str || "").replace(/"/g, "").replace(/^['\s]+|['\s]+$/g, "").trim();
}

function leversFor(member, group) {
  const levers = [];
  if (member.type === "group") {
    if (group?.core_aesthetic) levers.push(cleanQuoted(group.core_aesthetic));
    if (group?.position_statement) levers.push(group.position_statement);
    if (Array.isArray(group?.aesthetic_tags) && group.aesthetic_tags.length) {
      levers.push(...group.aesthetic_tags.slice(0, 2).map(t => `锚点：${t}`));
    }
    if (group?.counterpoint_axis) levers.push(`对位轴：${group.counterpoint_axis}`);
    if (group?.fusion_rules) levers.push(`底线：${group.fusion_rules}`);
    if (Array.isArray(group?.forbidden) && group.forbidden.length) levers.push(...group.forbidden.map(f => `禁区：${f}`));
  } else {
    if (member.ui_specialty || member.specialty) levers.push(`专长：${member.ui_specialty || member.specialty}`);
    if (member.role) levers.push(`${member.role} 视角`);
    if (group?.core_aesthetic) levers.push(`不脱离 ${group.name} 的 ${cleanQuoted(group.core_aesthetic)}`);
  }
  return levers;
}

function signaturePhrase(member, group, voice) {
  if (member.type === "group") {
    return `${voice?.identity || `${member.name} · ${group?.era || ""}`} 的立场：${voice?.position_statement || "守住核心身份"}。`;
  }
  const attitude = member?.attitude?.replace(/^["']|["']$/g, "").trim();
  const hook = attitude && attitude.length <= 40 ? `，以「${attitude}」为锚` : "";
  return `作为 ${member.group || group?.name || ""} 的 ${member.role || "idol"}${hook}，我代表 ${member.ui_specialty || member.specialty || "设计维度"} 发言。`;
}

function briefMatchSummary(member, brief, group) {
  const briefSpecs = classifyBriefSpecialties(brief);
  if (member.type === "group") {
    const tagHits = (group?.aesthetic_tags || []).filter(t => briefSpecs.includes(t));
    return tagHits.length ? `brief 与本团美学标签重合：${tagHits.join("、")}` : "brief 未直接命中本团标签";
  }
  const idolSpecs = classifyIdolSpecialty(member);
  const hits = idolSpecs.filter(s => briefSpecs.includes(s));
  return hits.length ? `brief 与个人专长重合：${hits.join("、")}` : "brief 与个人专长弱相关";
}

/**
 * Derive a deterministic speaking persona for a roster member.
 *
 * @param {object} member - council member (idol or group)
 * @param {string} brief - design brief text
 * @param {object} opts - { tension?: number, rivalsPresent?: boolean, groupsMap?: Map }
 * @returns {object} persona guide for host-AI roleplay
 */
function mergeVoice(groupVoice, memberVoice) {
  if (!groupVoice && !memberVoice) return null;
  return {
    identity: memberVoice?.identity || groupVoice?.identity || "",
    position_statement: memberVoice?.position_statement || groupVoice?.position_statement || "",
    question_template: memberVoice?.question_template || groupVoice?.question_template || "",
    veto_triggers: memberVoice?.veto_triggers?.length
      ? memberVoice.veto_triggers
      : groupVoice?.veto_triggers || [],
  };
}

export function derivePersona(member, brief, opts = {}) {
  const groupsMap = opts.groupsMap || buildGroupsMap();
  const group = groupForMember(member, groupsMap);
  const groupVoice = group?.slug ? loadVoiceTemplate(group.slug) : null;
  const voice = mergeVoice(groupVoice, member.voice);
  const tension = typeof opts.tension === "number" ? opts.tension : 0;
  const rivalsPresent = Boolean(opts.rivalsPresent);

  if (member.type === "user") {
    return {
      member: { slug: "user", name: "User", type: "user" },
      voice_identity: "User",
      tone: "中立、裁决式、最终品味权威",
      speech_habits: ["只在关键处打断", "一票否决权清晰"],
      conflict_posture: "judge",
      negotiation_levers: ["最终 taste 裁决", "veto / override"],
      signature_phrase: "用户席：保留最终裁决权。",
      hard_veto: [],
      brief_match: "用户为 brief 发起人",
      tension: 0,
    };
  }

  return {
    member: { slug: member.slug, name: member.name, type: member.type },
    voice_identity: voice?.identity || `${member.name} · ${group?.era || ""}`,
    tone: toneFrom(group, member),
    speech_habits: habitsFrom(member, group),
    conflict_posture: postureFor(tension, member.type, rivalsPresent),
    negotiation_levers: leversFor(member, group),
    signature_phrase: signaturePhrase(member, group, voice),
    hard_veto: voice?.veto_triggers || [],
    brief_match: briefMatchSummary(member, brief, group),
    tension,
  };
}

export { buildGroupsMap, groupForMember };
