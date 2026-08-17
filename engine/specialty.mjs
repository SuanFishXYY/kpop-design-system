// engine/specialty.mjs
// Shared design-dimension classification for idols and briefs.
// v3.5.0 · extracted from synthesize.mjs so council-assembly can do style-first summons.

export const SPECIALTY_KEYWORDS = {
  typography: /typo|font|衬线|字|serif|sans|letter|kerning|leading|type/i,
  motion: /motion|animation|动效|easing|spring|节奏|tempo|transition|bpm/i,
  palette: /palette|color|配色|hex|swatch|hue|tone|gradient/i,
  layout: /layout|grid|ia|architect|架构|栏|布局|composition/i,
  brand: /brand|品牌|logo|identity|mark|象征|signature/i,
  hero: /hero|kv|key.?visual|首屏|landing|banner/i,
  interaction: /micro|interaction|hover|交互|tap|gesture|haptic/i,
  illustration: /illust|绘|graphic|icon|插画|sticker/i,
  photography: /photo|拍|镜头|frame|视觉|cinematic|filmic/i,
  copy: /copy|文案|tone|voice|tagline|claim|wording/i,
};

export const SPECIALTY_LABELS = Object.keys(SPECIALTY_KEYWORDS);

/**
 * Classify an idol by design specialty based on ui_specialty / personality / vibe / attitude / role.
 */
export function classifyIdolSpecialty(idol) {
  const blob = `${idol?.ui_specialty || ""} ${idol?.personality || ""} ${idol?.vibe || ""} ${idol?.attitude || ""} ${idol?.role || ""}`;
  const hits = [];
  for (const [tag, re] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (re.test(blob)) hits.push(tag);
  }
  return hits.length ? hits : ["general"];
}

/**
 * Classify a brief by the design dimensions it mentions.
 */
export function classifyBriefSpecialties(brief) {
  const lower = String(brief || "").toLowerCase();
  const hits = [];
  for (const [tag, re] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (re.test(lower)) hits.push(tag);
  }
  return hits.length ? hits : ["general"];
}

/**
 * Score an idol against a brief's specialty dimensions.
 * Returns { score, matches, idolSpecs, briefSpecs }.
 */
export function scoreIdolForBrief(idol, briefSpecialties) {
  const idolSpecs = classifyIdolSpecialty(idol);
  const matches = idolSpecs.filter(s => briefSpecialties.includes(s));
  // Tier 0 (well-known idols) get a small bonus so style-first still surfaces them.
  const tierBonus = idol?.tier === 0 ? 0.5 : 0;
  return {
    idol,
    idolSpecs,
    briefSpecs: briefSpecialties,
    matches,
    score: matches.length + tierBonus,
  };
}

/**
 * Rank all idols by how well they match the brief's design dimensions.
 */
export function rankIdolsByBrief(idols, brief) {
  const briefSpecs = classifyBriefSpecialties(brief);
  return idols
    .map(idol => scoreIdolForBrief(idol, briefSpecs))
    .filter(x => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tie-break: higher tier first, then alphabetical slug for determinism.
      if (b.idol.tier !== a.idol.tier) return b.idol.tier - a.idol.tier;
      return String(a.idol.slug).localeCompare(b.idol.slug);
    });
}

/**
 * Select a diverse set of style-matched idols so each design dimension in the brief
 * gets representation, then fill remaining slots with the highest global scores.
 */
export function selectDiverseStyleIdols(idols, brief, max = 5) {
  const briefSpecs = classifyBriefSpecialties(brief);
  const ranked = rankIdolsByBrief(idols, brief).map(r => r.idol);
  const selected = [];
  const selectedSlugs = new Set();

  // 1. Reserve one seat for each distinct design dimension mentioned in the brief.
  for (const spec of briefSpecs) {
    const best = ranked.find(i => classifyIdolSpecialty(i).includes(spec) && !selectedSlugs.has(i.slug));
    if (best) {
      selected.push(best);
      selectedSlugs.add(best.slug);
    }
    if (selected.length >= max) return selected;
  }

  // 2. Fill the rest by global style score.
  for (const i of ranked) {
    if (selected.length >= max) break;
    if (!selectedSlugs.has(i.slug)) {
      selected.push(i);
      selectedSlugs.add(i.slug);
    }
  }

  return selected;
}
