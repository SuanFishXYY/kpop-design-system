#!/usr/bin/env node
// scripts/backfill-group-agencies.mjs
// 为缺少 agency 的 group 文件补全厂牌信息。

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const GROUPS = join(process.cwd(), "groups");

const AGENCY_MAP = {
  "2ne1": "YG",
  "4min": "Cube",
  "aespa": "SM",
  "aoa": "FNC",
  "apink": "IST",
  "as": "Pledis",
  "beg": "Nega Network",
  "bm": "YG",
  "bp": "YG",
  "bravegirls": "Brave",
  "dc": "Dreamcatcher Company",
  "everglow": "Yuehua",
  "exid": "Banana Culture",
  "fromis": "Pledis",
  "fx": "SM",
  "gd": "DreamT",
  "gfriend": "Source",
  "h2h": "SM",
  "idle": "Cube",
  "illit": "Belift",
  "itzy": "JYP",
  "ive": "Starship",
  "izna": "WAKEONE",
  "kara": "DSP",
  "katseye": "HYBE",
  "kep1er": "WAKEONE",
  "kiii": "Starship",
  "kol": "S2",
  "lapillus": "MLD",
  "loona": "Blockberry",
  "lovelyz": "Woollim",
  "lsf": "Source",
  "meovv": "THEBLACKLABEL",
  "missa": "JYP",
  "mmm": "RBW",
  "momoland": "MLD",
  "niziu": "JYP",
  "nj": "ADOR",
  "nmixx": "JYP",
  "omg": "WM",
  "rv": "SM",
  "secret": "TS",
  "sistar": "Starship",
  "smn": "iNKODE",
  "snsd": "SM",
  "stayc": "Highup",
  "tara": "MBK",
  "triples": "MODHAUS",
  "twice": "JYP",
  "wg": "JYP",
  "wjsn": "Starship",
  "xg": "XGALX",
};

let updated = 0;
for (const f of readdirSync(GROUPS).filter(x => x.endsWith(".md"))) {
  const slug = f.replace(/\.md$/, "");
  const agency = AGENCY_MAP[slug];
  if (!agency) continue;
  const path = join(GROUPS, f);
  let raw = readFileSync(path, "utf-8");
  const hasAgency = /^agency:/m.test(raw);
  if (hasAgency) {
    // 规范化已有的“HYBE?Belift”这类脏值
    raw = raw.replace(/^agency:\s*"?[^\n"]*\?[^\n"]*"?$/m, `agency: "${agency}"`);
  } else {
    // 在 era 或 group_name 后面插入 agency
    raw = raw.replace(/^(era:.*)$/m, `$1\nagency: "${agency}"`);
  }
  writeFileSync(path, raw, "utf-8");
  updated++;
}

console.log(`Updated ${updated} group files with agency.`);
