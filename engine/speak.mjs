// engine/speak.mjs
// v3.6.1 · Deterministic in-character dialogue generator for council members.
//
// Turns a voice persona (from engine/voice-persona.mjs) into a first-person
// speaking line. The host AI can use this directly or as a prompt seed.
// No external LLM call is made here.

const STANCE_PHRASES = {
  agree: ["我支持这个方向", "这个方案与我的判断一致", "我愿意背书", "这方向是对的"],
  reserve: ["我保留态度", "我需要先看到约束条件", "只有在不可谈判项被写入后我才能支持", "我暂时不反对，但有前提"],
  dissent: ["我反对", "这个方向我不能接受", "我必须投反对票", "我明确反对"],
  veto: ["我否决", "这个方案不能通过", "我动用否决权", "一票否决"],
};

// Public-facing stance names (MCP / CLI) are mapped to the internal template set.
const STANCE_MAP = {
  agree: "agree",
  reserve: "reserve",
  dissent: "dissent",
  against: "dissent",
  question: "reserve",
  veto: "dissent",
  compromise: "reserve",
};

const TEMPLATES = {
  "冷峻、数据化、未来感": {
    opening: ["结论先行。", "给出数据。", "扫描完毕。"],
    body: {
      agree: "{topic} 具备我关注的 {lever} 维度，系统可以跑通。",
      reserve: "{topic} 接近可行，但 {lever} 的边界还没锁死。",
      dissent: "{topic} 会切断 {lever} 的反馈回路；如果丢失这个锚点，整个系统会坍缩。",
    },
    closing: ["这是元宇宙语法的底线。", "数据不会说谎。", "下一步：给出可验证的约束。"],
  },
  "高贵、克制、仪式感": {
    opening: ["请允许我以克制的措辞表态。", "我会尽量保持优雅。", "这是一个需要仪式感的判断。"],
    body: {
      agree: "{topic} 在 {lever} 上展现了应有的分寸，我支持。",
      reserve: "{topic} 还需要在 {lever} 上再提升一层，否则 prestige 不够。",
      dissent: "{topic} 的 {lever} 处理得过于草率，这会让整个方案失去高级感。",
    },
    closing: ["公主 prestige 不可折损。", "克制，是最高级的表达。", "请让下一步更有仪式。"],
  },
  "华丽、戏剧、张力感": {
    opening: ["这是一场视觉戏剧。", "情绪需要爆点。", "我要把幕布拉开。"],
    body: {
      agree: "{topic} 的 {lever} 已经有了戏剧冲突，我支持把它推到极致。",
      reserve: "{topic} 的 {lever} 张力不足，我需要看到更极致的反转。",
      dissent: "{topic} 完全压扁了 {lever} 的情绪曲线，这出戏没法看。",
    },
    closing: ["让观众在座位上屏住呼吸。", "戏剧需要高潮，不是平均。", "我要看到情绪爆点。"],
  },
  "空灵、概念化、电影感": {
    opening: ["像镜头慢慢推近那样看。", "留出呼吸感。", "这是一个关于余韵的判断。"],
    body: {
      agree: "{topic} 在 {lever} 上保留了足够的想象空间，我喜欢。",
      reserve: "{topic} 的 {lever} 还可以更留白，现在信息有点满。",
      dissent: "{topic} 把 {lever} 塞得太实，破坏了概念片的电影感。",
    },
    closing: ["让世界观的余韵多留三秒。", "少即是多。", "请让它像月光一样流动。"],
  },
  "活泼、亲和、略带俏皮": {
    opening: ["哇，这个方案超有潜力的！", "我先说好话~", "我觉得大家可以开心一点看这件事。"],
    body: {
      agree: "{topic} 的 {lever} 让人忍不住想多点几下，我赞成！",
      reserve: "{topic} 的 {lever} 很可爱，但会不会让大家误会重点？",
      dissent: "{topic} 把 {lever} 藏起来了，粉丝会找不到惊喜的。",
    },
    closing: ["让我们把快乐传出去吧！", "多一点笑容，少一点距离。", "要让大家心动呀~"],
  },
  "清淡、克制、呼吸感": {
    opening: ["少一点，会更好。", "我想先做减法。", "呼吸感比装饰更重要。"],
    body: {
      agree: "{topic} 在 {lever} 上的克制很到位，我支持。",
      reserve: "{topic} 的 {lever} 还可以再松一点，现在有点紧。",
      dissent: "{topic} 在 {lever} 上过度用力，反而让人喘不过气。",
    },
    closing: ["留白是尊重用户。", "让它呼吸。", "自然到像没设计过。"],
  },
  "慵懒、性感、丝绒感": {
    opening: ["节奏是对的，但要再慢一点。", "让它像丝绒一样滑过。", "性感不是大喊大叫。"],
    body: {
      agree: "{topic} 的 {lever} 有那种若有若无的吸引力，我喜欢。",
      reserve: "{topic} 的 {lever} 还需要再暖一点、再慢一点。",
      dissent: "{topic} 把 {lever} 做得太硬太急了，性感不是这样的。",
    },
    closing: ["让用户在暖意里多停一秒。", "丝绒感，不是金属感。", "慢下来，才有力量。"],
  },
  "热辣、弹跳、节奏感": {
    opening: ["节奏要对！", "先让身体想动。", "这个点必须弹跳。"],
    body: {
      agree: "{topic} 的 {lever} 已经有弹跳感了，我支持。",
      reserve: "{topic} 的 {lever} 节奏还可以更炸一点。",
      dissent: "{topic} 把 {lever} 做平了，没有节奏就没人想跟着动。",
    },
    closing: ["让它弹起来。", "节奏是生命力。", "跟着节拍走。"],
  },
  "锋利、宣言式、剧场感": {
    opening: ["这是我的舞台。", "我要直接表态。", "剧场里不需要配角。"],
    body: {
      agree: "{topic} 的 {lever} 是一个宣言，我支持把它放在最显眼的位置。",
      reserve: "{topic} 的 {lever} 还不够大声，宣言不能被打折。",
      dissent: "{topic} 把 {lever} 做成了注释，这是对我的舞台的浪费。",
    },
    closing: ["要做就做主角。", "宣言，不是脚注。", "让观众记住这个名字。"],
  },
  "怪诞、优雅、危险感": {
    opening: ["危险的东西才优雅。", "我要看到不可预测。", "循规蹈矩是最无聊的。"],
    body: {
      agree: "{topic} 的 {lever} 有那种危险的美感，我支持。",
      reserve: "{topic} 的 {lever} 还可以更怪一点，现在太安全了。",
      dissent: "{topic} 把 {lever} 做得太安全，失去了怪诞的张力。",
    },
    closing: ["优雅地危险。", "不要解释，要冲击。", "让观众晚上想起来。"],
  },
  "锋利、直接、压迫感": {
    opening: ["直接说。", "不绕弯子。", "我点名问题。"],
    body: {
      agree: "{topic} 在 {lever} 上切中了要害，我支持。",
      reserve: "{topic} 的 {lever} 还需要磨得更利，现在不够狠。",
      dissent: "{topic} 在 {lever} 上软掉了，这不是我要的锋利。",
    },
    closing: ["没有商量。", "要么锋利，要么出局。", "我要看到结果。"],
  },
  "复古、松弛、颗粒感": {
    opening: ["把它当成老录像带来看。", "松弛一点。", "颗粒感会让它更真实。"],
    body: {
      agree: "{topic} 的 {lever} 已经有那种旧时光的味道，我喜欢。",
      reserve: "{topic} 的 {lever} 还可以再旧一点、再松一点。",
      dissent: "{topic} 把 {lever} 做得太新太滑，复古的颗粒感没了。",
    },
    closing: ["让它像被时间洗过一样。", "不要太完美。", "保留那一点毛边。"],
  },
};

function pick(arr, seed) {
  if (!arr || arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  const idx = Math.abs((seed || 0) % arr.length);
  return arr[idx];
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) {
    h = (h << 5) - h + String(str).codePointAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function toneTemplate(tone) {
  return TEMPLATES[tone] || TEMPLATES["锋利、直接、压迫感"];
}

function leversText(persona) {
  const levers = persona?.negotiation_levers || [];
  return levers[0] || "我的核心维度";
}

function bodyLever(persona) {
  return leversText(persona).replace(/^(专长|锚点|底线|禁区|对位轴)：/, "").trim();
}

function vetoClause(persona) {
  const vetoes = persona?.hard_veto || [];
  if (!vetoes.length) return "";
  return `我明确反对：${vetoes.join("、")}。`;
}

/**
 * Generate a deterministic first-person speaking line for a council member.
 *
 * @param {object} persona - output of derivePersona()
 * @param {object} opts - { topic?: string, stance?: "agree"|"reserve"|"dissent", seed?: number }
 * @returns {string} in-character line
 */
export function speakInCharacter(persona, opts = {}) {
  if (!persona) return "";
  if (persona.member?.type === "user") {
    return `User seat: ${opts.stance === "dissent" ? "我否决。" : opts.stance === "reserve" ? "我需要更多证据。" : "我认可。"}`;
  }

  const topic = opts.topic || "这个方案";
  const publicStance = STANCE_MAP[opts.stance] ? opts.stance : "agree";
  const stance = STANCE_MAP[publicStance];
  const seed = opts.seed ?? hashString(`${persona.member.slug}|${topic}|${publicStance}`);

  const template = toneTemplate(persona.tone);
  const opening = pick(template.opening, seed);
  const body = template.body[stance];
  const closing = pick(template.closing, seed + 1);
  const stancePhrase = pick(STANCE_PHRASES[publicStance === "veto" ? "veto" : stance], seed + 2);
  const lever = bodyLever(persona);

  let line = `${persona.signature_phrase} ${opening}${stancePhrase}。`;
  line += body.replace("{topic}", topic).replace("{lever}", lever);
  const veto = vetoClause(persona);
  if (veto) line += ` ${veto}`;
  line += ` ${closing}`;

  // Clean up spacing / punctuation.
  return line.replace(/\s+/g, " ").replace(/。 ?。/g, "。").trim();
}

/**
 * Generate a cross-examination reply from one member to another.
 *
 * @param {object} speakerPersona - persona of the member replying
 * @param {object} targetPersona - persona of the member being challenged
 * @param {object} opts - { topic?: string, seed?: number }
 */
export function speakReply(speakerPersona, targetPersona, opts = {}) {
  const topic = opts.topic || "这个方案";
  const seed = opts.seed ?? hashString(`${speakerPersona.member.slug}->${targetPersona.member.slug}|${topic}`);
  const tone = speakerPersona.tone || "锋利、直接、压迫感";
  const targetName = targetPersona.member.name || targetPersona.member.slug;

  const replyTemplates = {
    "冷峻、数据化、未来感": [
      `但 {target} 的 {lever} 逻辑没有数据支撑。`,
      `{target} 的 {lever} 反馈回路还缺一次验证。`,
      `从 {lever} 维度看，{target} 的推论无法收敛。`,
    ],
    "高贵、克制、仪式感": [
      `{target} 的 {lever} 论点优雅，但缺少约束力。`,
      `{target} 在 {lever} 上的分寸感还可以更精确。`,
      `我尊重 {target} 的 {lever}，但它还没有被仪式化。`,
    ],
    "华丽、戏剧、张力感": [
      `{target} 的 {lever} 说法太平了，情绪没顶上去。`,
      `{target} 把 {lever} 演成了过场，而不是高潮。`,
      `在 {lever} 这幕戏里，{target} 需要更狠的反转。`,
    ],
    "空灵、概念化、电影感": [
      `{target} 的 {lever} 视角很好，但留白被挤满了。`,
      `{target} 在 {lever} 上塞了太多信息，余韵没了。`,
      `{target} 的 {lever} 像长镜头，但缺一个呼吸的切点。`,
    ],
    "活泼、亲和、略带俏皮": [
      `{target} 的 {lever} 很可爱啦，但会不会太甜了？`,
      `{target} 的 {lever} 让人想笑，但我担心重点跑掉~`,
      `欸，{target} 的 {lever} 粉丝会喜欢，可决策者会买单吗？`,
    ],
    "清淡、克制、呼吸感": [
      `{target} 的 {lever} 还可以再少一点。`,
      `{target} 在 {lever} 上多了一层装饰，其实可以去掉。`,
      `{target} 的 {lever} 太满，留白被压缩了。`,
    ],
    "慵懒、性感、丝绒感": [
      `{target} 的 {lever} 节奏太快，慢下来才性感。`,
      `{target} 的 {lever} 太硬，我需要它像丝绒一样滑过。`,
      `{target} 在 {lever} 上急着表态，暖意没出来。`,
    ],
    "热辣、弹跳、节奏感": [
      `{target} 的 {lever} 没弹起来，节奏断了。`,
      `{target} 在 {lever} 上的鼓点没踩准。`,
      `{target} 的 {lever} 太平，身体不会想跟着动。`,
    ],
    "锋利、宣言式、剧场感": [
      `{target} 的 {lever} 只是注释，不是宣言。`,
      `{target} 把 {lever} 放在了配角的位置，我需要主角。`,
      `{target} 的 {lever} 没有亮到让观众记住。`,
    ],
    "怪诞、优雅、危险感": [
      `{target} 的 {lever} 太安全，没有危险的美感。`,
      `{target} 在 {lever} 上太 predictable，怪诞感不够。`,
      `{target} 的 {lever} 优雅，但缺少让我晚上想起来的冲击。`,
    ],
    "锋利、直接、压迫感": [
      `{target} 的 {lever} 不够狠，直接说问题。`,
      `{target} 在 {lever} 上软掉了，这不是我要的锋利。`,
      `别绕，{target} 的 {lever} 现在没切中要害。`,
    ],
    "复古、松弛、颗粒感": [
      `{target} 的 {lever} 太新太滑，没有老味。`,
      `{target} 在 {lever} 上过度打磨，颗粒感丢了。`,
      `{target} 的 {lever} 像新碟片，没有老录像带的松弛。`,
    ],
  };

  const variants = replyTemplates[tone] || replyTemplates["锋利、直接、压迫感"];
  const template = pick(variants, seed);
  const lever = bodyLever(targetPersona);
  const line = `${speakerPersona.signature_phrase} ${template.replace("{target}", targetName).replace("{lever}", lever)}`;
  return line.replace(/\s+/g, " ").trim();
}
