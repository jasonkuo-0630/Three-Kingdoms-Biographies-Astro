#!/usr/bin/env node
/**
 * scripts/validate-data.js
 *
 * 開發用資料檢查腳本。純粹讀取 src/data/ 底下的 JSON 檔案、檢查文字內容
 * 合不合規則——不需要瀏覽器、不需要任何額外套件、不會有非同步時序問題。
 * 幾秒鐘內跑完，用法：
 *
 *   node scripts/validate-data.js
 *
 * 檢查項目：
 *   - 人物 JSON 是不是合法格式、檔名跟 id 是否一致
 *   - 人物 id、來源 id、勢力 id 是否重複
 *   - 所有 sourceId／actualFactionId／personId 引用的對象是否真的存在
 *   - works 為空陣列時是否還殘留 worksNote（這個規則被違反過不只一次，
 *     見 README「三方協作」章節記錄的孫權／關平／關興／劉協事件）
 *   - data/index.json 跟人物檔的姓名、頭像、發布狀態是否一致
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const CHAR_DIR = path.join(DATA_DIR, "characters");

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/* ---------- 讀取共用資料檔 ---------- */

let sourcesData, factionsData, indexData;

try {
  sourcesData = readJson(path.join(DATA_DIR, "sources.json"));
} catch (e) {
  err(`src/data/sources.json 讀取或解析失敗：${e.message}`);
}
try {
  factionsData = readJson(path.join(DATA_DIR, "factions.json"));
} catch (e) {
  err(`src/data/factions.json 讀取或解析失敗：${e.message}`);
}
try {
  indexData = readJson(path.join(DATA_DIR, "index.json"));
} catch (e) {
  err(`src/data/index.json 讀取或解析失敗：${e.message}`);
}

/* ---------- 來源 / 勢力 ID 重複檢查 ---------- */

const sourceIds = new Set();
if (sourcesData) {
  const seen = new Set();
  for (const s of sourcesData) {
    if (seen.has(s.id)) err(`sources.json：重複的來源 id「${s.id}」`);
    seen.add(s.id);
    sourceIds.add(s.id);
  }
}

const factionIds = new Set();
const filterGroupIds = new Set();
if (factionsData) {
  const seenFg = new Set();
  for (const fg of factionsData.filterGroups || []) {
    if (seenFg.has(fg.id)) err(`factions.json：重複的 filterGroups id「${fg.id}」`);
    seenFg.add(fg.id);
    filterGroupIds.add(fg.id);
  }
  const seenAf = new Set();
  for (const af of factionsData.actualFactions || []) {
    if (seenAf.has(af.id)) err(`factions.json：重複的 actualFaction id「${af.id}」`);
    seenAf.add(af.id);
    factionIds.add(af.id);
    if (af.filterGroup && !filterGroupIds.has(af.filterGroup)) {
      err(`factions.json：actualFaction「${af.id}」的 filterGroup「${af.filterGroup}」不存在`);
    }
  }
}

/* ---------- 逐一檢查人物檔 ---------- */

const characterFiles = fs
  .readdirSync(CHAR_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

const personIds = new Set();
const publishedPersonIds = new Set();
const characters = [];

for (const file of characterFiles) {
  let data;
  try {
    data = readJson(path.join(CHAR_DIR, file));
  } catch (e) {
    err(`${file}：JSON 解析失敗 — ${e.message}`);
    continue;
  }

  const expectedId = file.replace(/\.json$/, "");
  if (data.id !== expectedId) {
    err(`${file}：檔名應對應 id「${expectedId}」，但實際 id 是「${data.id}」`);
  }

  if (data.id) {
    if (personIds.has(data.id)) err(`重複的人物 id「${data.id}」（出現在多個檔案中）`);
    personIds.add(data.id);
    if (data.published) publishedPersonIds.add(data.id);
  }

  // works 規則：空陣列時不得殘留 worksNote
  if (Array.isArray(data.works) && data.works.length === 0 && data.worksNote) {
    err(`${file}：works 為空陣列，但仍保留 worksNote，違反「無著作人物不得有 worksNote」規則`);
  }

  characters.push({ file, id: data.id, data });
}

for (const id of personIds) {
  const count = characters.filter((c) => c.id === id).length;
  if (count > 1) err(`人物 id「${id}」在 ${count} 個檔案中重複出現`);
}

/* ---------- 交叉引用檢查：sourceId / actualFactionId / personId ---------- */

function collectSourceIds(obj, acc) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) collectSourceIds(item, acc);
    return;
  }
  if (typeof obj.sourceId === "string") acc.push(obj.sourceId);
  for (const key of Object.keys(obj)) {
    if (key !== "sourceId") collectSourceIds(obj[key], acc);
  }
}

for (const { file, data } of characters) {
  const usedSourceIds = [];
  collectSourceIds(data, usedSourceIds);
  for (const sid of usedSourceIds) {
    if (!sourceIds.has(sid)) {
      err(`${file}：引用了不存在於 sources.json 的 sourceId「${sid}」`);
    }
  }

  const timeline = (data.overview && data.overview.factionTimeline) || [];
  for (const stage of timeline) {
    if (stage.actualFactionId && !factionIds.has(stage.actualFactionId)) {
      err(`${file}：factionTimeline「${stage.stageName}」引用了不存在的 actualFactionId「${stage.actualFactionId}」`);
    }
  }

  const personRefs = [];
  for (const r of (data.overview && data.overview.relatives) || []) {
    if (r.personId) personRefs.push({ personId: r.personId, context: `relatives「${r.personName}」` });
  }
  for (const stage of timeline) {
    if (stage.personId) personRefs.push({ personId: stage.personId, context: `factionTimeline「${stage.stageName}」` });
  }
  for (const ref of personRefs) {
    if (!personIds.has(ref.personId)) {
      err(`${file}：${ref.context} 引用了不存在的人物 id「${ref.personId}」`);
    } else if (!publishedPersonIds.has(ref.personId)) {
      warn(`${file}：${ref.context} 引用的人物「${ref.personId}」尚未發布，頁面上不會建立連結`);
    }
  }
}

/* ---------- data/index.json 一致性檢查 ---------- */

if (indexData) {
  const seenIndexIds = new Set();
  for (const entry of indexData) {
    if (seenIndexIds.has(entry.id)) err(`index.json：重複的人物 id「${entry.id}」`);
    seenIndexIds.add(entry.id);
  }

  const charById = new Map(characters.map((c) => [c.id, c.data]));
  const indexIds = new Set(indexData.map((e) => e.id));

  for (const entry of indexData) {
    const charData = charById.get(entry.id);
    if (!charData) {
      err(`index.json：索引項目「${entry.id}」在 characters/ 裡找不到對應檔案`);
      continue;
    }
    if (entry.name !== charData.name) {
      err(`index.json：「${entry.id}」的 name「${entry.name}」與人物檔的「${charData.name}」不一致`);
    }
    if (entry.avatar !== charData.avatar) {
      err(`index.json：「${entry.id}」的 avatar 與人物檔不一致`);
    }
    if (entry.published !== charData.published) {
      err(`index.json：「${entry.id}」的 published（${entry.published}）與人物檔的（${charData.published}）不一致`);
    }
    if (!filterGroupIds.has(entry.filterGroup)) {
      err(`index.json：「${entry.id}」的 filterGroup「${entry.filterGroup}」不存在於 factions.json`);
    }
  }

  for (const { id, data } of characters) {
    if (data.published && !indexIds.has(id)) {
      err(`index.json：人物「${id}」published: true，但索引中找不到對應項目`);
    }
  }
}

/* ---------- 輸出結果 ---------- */

console.log(`\n檢查了 ${characterFiles.length} 份人物檔、sources.json、factions.json、index.json\n`);

if (warnings.length) {
  console.log(`警告（${warnings.length} 筆，不影響結束碼）：`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`錯誤（${errors.length} 筆）：`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log("\n檢查未通過。");
  process.exit(1);
} else {
  console.log("全部檢查通過，沒有錯誤。");
  process.exit(0);
}