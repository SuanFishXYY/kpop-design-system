// engine/conflicts.mjs
//
// 第六种冲突机制: Personal Conflict (R-Personal)
//
// 在 idol / group / label 之间检测**有据可查的公开商业/人事冲突**,
// 在召集 council 时给出 advisory + 建议调和方.
//
// ⚠️  伦理边界:
// 只编码 **公开商业 / 法律 / 人事变动事实**,
// 不编码未证实的指控 / 八卦 / 私人传闻.
//
// 数据可来自:
//   • 上市公司公告 (label 合同纠纷)
//   • 法庭公开记录
//   • 团成员阵容变动官方公告 (退团 / 加入)
//
// 推荐扩展模式: 用户根据自己的领域知识扩展 PERSONAL_CONFLICTS registry,
// 系统提供框架, 不替用户认定是非.

/**
 * Registry of public, documented inter-personnel conflicts.
 * Seeded minimally — users extend based on domain knowledge.
 *
 * Schema:
 *   parties: [slug, slug, ...]  // idol slug | group slug | label slug
 *   type:    "label-dispute" | "post-departure" | "lineup-change" | "cross-company-public"
 *   severity: "low" | "medium" | "high"
 *   advisory: string  (中性描述, 不带价值判断)
 *   suggested_mediator: string | null  (建议召唤的第三方调停席)
 *   public_record: string  (引用来源 — 公开来源唯一)
 */
export const PERSONAL_CONFLICTS = [
  // 示意性 schema 入口 — 真实部署时由用户基于自己的领域知识扩展.
  // 不预设具体真实人物以保持框架中立性.
  //
  // 示例 (注释 — 不激活):
  // {
  //   parties: ["nj-minji", "nj-hanni", "nj-danielle", "nj-haerin", "nj-hyein"],
  //   type: "label-dispute",
  //   severity: "high",
  //   advisory: "brief should not assume harmonious co-existence between these parties and their original label entity until public legal proceedings resolve.",
  //   suggested_mediator: "neutral-evaluator",
  //   public_record: "2024-2025 公开法律程序"
  // }
];

/**
 * Label Dispute Advisories · 团 ↔ label 层面的公开商业/法律纠纷
 *
 * 与 PERSONAL_CONFLICTS 不同: 这里编码的不是"成员之间的冲突",
 * 而是"团与其 label 之间有据可查的公开纠纷" — 影响 brief 创作的
 * **语境信号**, 不是召集互斥.
 *
 * 入选标准 (硬约束):
 *   ✅ 上市公司公告 / 法庭公开记录 / 双方官方声明
 *   ❌ 未证实指控 / 八卦 / 粉圈传闻
 *
 * 语言要求: **完全中性**, 不带价值判断, 不站队.
 */
export const LABEL_DISPUTE_ADVISORIES = [
  {
    group_slug: "newjeans",
    label_entity: "ADOR (HYBE subsidiary)",
    status: "active public legal proceedings",
    advisory: "this group has publicly documented active legal proceedings between members and their label entity as of public record. brief authoring involving this group should not assume harmonious artist-label co-existence; date-sensitive marketing content should account for public uncertainty about the group's operating status.",
    affected_members: ["nj-minji", "nj-hanni", "nj-danielle", "nj-haerin", "nj-hyein"],
    public_record: "2024-2025 公开法律程序 · HYBE / ADOR 双方公告 · 法院文件",
    suggested_mediator: "neutral-evaluator",
  },
];

/**
 * 检测 council 是否涉及有 label dispute advisory 的团
 *
 * @param {Array<{slug:string, group_slug?:string}>} souls - council 团魂列表
 * @param {Array} registry - 可选, 测试用替代 registry
 * @returns {{has_label_dispute:boolean, advisories:Array}}
 */
export function checkLabelDisputeAwareness(souls, registry = LABEL_DISPUTE_ADVISORIES) {
  if (!Array.isArray(souls) || souls.length === 0) {
    return { has_label_dispute: false, advisories: [] };
  }
  const soulSlugs = new Set(souls.map(s => (s.group_slug || s.slug || "").toLowerCase()));
  const advisories = [];
  for (const entry of registry) {
    if (soulSlugs.has((entry.group_slug || "").toLowerCase())) {
      advisories.push({
        rule: "R-LabelDispute",
        group_slug: entry.group_slug,
        label_entity: entry.label_entity,
        status: entry.status,
        advisory: entry.advisory,
        public_record: entry.public_record,
        suggested_mediator: entry.suggested_mediator || null,
      });
    }
  }
  return {
    has_label_dispute: advisories.length > 0,
    advisories,
  };
}

/**
 * 检测 council 中是否存在 personal conflict
 *
 * @param {string[]} councilParties - council 成员 slug 数组 (idol + soul + judge)
 * @param {Array} registry - 可选, 测试用替代 registry
 * @returns {{has_personal_conflict: boolean, fires: Array}}
 */
export function checkPersonalConflict(councilParties, registry = PERSONAL_CONFLICTS) {
  if (!Array.isArray(councilParties) || councilParties.length < 2) {
    return { has_personal_conflict: false, fires: [] };
  }
  const slugSet = new Set(councilParties.map(s => (s || "").toLowerCase()));
  const fires = [];
  for (const conflict of registry) {
    const present = (conflict.parties || []).filter(p => slugSet.has((p || "").toLowerCase()));
    if (present.length >= 2) {
      fires.push({
        rule: "R-Personal",
        parties: present,
        conflict_type: conflict.type || "unspecified",
        severity: conflict.severity || "medium",
        advisory: conflict.advisory || "two or more parties with documented public conflict are present in council",
        suggested_mediator: conflict.suggested_mediator || null,
        public_record: conflict.public_record || "",
      });
    }
  }
  return {
    has_personal_conflict: fires.length > 0,
    fires,
  };
}

/**
 * 聚合每个 agent 自带的 personal_conflict 字段 (与 registry 互补).
 * agent frontmatter 可声明 `personal_conflict: ["other-slug-1", "other-slug-2"]`
 * 此函数把这些 per-agent 声明展开成对称 pair, 与 registry 合并供 checkPersonalConflict 使用.
 *
 * @param {Array<{slug:string, personal_conflict?:string[]}>} agents
 * @returns {Array} 派生 conflict entries (default type/severity)
 */
export function deriveFromAgentFields(agents) {
  const derived = [];
  const seen = new Set();
  for (const a of agents || []) {
    if (!a || !Array.isArray(a.personal_conflict)) continue;
    for (const other of a.personal_conflict) {
      const key = [a.slug, other].sort().join("::");
      if (seen.has(key)) continue;
      seen.add(key);
      derived.push({
        parties: [a.slug, other],
        type: "agent-declared",
        severity: "medium",
        advisory: `${a.slug} 与 ${other} 声明 personal_conflict (per-agent field)`,
        suggested_mediator: null,
        public_record: "agent frontmatter declaration",
      });
    }
  }
  return derived;
}
