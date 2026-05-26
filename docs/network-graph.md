# 🕸️ KPOP 议会网络可视化

> 三场 brief，三个 hub idol（**Yujin · Momo · Sana**）各自召集议会
> 展示加权陪审团的真实关联结构 + 跨场重叠节点（共识 idol）

---

## 一、三 hub 议会全景图

```mermaid
graph TD
  %% ========== HUB 1: IVE Yujin · 品牌叙事议会 ==========
  Yujin["🩷 <b>IVE Yujin</b><br/><i>i AM</i><br/>队长·清冷御姐"]
  Leeseo["✨ IVE Leeseo<br/><i>magic</i><br/>魔法少女"]
  Rei["🌸 IVE Rei<br/><i>idol rapper</i><br/>日韩双语 flow"]
  K1Yujin["💎 Kep1er Yujin<br/><i>queendom</i><br/>跨团对照"]

  Yujin -->|"hero copy 主语前置"| Leeseo
  Yujin -->|"双语品牌叙事"| Rei
  Yujin -->|"queendom 美学校验"| K1Yujin

  %% ========== HUB 2: TWICE Momo · 动效节奏议会 ==========
  Momo["💖 <b>TWICE Momo</b><br/><i>练习了一千次</i><br/>main dancer 爆发力"]
  Mina["🦢 TWICE Mina<br/><i>black swan</i><br/>芭蕾克制"]
  Nayeon["🐰 TWICE Nayeon<br/><i>shy shy shy</i><br/>队长撒娇双修"]
  Hwasa["🔥 MMM Hwasa<br/><i>i'm gone</i><br/>大字加粗走人"]

  Momo -->|"前 200ms 蓄势"| Mina
  Momo -->|"后 300ms 爆发"| Nayeon
  Momo -->|"反差 stop motion"| Hwasa

  %% ========== HUB 3: TWICE Sana · 氛围撒娇议会 ==========
  Sana["🌷 <b>TWICE Sana</b><br/><i>把心送出去</i><br/>气氛制造机"]
  Jeongyeon["✂️ TWICE Jeongyeon<br/><i>tomboy</i><br/>结构理性"]
  Rami["🎀 BABYMONSTER Rami<br/><i>baby tiger</i><br/>5 代新势力"]

  Sana -->|"shy shy shy 微交互"| Nayeon
  Sana -->|"理性反差 fallback"| Jeongyeon
  Sana -->|"5 代传承校验"| Rami

  %% ========== 跨议会重叠节点（共识 idol）==========
  classDef hub fill:#ff6b9d,stroke:#c2185b,stroke-width:3px,color:#fff;
  classDef bridge fill:#ffd93d,stroke:#f57f17,stroke-width:2px,color:#000;
  classDef helper fill:#fff,stroke:#ce93d8;

  class Yujin,Momo,Sana hub;
  class Nayeon bridge;
  class Leeseo,Rei,K1Yujin,Mina,Hwasa,Jeongyeon,Rami helper;
```

> 📍 **Nayeon 是 bridge node**（黄色）—— 同时被 Momo 和 Sana 召集，是 TWICE 内部"队长+撒娇双修"的关键共识节点。

---

## 二、单场议会决议流程（以 Yujin 主持的"高端化妆品官网 hero"为例）

```mermaid
sequenceDiagram
  participant U as 👤 用户
  participant BM as 🎯 bench-matcher
  participant Y as 🩷 Yujin (主持)
  participant L as ✨ Leeseo
  participant R as 🌸 Rei
  participant J as 🗳️ 陪审团

  U->>BM: "高端化妆品官网 hero, 极简未来感"
  BM->>Y: 召集 Yujin (品牌叙事 hub)
  Y->>Y: 自动邀请: Leeseo + Rei + Karina + Jennie + Wonyoung...
  Y->>L: 你怎么看？
  L-->>Y: hero 用 magic girl 视觉<br/>+ 微闪光粒子
  Y->>R: 文案呢？
  R-->>Y: 双语主语前置<br/>"i AM. she IS."
  Y->>J: 投票
  J-->>J: Tier 0 (×2 票) ✅ × 8<br/>Tier 1 (×1.5 票) ✅ × 4<br/>共 22 票 / 总 30 (73%)
  J-->>U: ✅ 决议通过 (≥ 2/3)
```

---

## 三、规模视图：97 idol 议会全网（Tier 分布）

```mermaid
pie title 97 idol Tier 分布
  "Tier 0 全员议会 (vote=2)" : 64
  "Tier 1 代际 leader (vote=1.5)" : 33
```

```mermaid
pie title 4 代 generation 占比
  "Gen 2 (07-13): SNSD/KARA/2NE1..." : 22
  "Gen 3 (14-18): TWICE/BP/RV..." : 28
  "Gen 4 (19-23): aespa/IVE/NJ..." : 35
  "Gen 5 (24-): BABYMONSTER/ILLIT..." : 12
```

---

## 四、Bridge node 排行 (议会跨场出现频次 Top 5)

| 排名 | Idol | 跨场频次 | 角色 |
|------|------|---------|------|
| 🥇 | TWICE Nayeon | 12 场 | 队长能量 + 撒娇双修 |
| 🥈 | BLACKPINK Jennie | 11 场 | clean girl 极简 |
| 🥉 | aespa Karina | 10 场 | alter ego B 面 |
| 4 | IVE Yujin | 9 场 | 主语前置宣言 |
| 5 | MAMAMOO Hwasa | 8 场 | 大字宣言不解释 |

> Bridge node 是议会跨议题的"共识黏合剂"。
> 调试 ui-auditor 命中率时，优先校准 bridge node 的 trigger 关键词。

---

## 🎤 设计意图

- **Hub**：主持人 idol，召集 trigger 关键词高度匹配的同代/同团/同 role 助攻
- **Bridge**：跨多 hub 出现的"共识 idol"，是议会黏合剂
- **加权**：Tier 0 (×2) > Tier 1 (×1.5)，防止"小团崛起 idol"在话语权上被淹没
- **决议**：≥ 2/3 票才能通过，反对 1 票否决的暴政

完整 invited_helpers 数据见每个 agent 文件的 frontmatter。
