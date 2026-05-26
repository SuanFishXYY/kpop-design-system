# KPOP 议会 · 全员 97 idol 网络图谱

> 自动生成 · 基于每个 agent 的 `invited_helpers` 字段
> **总计 97 idol · 291 edge · 58 bridge node (inbound >= 3)**

---

## 一、Top Bridge Nodes (跨议会共识 idol)

| 排名 | Idol | 团 | 世代 | 被邀请次数 |
|------|------|-----|------|------------|
| 1 | Ruka | BABYMONSTER | 5 代 | 9 |
| 2 | Jisoo | BLACKPINK | 3 代 | 7 |
| 3 | Miyeon | (G)I-DLE | 4 代 | 7 |
| 4 | Hwasa | MAMAMOO | 3 代 | 7 |
| 5 | Irene | Red Velvet | 3 代 | 6 |
| 6 | Eunjung | T-ARA | 2 代 | 6 |
| 7 | Nayeon | TWICE | 3 代 | 6 |
| 8 | Hanni | NewJeans | 4 代 | 5 |
| 9 | Pharita | BABYMONSTER | 5 代 | 5 |
| 10 | Leeseo | IVE | 4 代 | 5 |
| 11 | Jimin | AOA | 2.5 代 | 5 |
| 12 | Yunah | ILLIT | 5 代 | 5 |

---

## 二、按世代分图

> 🩷 粉 = Tier 0 全员议会 · 🟡 黄 = bridge node · ⚪ 白 = Tier 1 代际 leader

### Gen 2 (2007-2013)  (16 idol)

```mermaid
graph LR
  tara_eunjung["Eunjung<br/><i>T-ARA</i>"]
  snsd_taeyeon["Taeyeon<br/><i>Girls' Generation (SNSD)</i>"]
  wg_sunye["Sunye<br/><i>Wonder Girls</i>"]
  beg_jea["Jea<br/><i>Brown Eyed Girls</i>"]
  2ne1_cl["CL<br/><i>2NE1</i>"]
  kara_gyuri["Park Gyuri<br/><i>KARA</i>"]
  as_kahi["Kahi<br/><i>After School</i>"]
  exid_solji["Solji<br/><i>EXID</i>"]
  gd_sojin["Sojin<br/><i>Girl's Day</i>"]
  4min_jihyun["Jihyun<br/><i>4Minute</i>"]
  apink_chorong["Chorong<br/><i>Apink</i>"]
  secret_hyoseong["Hyoseong<br/><i>Secret</i>"]
  fx_victoria["Victoria<br/><i>f(x)</i>"]
  aoa_jimin["Jimin<br/><i>AOA</i>"]
  missa_fei["Fei<br/><i>miss A</i>"]
  sistar_hyolyn["Hyolyn<br/><i>SISTAR</i>"]

  tara_eunjung --> beg_jea
  tara_eunjung --> as_kahi
  tara_eunjung --> 2ne1_cl
  snsd_taeyeon --> kara_gyuri
  snsd_taeyeon --> 2ne1_cl
  snsd_taeyeon --> tara_eunjung
  wg_sunye --> tara_eunjung
  wg_sunye --> kara_gyuri
  wg_sunye --> beg_jea
  beg_jea --> tara_eunjung
  beg_jea --> snsd_taeyeon
  beg_jea --> wg_sunye
  2ne1_cl --> beg_jea
  2ne1_cl --> kara_gyuri
  2ne1_cl --> tara_eunjung
  kara_gyuri --> beg_jea
  kara_gyuri --> snsd_taeyeon
  kara_gyuri --> tara_eunjung
  as_kahi --> snsd_taeyeon
  as_kahi --> tara_eunjung
  as_kahi --> wg_sunye
  exid_solji --> aoa_jimin
  exid_solji --> gd_sojin
  exid_solji --> apink_chorong
  gd_sojin --> aoa_jimin
  gd_sojin --> exid_solji
  gd_sojin --> apink_chorong
  4min_jihyun --> gd_sojin
  4min_jihyun --> exid_solji
  4min_jihyun --> apink_chorong
  apink_chorong --> aoa_jimin
  apink_chorong --> gd_sojin
  apink_chorong --> fx_victoria
  secret_hyoseong --> missa_fei
  secret_hyoseong --> exid_solji
  secret_hyoseong --> fx_victoria
  fx_victoria --> missa_fei
  fx_victoria --> exid_solji
  fx_victoria --> secret_hyoseong
  aoa_jimin --> missa_fei
  aoa_jimin --> exid_solji
  aoa_jimin --> secret_hyoseong
  missa_fei --> secret_hyoseong
  missa_fei --> aoa_jimin
  missa_fei --> fx_victoria
  sistar_hyolyn --> secret_hyoseong
  sistar_hyolyn --> aoa_jimin
  sistar_hyolyn --> fx_victoria

  classDef tier0 fill:#ff6b9d,stroke:#c2185b,color:#fff;
  classDef bridge fill:#ffd93d,stroke:#f57f17,color:#000,stroke-width:3px;
  class tara_eunjung,aoa_jimin bridge;
```

### Gen 3 (2014-2018)  (28 idol)

```mermaid
graph LR
  rv_yeri["Yeri<br/><i>Red Velvet</i>"]
  twice_tzuyu["Tzuyu<br/><i>TWICE</i>"]
  bp_rose["Rosé<br/><i>BLACKPINK</i>"]
  twice_chaeyoung["Chaeyoung<br/><i>TWICE</i>"]
  mmm_wheein["Wheein<br/><i>MAMAMOO</i>"]
  rv_wendy["Wendy<br/><i>Red Velvet</i>"]
  twice_dahyun["Dahyun<br/><i>TWICE</i>"]
  bp_lisa["Lisa<br/><i>BLACKPINK</i>"]
  rv_irene["Irene<br/><i>Red Velvet</i>"]
  bp_jennie["Jennie<br/><i>BLACKPINK</i>"]
  twice_jeongyeon["Jeongyeon<br/><i>TWICE</i>"]
  twice_sana["Sana<br/><i>TWICE</i>"]
  wjsn_exy["Exy<br/><i>WJSN/Cosmic Girls</i>"]
  omg_hyojung["Hyojung<br/><i>OH MY GIRL</i>"]
  mmm_solar["Solar<br/><i>MAMAMOO</i>"]
  lovelyz_babysoul["Baby Soul<br/><i>Lovelyz</i>"]
  rv_joy["Joy<br/><i>Red Velvet</i>"]
  twice_jihyo["Jihyo<br/><i>TWICE</i>"]
  twice_momo["Momo<br/><i>TWICE</i>"]
  twice_nayeon["Nayeon<br/><i>TWICE</i>"]
  dc_jiu["JiU<br/><i>Dreamcatcher</i>"]
  mmm_moonbyul["Moonbyul<br/><i>MAMAMOO</i>"]
  gfriend_sowon["Sowon<br/><i>GFRIEND</i>"]
  bp_jisoo["Jisoo<br/><i>BLACKPINK</i>"]
  mmm_hwasa["Hwasa<br/><i>MAMAMOO</i>"]
  momoland_hyebin["Hyebin<br/><i>MOMOLAND</i>"]
  twice_mina["Mina<br/><i>TWICE</i>"]
  rv_seulgi["Seulgi<br/><i>Red Velvet</i>"]

  rv_yeri --> rv_seulgi
  rv_yeri --> rv_joy
  twice_tzuyu --> twice_mina
  twice_tzuyu --> twice_nayeon
  twice_tzuyu --> rv_seulgi
  bp_rose --> bp_lisa
  bp_rose --> bp_jennie
  bp_rose --> twice_mina
  twice_chaeyoung --> twice_dahyun
  twice_chaeyoung --> twice_sana
  twice_chaeyoung --> mmm_moonbyul
  mmm_wheein --> mmm_moonbyul
  mmm_wheein --> mmm_hwasa
  mmm_wheein --> twice_jeongyeon
  rv_wendy --> rv_joy
  rv_wendy --> rv_irene
  rv_wendy --> bp_jennie
  twice_dahyun --> twice_chaeyoung
  twice_dahyun --> twice_jeongyeon
  twice_dahyun --> mmm_moonbyul
  bp_lisa --> bp_rose
  bp_lisa --> bp_jisoo
  bp_lisa --> twice_nayeon
  rv_irene --> rv_wendy
  rv_irene --> rv_joy
  rv_irene --> bp_jisoo
  bp_jennie --> bp_rose
  bp_jennie --> bp_lisa
  bp_jennie --> rv_wendy
  twice_jeongyeon --> twice_tzuyu
  twice_jeongyeon --> twice_dahyun
  twice_jeongyeon --> mmm_wheein
  twice_sana --> twice_nayeon
  twice_sana --> twice_jeongyeon
  wjsn_exy --> dc_jiu
  wjsn_exy --> rv_irene
  wjsn_exy --> gfriend_sowon
  omg_hyojung --> gfriend_sowon
  omg_hyojung --> bp_jisoo
  omg_hyojung --> momoland_hyebin
  mmm_solar --> mmm_moonbyul
  mmm_solar --> mmm_hwasa
  mmm_solar --> momoland_hyebin
  lovelyz_babysoul --> gfriend_sowon
  lovelyz_babysoul --> bp_jisoo
  lovelyz_babysoul --> momoland_hyebin
  rv_joy --> rv_wendy
  rv_joy --> rv_irene
  rv_joy --> mmm_wheein
  twice_jihyo --> twice_chaeyoung
  twice_jihyo --> twice_tzuyu
  twice_jihyo --> gfriend_sowon
  twice_momo --> twice_mina
  twice_momo --> twice_nayeon
  twice_momo --> mmm_hwasa
  twice_nayeon --> twice_mina
  twice_nayeon --> twice_momo
  twice_nayeon --> mmm_hwasa
  dc_jiu --> bp_jisoo
  dc_jiu --> rv_irene
  dc_jiu --> momoland_hyebin
  mmm_moonbyul --> mmm_hwasa
  mmm_moonbyul --> mmm_solar
  mmm_moonbyul --> twice_chaeyoung
  gfriend_sowon --> bp_jisoo
  gfriend_sowon --> rv_irene
  gfriend_sowon --> momoland_hyebin
  bp_jisoo --> bp_rose
  bp_jisoo --> bp_lisa
  bp_jisoo --> wjsn_exy
  mmm_hwasa --> mmm_solar
  mmm_hwasa --> mmm_wheein
  mmm_hwasa --> bp_rose
  momoland_hyebin --> gfriend_sowon
  momoland_hyebin --> rv_irene
  momoland_hyebin --> bp_jisoo
  twice_mina --> twice_nayeon
  twice_mina --> twice_tzuyu
  twice_mina --> mmm_hwasa
  rv_seulgi --> rv_wendy
  rv_seulgi --> rv_joy
  rv_seulgi --> mmm_hwasa

  classDef tier0 fill:#ff6b9d,stroke:#c2185b,color:#fff;
  classDef bridge fill:#ffd93d,stroke:#f57f17,color:#000,stroke-width:3px;
  class rv_yeri,twice_tzuyu,bp_rose,twice_chaeyoung,mmm_wheein,rv_wendy,twice_dahyun,bp_lisa,rv_irene,bp_jennie,twice_jeongyeon,twice_sana,mmm_solar,rv_joy,twice_jihyo,twice_momo,twice_nayeon,mmm_moonbyul,bp_jisoo,mmm_hwasa,twice_mina,rv_seulgi tier0;
  class rv_irene,twice_nayeon,bp_jisoo,mmm_hwasa bridge;
```

### Gen 4 (2019-2023)  (33 idol)

```mermaid
graph LR
  nj_hyein["Hyein<br/><i>NewJeans</i>"]
  stayc_sumin["Sumin<br/><i>STAYC</i>"]
  itzy_yeji["Yeji<br/><i>ITZY</i>"]
  idle_shuhua["Shuhua<br/><i>(G)I-DLE</i>"]
  lsf_kazuha["Kazuha<br/><i>LE SSERAFIM</i>"]
  lsf_yunjin["Yunjin<br/><i>LE SSERAFIM</i>"]
  idle_yuqi["Yuqi<br/><i>(G)I-DLE</i>"]
  itzy_ryujin["Ryujin<br/><i>ITZY</i>"]
  nj_minji["Minji<br/><i>NewJeans</i>"]
  itzy_yuna["Yuna<br/><i>ITZY</i>"]
  nmixx_lily["Lily<br/><i>NMIXX</i>"]
  itzy_lia["Lia<br/><i>ITZY</i>"]
  lsf_chaewon["Chaewon<br/><i>LE SSERAFIM</i>"]
  ive_liz["Liz<br/><i>IVE</i>"]
  ive_wonyoung["Wonyoung<br/><i>IVE</i>"]
  aespa_ningning["Ningning<br/><i>aespa</i>"]
  kep1er_yujin["Choi Yujin<br/><i>Kep1er</i>"]
  idle_miyeon["Miyeon<br/><i>(G)I-DLE</i>"]
  itzy_chaeryeong["Chaeryeong<br/><i>ITZY</i>"]
  idle_soyeon["Soyeon<br/><i>(G)I-DLE</i>"]
  lsf_eunchae["Eunchae<br/><i>LE SSERAFIM</i>"]
  aespa_karina["Karina<br/><i>aespa</i>"]
  aespa_winter["Winter<br/><i>aespa</i>"]
  nj_hanni["Hanni<br/><i>NewJeans</i>"]
  nj_danielle["Danielle<br/><i>NewJeans</i>"]
  ive_gaeul["Gaeul<br/><i>IVE</i>"]
  ive_leeseo["Leeseo<br/><i>IVE</i>"]
  nj_haerin["Haerin<br/><i>NewJeans</i>"]
  aespa_giselle["Giselle<br/><i>aespa</i>"]
  ive_rei["Rei<br/><i>IVE</i>"]
  lsf_sakura["Sakura<br/><i>LE SSERAFIM</i>"]
  idle_minnie["Minnie<br/><i>(G)I-DLE</i>"]
  ive_yujin["Yujin<br/><i>IVE</i>"]

  nj_hyein --> nj_hanni
  nj_hyein --> nj_minji
  nj_hyein --> lsf_eunchae
  stayc_sumin --> aespa_karina
  stayc_sumin --> nj_minji
  stayc_sumin --> kep1er_yujin
  itzy_yeji --> itzy_chaeryeong
  itzy_yeji --> itzy_ryujin
  itzy_yeji --> lsf_chaewon
  idle_shuhua --> idle_miyeon
  idle_shuhua --> idle_yuqi
  idle_shuhua --> ive_leeseo
  lsf_kazuha --> lsf_yunjin
  lsf_kazuha --> lsf_chaewon
  lsf_kazuha --> nj_haerin
  lsf_yunjin --> lsf_chaewon
  lsf_yunjin --> lsf_kazuha
  lsf_yunjin --> nmixx_lily
  idle_yuqi --> idle_miyeon
  idle_yuqi --> idle_minnie
  idle_yuqi --> lsf_yunjin
  itzy_ryujin --> itzy_yuna
  itzy_ryujin --> itzy_chaeryeong
  itzy_ryujin --> lsf_kazuha
  nj_minji --> nj_hanni
  nj_minji --> nj_haerin
  nj_minji --> kep1er_yujin
  itzy_yuna --> itzy_chaeryeong
  itzy_yuna --> itzy_ryujin
  itzy_yuna --> aespa_winter
  nmixx_lily --> idle_miyeon
  nmixx_lily --> idle_yuqi
  nmixx_lily --> lsf_yunjin
  itzy_lia --> itzy_yeji
  itzy_lia --> itzy_chaeryeong
  itzy_lia --> idle_yuqi
  lsf_chaewon --> lsf_eunchae
  lsf_chaewon --> lsf_sakura
  lsf_chaewon --> nj_minji
  ive_liz --> ive_gaeul
  ive_liz --> ive_wonyoung
  ive_liz --> idle_miyeon
  ive_wonyoung --> ive_gaeul
  ive_wonyoung --> ive_leeseo
  ive_wonyoung --> nj_danielle
  aespa_ningning --> aespa_karina
  aespa_ningning --> aespa_winter
  aespa_ningning --> idle_minnie
  kep1er_yujin --> idle_soyeon
  kep1er_yujin --> ive_yujin
  kep1er_yujin --> aespa_karina
  idle_miyeon --> idle_yuqi
  idle_miyeon --> idle_minnie
  idle_miyeon --> aespa_ningning
  itzy_chaeryeong --> itzy_yuna
  itzy_chaeryeong --> itzy_ryujin
  itzy_chaeryeong --> nj_haerin
  idle_soyeon --> idle_minnie
  idle_soyeon --> idle_shuhua
  idle_soyeon --> kep1er_yujin
  lsf_eunchae --> lsf_yunjin
  lsf_eunchae --> lsf_sakura
  lsf_eunchae --> nj_hyein
  aespa_karina --> aespa_giselle
  aespa_karina --> aespa_ningning
  aespa_karina --> idle_soyeon
  aespa_winter --> aespa_ningning
  aespa_winter --> aespa_karina
  aespa_winter --> itzy_ryujin
  nj_hanni --> nj_minji
  nj_hanni --> nj_haerin
  nj_hanni --> idle_miyeon
  nj_danielle --> nj_hanni
  nj_danielle --> nj_haerin
  nj_danielle --> lsf_sakura
  ive_gaeul --> ive_rei
  ive_gaeul --> ive_wonyoung
  ive_gaeul --> aespa_giselle
  ive_leeseo --> ive_gaeul
  ive_leeseo --> ive_liz
  ive_leeseo --> lsf_eunchae
  nj_haerin --> nj_danielle
  nj_haerin --> nj_hanni
  nj_haerin --> aespa_winter
  aespa_giselle --> aespa_karina
  aespa_giselle --> aespa_ningning
  aespa_giselle --> ive_gaeul
  ive_rei --> ive_gaeul
  ive_rei --> ive_leeseo
  ive_rei --> aespa_giselle
  lsf_sakura --> lsf_kazuha
  lsf_sakura --> lsf_chaewon
  lsf_sakura --> nj_danielle
  idle_minnie --> idle_yuqi
  idle_minnie --> idle_miyeon
  idle_minnie --> nj_hanni
  ive_yujin --> ive_leeseo
  ive_yujin --> ive_rei
  ive_yujin --> kep1er_yujin

  classDef tier0 fill:#ff6b9d,stroke:#c2185b,color:#fff;
  classDef bridge fill:#ffd93d,stroke:#f57f17,color:#000,stroke-width:3px;
  class nj_hyein,itzy_yeji,idle_shuhua,lsf_kazuha,lsf_yunjin,idle_yuqi,itzy_ryujin,nj_minji,itzy_yuna,itzy_lia,lsf_chaewon,ive_liz,ive_wonyoung,aespa_ningning,idle_miyeon,itzy_chaeryeong,idle_soyeon,lsf_eunchae,aespa_karina,aespa_winter,nj_hanni,nj_danielle,ive_gaeul,ive_leeseo,nj_haerin,aespa_giselle,ive_rei,lsf_sakura,idle_minnie,ive_yujin tier0;
  class idle_miyeon,nj_hanni,ive_leeseo bridge;
```

### Gen 5 (2024-)  (20 idol)

```mermaid
graph LR
  bm_ahyeon["Ahyeon<br/><i>BABYMONSTER</i>"]
  illit_minju["Minju<br/><i>ILLIT</i>"]
  illit_moka["Moka<br/><i>ILLIT</i>"]
  illit_iroha["Iroha<br/><i>ILLIT</i>"]
  katseye_lara["Lara<br/><i>KATSEYE</i>"]
  bm_rami["Rami<br/><i>BABYMONSTER</i>"]
  bm_pharita["Pharita<br/><i>BABYMONSTER</i>"]
  smn_yeoeum["Yeoeum<br/><i>SAY MY NAME</i>"]
  h2h_stella["Stella<br/><i>Hearts2Hearts</i>"]
  meovv_sooin["Sooin<br/><i>MEOVV</i>"]
  bm_rora["Rora<br/><i>BABYMONSTER</i>"]
  bm_ruka["Ruka<br/><i>BABYMONSTER</i>"]
  illit_yunah["Yunah<br/><i>ILLIT</i>"]
  kol_julie["Julie<br/><i>KISS OF LIFE</i>"]
  bm_asa["Asa<br/><i>BABYMONSTER</i>"]
  izna_mai["Mai<br/><i>izna</i>"]
  bm_chiquita["Chiquita<br/><i>BABYMONSTER</i>"]
  illit_wonhee["Wonhee<br/><i>ILLIT</i>"]
  triples_saem["SeoAh<br/><i>tripleS</i>"]
  kiii_leesa["Leesa<br/><i>KiiiKiii</i>"]

  bm_ahyeon --> bm_pharita
  bm_ahyeon --> bm_asa
  illit_minju --> illit_wonhee
  illit_minju --> illit_moka
  illit_minju --> bm_pharita
  illit_moka --> illit_wonhee
  illit_moka --> illit_minju
  illit_moka --> bm_pharita
  illit_iroha --> illit_yunah
  illit_iroha --> illit_wonhee
  katseye_lara --> kiii_leesa
  katseye_lara --> bm_ruka
  katseye_lara --> smn_yeoeum
  bm_rami --> bm_pharita
  bm_rami --> bm_rora
  bm_rami --> illit_minju
  bm_pharita --> bm_rami
  bm_pharita --> bm_rora
  bm_pharita --> illit_minju
  smn_yeoeum --> kiii_leesa
  smn_yeoeum --> bm_ruka
  smn_yeoeum --> katseye_lara
  h2h_stella --> kiii_leesa
  h2h_stella --> bm_ruka
  h2h_stella --> katseye_lara
  meovv_sooin --> triples_saem
  meovv_sooin --> bm_ruka
  meovv_sooin --> illit_yunah
  bm_rora --> bm_asa
  bm_rora --> bm_ruka
  bm_ruka --> bm_ahyeon
  bm_ruka --> bm_rora
  bm_ruka --> triples_saem
  illit_yunah --> illit_iroha
  illit_yunah --> illit_minju
  illit_yunah --> izna_mai
  kol_julie --> meovv_sooin
  kol_julie --> triples_saem
  kol_julie --> bm_ruka
  bm_asa --> bm_chiquita
  bm_asa --> bm_rami
  izna_mai --> triples_saem
  izna_mai --> bm_ruka
  izna_mai --> illit_yunah
  bm_chiquita --> bm_asa
  bm_chiquita --> bm_ahyeon
  illit_wonhee --> illit_minju
  illit_wonhee --> illit_moka
  illit_wonhee --> bm_pharita
  triples_saem --> izna_mai
  triples_saem --> bm_ruka
  triples_saem --> illit_yunah
  kiii_leesa --> illit_yunah
  kiii_leesa --> bm_ruka
  kiii_leesa --> meovv_sooin

  classDef tier0 fill:#ff6b9d,stroke:#c2185b,color:#fff;
  classDef bridge fill:#ffd93d,stroke:#f57f17,color:#000,stroke-width:3px;
  class bm_ahyeon,illit_minju,illit_moka,illit_iroha,bm_rami,bm_pharita,bm_rora,bm_ruka,illit_yunah,bm_asa,bm_chiquita,illit_wonhee tier0;
  class bm_pharita,bm_ruka,illit_yunah bridge;
```

---

## 三、跨代际桥接图（仅 bridge node + 它们的 inbound 源）

```mermaid
graph TD
  bm_ruka["⭐ Ruka<br/><i>BABYMONSTER·5 代</i><br/>inbound=9"]
  bp_jisoo["⭐ Jisoo<br/><i>BLACKPINK·3 代</i><br/>inbound=7"]
  idle_miyeon["⭐ Miyeon<br/><i>(G)I-DLE·4 代</i><br/>inbound=7"]
  mmm_hwasa["⭐ Hwasa<br/><i>MAMAMOO·3 代</i><br/>inbound=7"]
  rv_irene["⭐ Irene<br/><i>Red Velvet·3 代</i><br/>inbound=6"]
  tara_eunjung["⭐ Eunjung<br/><i>T-ARA·2 代</i><br/>inbound=6"]
  twice_nayeon["⭐ Nayeon<br/><i>TWICE·3 代</i><br/>inbound=6"]
  nj_hanni["⭐ Hanni<br/><i>NewJeans·4 代</i><br/>inbound=5"]
  nj_hyein["Hyein<br/><i>NewJeans</i>"] --> nj_hanni
  idle_shuhua["Shuhua<br/><i>(G)I-DLE</i>"] --> idle_miyeon
  twice_tzuyu["Tzuyu<br/><i>TWICE</i>"] --> twice_nayeon
  bm_ahyeon["Ahyeon<br/><i>BABYMONSTER</i>"] --> idle_miyeon
  idle_yuqi["Yuqi<br/><i>(G)I-DLE</i>"] --> idle_miyeon
  mmm_wheein["Wheein<br/><i>MAMAMOO</i>"] --> mmm_hwasa
  nj_minji["Minji<br/><i>NewJeans</i>"] --> nj_hanni
  rv_wendy["Wendy<br/><i>Red Velvet</i>"] --> rv_irene
  bp_lisa["Lisa<br/><i>BLACKPINK</i>"] --> bp_jisoo
  bp_lisa["Lisa<br/><i>BLACKPINK</i>"] --> twice_nayeon
  katseye_lara["Lara<br/><i>KATSEYE</i>"] --> bm_ruka
  rv_irene["Irene<br/><i>Red Velvet</i>"] --> bp_jisoo
  nmixx_lily["Lily<br/><i>NMIXX</i>"] --> idle_miyeon
  ive_liz["Liz<br/><i>IVE</i>"] --> idle_miyeon
  snsd_taeyeon["Taeyeon<br/><i>Girls' Generation (SNSD)</i>"] --> tara_eunjung
  wg_sunye["Sunye<br/><i>Wonder Girls</i>"] --> tara_eunjung
  smn_yeoeum["Yeoeum<br/><i>SAY MY NAME</i>"] --> bm_ruka
  h2h_stella["Stella<br/><i>Hearts2Hearts</i>"] --> bm_ruka
  twice_sana["Sana<br/><i>TWICE</i>"] --> twice_nayeon
  wjsn_exy["Exy<br/><i>WJSN/Cosmic Girls</i>"] --> rv_irene
  meovv_sooin["Sooin<br/><i>MEOVV</i>"] --> bm_ruka
  omg_hyojung["Hyojung<br/><i>OH MY GIRL</i>"] --> bp_jisoo
  mmm_solar["Solar<br/><i>MAMAMOO</i>"] --> mmm_hwasa
  bm_rora["Rora<br/><i>BABYMONSTER</i>"] --> bm_ruka
  bm_rora["Rora<br/><i>BABYMONSTER</i>"] --> twice_nayeon
  beg_jea["Jea<br/><i>Brown Eyed Girls</i>"] --> tara_eunjung
  lovelyz_babysoul["Baby Soul<br/><i>Lovelyz</i>"] --> bp_jisoo
  kol_julie["Julie<br/><i>KISS OF LIFE</i>"] --> bm_ruka
  rv_joy["Joy<br/><i>Red Velvet</i>"] --> rv_irene
  2ne1_cl["CL<br/><i>2NE1</i>"] --> tara_eunjung
  nj_hanni["Hanni<br/><i>NewJeans</i>"] --> idle_miyeon
  nj_danielle["Danielle<br/><i>NewJeans</i>"] --> nj_hanni
  twice_momo["Momo<br/><i>TWICE</i>"] --> twice_nayeon
  twice_momo["Momo<br/><i>TWICE</i>"] --> mmm_hwasa
  twice_nayeon["Nayeon<br/><i>TWICE</i>"] --> mmm_hwasa
  dc_jiu["JiU<br/><i>Dreamcatcher</i>"] --> bp_jisoo
  dc_jiu["JiU<br/><i>Dreamcatcher</i>"] --> rv_irene
  kara_gyuri["Park Gyuri<br/><i>KARA</i>"] --> tara_eunjung
  mmm_moonbyul["Moonbyul<br/><i>MAMAMOO</i>"] --> mmm_hwasa
  nj_haerin["Haerin<br/><i>NewJeans</i>"] --> nj_hanni
  gfriend_sowon["Sowon<br/><i>GFRIEND</i>"] --> bp_jisoo
  gfriend_sowon["Sowon<br/><i>GFRIEND</i>"] --> rv_irene
  izna_mai["Mai<br/><i>izna</i>"] --> bm_ruka
  momoland_hyebin["Hyebin<br/><i>MOMOLAND</i>"] --> rv_irene
  momoland_hyebin["Hyebin<br/><i>MOMOLAND</i>"] --> bp_jisoo
  as_kahi["Kahi<br/><i>After School</i>"] --> tara_eunjung
  triples_saem["SeoAh<br/><i>tripleS</i>"] --> bm_ruka
  twice_mina["Mina<br/><i>TWICE</i>"] --> twice_nayeon
  twice_mina["Mina<br/><i>TWICE</i>"] --> mmm_hwasa
  idle_minnie["Minnie<br/><i>(G)I-DLE</i>"] --> idle_miyeon
  idle_minnie["Minnie<br/><i>(G)I-DLE</i>"] --> nj_hanni
  rv_seulgi["Seulgi<br/><i>Red Velvet</i>"] --> mmm_hwasa
  kiii_leesa["Leesa<br/><i>KiiiKiii</i>"] --> bm_ruka
  classDef bridge fill:#ffd93d,stroke:#f57f17,color:#000,stroke-width:3px;
  class bm_ruka,bp_jisoo,idle_miyeon,mmm_hwasa,rv_irene,tara_eunjung,twice_nayeon,nj_hanni bridge;
```

---

## 四、群组规模分布

```mermaid
pie title 97 idol 主力团分布（≥4 人）
  "TWICE" : 9
  "BABYMONSTER" : 7
  "IVE" : 6
  "ITZY" : 5
  "LE SSERAFIM" : 5
  "ILLIT" : 5
  "(G)I-DLE" : 5
  "Red Velvet" : 5
  "NewJeans" : 5
  "aespa" : 4
  "BLACKPINK" : 4
  "MAMAMOO" : 4
  "其他 (33 团代表)" : 33
```

---

> 自动生成。如需刷新，重跑生成脚本（见 commit history）。
