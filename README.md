# 三國人物誌（Astro 版）

以史料分層、人物資料結構化與可持續擴充為核心的三國人物知識網站。

## 為什麼做這個網站

出於對三國這段歷史的熱愛，加上受到手機遊戲《率土之濱》裡「史實／演義列傳」
這個設計的啟發——同一位人物，遊戲裡會分開呈現他在正史記載裡的樣子，跟他在
《三國演義》或後世文學裡的樣子。這個網站想做的，就是把這個概念做成一個完整
的三國人物資料庫：**每一位收錄人物，都嘗試同時整理他在《三國志》正文、裴松之
注引史料、其他史籍，跟《三國演義》及後世文學裡的不同面貌**，並且清楚標示每
一段敘述來自哪一種史料層級，不讓後世的故事悄悄冒充成正史記載。

網站以白話解說為主、原始文獻為輔，透過來源引用、年代警語與史實差異說明，讓
讀者可以自己判斷「這件事史書真的有記載」還是「這是後世加上去的」。

## 這是 Astro 遷移版

專案原本是純 HTML／CSS／原生 JavaScript 寫的（2.0 版）。**Astro 版
`src/data/` 現在是唯一正式的資料來源**；2.0 版的 `data/` 資料夾封存下來，只
供比對舊版狀態使用，不再同步更新，之後任何資料修改都只改 Astro 版這一份。

遷移到 Astro 的理由很直接：**原本每新增一位人物，要手動同步好幾個地方**（人物
JSON、`index.json`、勢力頁清單、跨人物的雙向連結），人數一多（20 位變 50 位、
100 位），這種手動同步的心力會壓垮維護的意願。

Astro 解決的是「怎麼組裝頁面」這件事，不是「資料長什麼樣子」——**資料結構、
編輯規則、史料分層原則，全部原封不動從 2.0 版沿用過來**，這也是為什麼底下大
部分規則章節的內容，如果你看過 2.0 版的 README 會覺得眼熟：它們是同一套規則，
只是換了一種方式被程式讀取。

最終網站仍然是**純靜態網站**——Astro 在「打包（build）」的階段把資料組裝成
純 HTML，使用者的瀏覽器收到的東西，跟純手刻 HTML 版本本質上沒有差異，只是
組裝這件事現在是自動化的。

## 專案分工（三方協作，先理解這個再看其他部分）

- **使用者（宇軒）**：決定要收錄誰、設計方向、視覺呈現、最終拍板所有規則。
- **奈奈（ChatGPT）**：負責查證史料、整理人物資料，輸出成本專案的 JSON 格式；
  有時也協助研究、前端試作稿。
- **Claude（你）**：負責架構設計、資料整合、程式碼撰寫、跑測試驗證，並在奈奈
  的查證或試作稿出現疏漏時主動提出質疑，必要時自己查證核對。

**你的角色不是被動套資料**。這個專案一路走來，好幾次重要修正都是 Claude 主動
抓到問題後才處理的，包括這次遷移到 Astro 之後新發生的幾件事：

- **孫權的著作資料一度顯示為空**——遷移到 Astro 時，`src/data/characters/`
  採用的是一份**較舊的資料快照**，沒有帶進 2.0 版後續才做的修正，導致孫權
  `works` 變成空陣列、關平／關興／劉協也跑回了「`works: []` 卻殘留
  `worksNote`」這個很早就修過的舊 bug 狀態。這四筆已經在 Astro 版重新修好：
  孫權補回〈白曹操書論李術〉〈與浩周書〉兩篇著作；關平、關興、劉協的
  `worksNote` 欄位已整個移除（`works` 為空陣列時，直接不寫這個欄位，不是
  留空字串）。**現在 `src/data/` 是唯一正式資料來源，這類「快照沒帶到最新
  修正」的問題不會再發生**，但這次事件提醒：往後如果又有第二份資料副本
  （例如給奈奈參考用的複本），修改後務必人工確認正式來源這邊也同步更新。
- **孫權著作原文裡「兇惡」一詞，不同傳世版本轉錄字形不一致**——維基文庫的
  《三國志・卷四十七》繁體頁作「兇惡」，同一站另一頁收錄的《全三國文・卷
  六十三》則作「凶惡」，兩者是不同轉錄版本的字形差異，不是單純的打字錯誤。
  本站統一採現代繁體字形「兇惡」，已同步修正資料。
- **Astro 編譯器（7.2.0 版）有一個邊界案例 bug**：多行的模板字串（template
  literal）裡，只要直接內嵌另一個「帶反引號、且內容含 `<` 符號」的模板字串，
  編譯就會失敗，且錯誤訊息回報的行號完全不準（永遠指向檔案開頭附近）。目前
  `[id].astro` 裡所有原本會踩到這個雷的地方，已經全部改成「先把條件式內容
  存成獨立變數，再用 `${變數}` 插入」的寫法。**未來如果要在這三個頁面裡新增
  邏輯，避免在多行模板字串內直接寫巢狀反引號模板**，這條規則值得留意。
- **`import.meta.env.BASE_URL` 不保證結尾有斜線**——設定 `base:
  "/Three-Kingdoms-Biographies-Astro"` 後，直接用 `${base}images/...` 這種寫法
  會漏斜線、路徑黏在一起。三個頁面檔案裡的 `base` 變數宣告，已經統一改成
  `import.meta.env.BASE_URL.replace(/\/?$/, "/")`，確保結尾一定有一條斜線，
  不管 Astro 版本更新後這個行為會不會變。

收到奈奈整理的資料，先做交叉驗證，抓到問題要老實說，不要假設「看起來很完整」
就代表沒問題。

## 核心編輯原則

**史料層級必須分開。** 本站至少區分以下來源性質：

- 《三國志》正文
- 裴松之注引史料
- 其他史籍與地方志
- 《三國演義》原文
- 後世文學、戲曲、傳說與藝術形象
- 現代研究、遊戲或其他大眾文化資料

不同層級可以互相對照，但不可互相冒充。裴注引書不能簡化為《三國志》正文，《三
國演義》情節也不能直接填入史實生平。

**白話敘述與原文分工。** `paragraphs` 負責讓一般讀者理解事件；`originalTexts`
只收錄已逐字核對的原始文獻。找不到可靠原文時，省略 `originalTexts`，不可自行
生成仿古文字。

**史料沉默不等於可以自由補完。** 正史未記載的出生年、官職、戰功、親屬或言行，
應明確寫成「未見記載」或保留空值，不以小說、遊戲或後世傳說填補。

**虛構人物維持虛構身分。** 小說原創人物可以建檔（如馬雲騄），但必須標明其文學
來源，`historicalBio` 維持空陣列，不得挪用相關歷史人物的史料拼成虛構人物的
「史實生平」。

**名稱採保守原則。** 史書未記本名時，主顯示名稱使用可確定的稱呼（如「黃夫人」
而非後世通稱的「黃月英」），後世名稱透過 `commonAlias` 補充。

## 技術路線

- Astro（`astro build` 產出純靜態 HTML/CSS/JS，執行期不依賴伺服器或資料庫）
- 原生 TypeScript（frontmatter 裡的邏輯）／原生 JavaScript（頁面互動用的
  `<script>`）
- JSON 資料檔
- 無前端框架（不用 React／Vue，頁面互動需求原生 JS 就能處理）
- 無後端、無資料庫、無需登入

開發用的 `package.json` 相依套件，只有 `astro` 本身；沒有額外引入任何 UI 框架。

## 目錄結構

```
Three-Kingdoms-Biographies-Astro/
├── astro.config.mjs        站台網址與 base 路徑設定（見下方「部署」章節）
├── package.json
├── src/
│   ├── env.d.ts             Astro 專用型別宣告，讓 TypeScript 認得
│   │                        import.meta.glob、import.meta.env.BASE_URL 這些
│   │                        Astro 專屬的東西
│   ├── data/
│   │   ├── index.json
│   │   ├── sources.json
│   │   ├── factions.json
│   │   ├── factionPortalMeta.ts   首頁與勢力頁的敘事中繼資料（君主、格言、
│   │   │                          去背肖像），從 2.0 版 js/faction-portal-
│   │   │                          meta.js 搬過來，內容不變，改成 ES module
│   │   └── characters/
│   │       └── {id}.json
│   ├── pages/
│   │   ├── index.astro              首頁
│   │   ├── faction/[group].astro    勢力頁（動態路由，每個 filterGroup
│   │   │                            各自生成一份靜態頁）
│   │   └── character/[id].astro     人物頁（動態路由，每位已發布人物
│   │                                各自生成一份靜態頁）
│   └── styles/
│       └── style.css        直接從 2.0 版 css/style.css 搬過來，內容不變
├── public/
│   ├── images/
│   └── fonts/
└── .github/workflows/deploy.yml    自動化部署設定（見下方「部署」章節）
```

`data/characters/` 維持扁平結構，跟 2.0 版一樣不依效忠陣營拆資料夾。

## 動態路由：新增人物不用碰任何程式碼

這是 Astro 版跟 2.0 版最大的差異，也是遷移的主要目的。

`character/[id].astro`、`faction/[group].astro` 檔名裡的中括號，是 Astro 的
「動態路由」語法：Astro 在 `npm run build` 的時候，會讀取 `getStaticPaths()`
這個函式回傳的清單，**自動幫清單裡的每一項各自生成一份獨立的靜態 HTML**。

也就是說：

- **新增一位人物**：只要在 `src/data/characters/` 新增一份 JSON、在
  `src/data/index.json` 補上對應索引項目，`character/[id].astro` 會自動幫這
  位人物生成頁面，**不需要手動建立任何新的 `.astro` 檔案**。
- **勢力頁同理**：`faction/[group].astro` 目前只幫 `factionPortalMeta.ts` 裡
  有定義敘事資料的五個勢力（`wei`／`shu`／`wu`／`donghan`／`qunxiong`）生成頁
  面——這個限制不是遺漏，是刻意的：`factions.json` 裡其實還有一個 `jin`（西晉）
  分類，但因為沒有敘事資料，2.0 版原本打開這個頁面會被導回首頁，Astro 版延續
  同樣的行為，乾脆不生成這個頁面。

## ID 系統

跟 2.0 版完全相同，直接沿用：

| ID／欄位 | 所在位置 | 用途 |
|---|---|---|
| `id` | 人物 JSON 最外層 | 人物唯一識別碼；應與檔名一致。網址上看到的 `/character/zhao-yun` 這段路徑，就是直接對應這個 `id` |
| `personId` | 親屬、勢力歷程等 | 指向另一位人物；對方未建檔時可為 `null` |
| `sourceId` | citations、originalTexts | 指向 `data/sources.json` 的來源項目 |
| `actualFactionId` | overview.factionTimeline | 指向 `data/factions.json.actualFactions` 的具體政權或勢力階段 |
| `filterGroup` | 人物索引、勢力目錄 | 首頁與人物總覽使用的大分類，如 `wei`、`shu`；也對應到勢力頁網址 `/faction/{filterGroup}` |
| `stageName` | 人物勢力歷程 | 該人物頁面實際顯示的階段名稱 |
| `schemaVersion` | 人物 JSON 最外層 | 標示人物資料採用的 schema 版本 |

**`id` 與網址的對應關係**（跟 2.0 版用網址參數 `?id=zhao-yun` 不同，Astro 版
是路徑本身）：

```
src/data/characters/zhao-yun.json
                    └─ "id": "zhao-yun"
                    └─ 網址：/character/zhao-yun
```

**`personId`**：`personName` 是顯示文字，`personId` 是連結鍵。只有當
`personId` 能在 `index.json` 找到，且對方 `published: true` 時，頁面才建立可
點擊連結；否則維持純文字與預設頭像。不可因為對方尚未建檔而捏造 ID：

```json
{ "personName": "關氏（名不詳）", "personId": null }
```

**`filterGroup` 目前的五個入口：**

| filterGroup | 顯示名稱 |
|---|---|
| `donghan` | 東漢 |
| `wei` | 曹魏 |
| `shu` | 蜀漢 |
| `wu` | 孫吳 |
| `qunxiong` | 群雄 |

`factions.json` 裡還有一個保留但目前未使用的 `jin`（西晉），見上方「動態路由」
章節說明。

## 共用資料檔

### `data/index.json`：人物輕量索引

人物完整內容存放在 `data/characters/{id}.json`，`data/index.json` 只保留瀏覽
所需的少量欄位：

```json
{
  "id": "zhao-yun",
  "published": true,
  "name": "趙雲",
  "courtesyName": "子龍",
  "searchTerms": ["趙雲", "子龍", "zhao yun"],
  "avatar": "images/zhao_yun.png",
  "filterGroup": "shu"
}
```

用於首頁快速搜尋、勢力頁人物列表、判斷對方是否已建檔並發布。**目前仍由人工
維護**——新增、改名、換頭像、改陣營或改發布狀態時，都要同步更新人物檔與
`index.json`。

### `data/sources.json`：來源目錄

```json
{
  "id": "yun-biezhuan",
  "kind": "裴松之注引",
  "title": "《雲別傳》",
  "note": "來源性質、傳本與可信度補充。"
}
```

同一來源原則上只建立一個 ID。人物中的引用格式：

```json
{ "sourceId": "yun-biezhuan", "locator": "卷三十六・趙雲傳裴注", "note": "選填補充" }
```

### `data/factions.json`：勢力目錄

分成 `filterGroups`（網站瀏覽分類）跟 `actualFactions`（人物實際效力過的具體
政權，比如劉備的荊州據地、入蜀作戰、益州牧政權、漢中王政權、蜀漢稱帝後政權，
都是獨立的 `actualFactions` 項目，但共用同一個 `filterGroup: "shu"`）。小說虛
構勢力必須使用獨立的 `actualFactionId`，不得掛到真實歷史政權上。

## 人物 JSON

### 最外層欄位

| 欄位 | 用途 |
|---|---|
| `schemaVersion` | 資料規格版本 |
| `dataStatus` | 完整人物固定為 `"reviewed-draft"`；空檔佔位人物完全不填這個欄位 |
| `published` | 是否公開列出並建立連結 |
| `lastReviewedAt` | 最近一次內容複核日期 |
| `id` / `name` / `courtesyName` / `childhoodName` / `artName` / `otherNames` / `commonAlias` | 各種名稱欄位，見「名稱採保守原則」 |
| `lifespan` / `birthplace` / `primaryIdentity` | 基本資訊 |
| `summary` | 頁首簡介，建議約 120–160 字 |
| `avatar` | 人物頭像路徑（相對於 `public/`，例如 `images/zhao_yun.png`） |
| `overview` | 勢力歷程、親屬、官爵、評價等總覽資料 |
| `historicalBio` / `romanceBio` | 史實／演義生平事件陣列 |
| `works` / `worksNote` | 傳世作品，見下方「著作收錄規則」 |
| `demoNote`（選填） | 給編輯者看的整檔備註，不顯示於前端 |

### overview 的六個子欄位

`intro`（人物簡介，ContentBlock 結構）、`factionTimeline`、`relatives`、
`titlesAndRanks`、`posthumousTitle`、`evaluations`。完整人物這六個 key 都要
存在（值可以是空陣列或 `null`）。

**relatives 的 `relationGroup`**（供排序使用）：

| 值 | 用途 |
|---|---|
| `ancestor` | 父母、祖先與尊親屬 |
| `sibling` | 兄弟姊妹 |
| `spouse` | 配偶 |
| `child` | 子女 |
| `grandchild` | 孫輩 |
| `other` | 無法歸入以上群組的關係 |

排序規則：父母 → 兄弟姊妹 → 配偶 → 子女 → 孫輩，同層內男性排女性之前。

**`natureCategory`**（供程式判斷徽章樣式）：`historical` / `literary` /
`mixed` / `uncertain`。若正史關係與《三國演義》的結拜、義親等設定同時存在，用
`fictionalRelation` 分層保存，不擠在同一段 `relation` 裡。

**`posthumousTitle`**：若填了物件，至少要有 `title`（諡號本身），不可以是只
帶 `grantedBy`／`citations` 卻沒諡號的空殼。

### ContentBlock 結構

人物簡介、生平事件、史實差異共用：

```json
{
  "paragraphs": [{ "text": "白話整理內容。", "citations": [{ "sourceId": "...", "locator": "..." }] }],
  "originalTexts": [{ "text": "逐字核對過的史料原文。", "sourceId": "...", "locator": "..." }]
}
```

`uncertaintyNote` 只能放在渲染邏輯真的會讀取的位置——事件層級（跟
`period`/`title`/`content` 或 `chapter`/`eventName`/`content` 平行）、
`overview.intro` 內部、`romanceBio[].historicalDifference` 內部。**不能放進
`historicalBio[].content` 或 `romanceBio[].content` 內部**，那兩個位置目前的
渲染邏輯不會讀取，寫了也不會顯示。

### 著作收錄規則（這條規則是本輪複核反覆踩到的重點，務必遵守）

**沒有符合收錄條件的作品時：**

```json
"works": []
```

`works` 為空陣列時，**不得**保留 `worksNote`——這個欄位在畫面上永遠不會顯示，
寫了也是白寫。實作上採用「整個刪除 `worksNote` 這個 key」，不是保留欄位、把
值改成空字串——因為 `works: []` 這個狀態就已經代表「查無著作」，不需要一個
永遠不會顯示的欄位增加資料檔的雜訊。這個規則在 2.0 版就訂了，遷移到 Astro 之
後意外又發生過一次違反（見上方「三方協作」章節說明），提醒未來編輯時要特別
留意這條。

`worksNote` **只在 `works` 至少有一篇作品時使用**，用來補充傳本、真偽、收錄
範圍等問題。

## 如何新增人物

1. 查核人物的正史、裴注、其他史籍與文學來源。
2. 搜尋 `sources.json`／`factions.json`，沿用既有 ID；缺少時再新增。
3. 在 `data/characters/` 建立 `{id}.json`，確認檔名跟 `id` 一致。
4. 補齊 `overview`、`historicalBio`、`romanceBio`、`works`。
5. 對親屬填寫 `relationGroup` 跟 `natureCategory`。
6. 手動同步 `data/index.json`。
7. 回查其他人物是否已提到新人物，補上可建立的雙向 `personId`。
8. `npm run build`，確認新頁面正確生成在 `dist/character/{id}/index.html`。

空檔佔位策略跟 2.0 版一致：只填 `id`／`name`／`courtesyName`／`avatar`，
`published: true`，`overview` 留空物件、`historicalBio`／`romanceBio`／`works`
留空陣列，**不要**加上 `dataStatus`。

## 本機開發

```bash
npm install     # 第一次使用，或套件版本更新後才需要
npm run dev     # 開發模式，存檔自動刷新，預設 http://localhost:4321
npm run build   # 打包成最終成品，輸出到 dist/
npm run preview # 啟動一個本機伺服器，預覽 dist/ 打包後的最終成品
```

因為 `astro.config.mjs` 設定了 `base: "/Three-Kingdoms-Biographies-Astro"`，
開發模式的網址要帶上這段路徑：

```
http://localhost:4321/Three-Kingdoms-Biographies-Astro/
```

## 部署（GitHub Pages）

網址：`https://jasonkuo-0630.github.io/Three-Kingdoms-Biographies-Astro/`

**運作方式：** `.github/workflows/deploy.yml` 設定了一個 GitHub Actions 自動化
流程，每次 `git push` 到 `main` 分支，GitHub 會自動用一台遠端機器執行
`npm install` + `npm run build`，並把 `dist/` 的結果部署到 Pages。**本機不需要
自己跑 build 再上傳**，只要 push 原始碼即可。

**兩個容易踩到的坑，已經在設定裡處理過，但值得記錄原因：**

1. **`.github/workflows/deploy.yml` 裡明確指定了 `node-version: 22`**——GitHub
   Actions 的機器預設 Node.js 版本是 20，但 Astro 7.2.0 要求至少 22.12.0，沒
   指定的話 build 會直接失敗（`Node.js v20.20.2 is not supported by Astro!`）。
2. **`base` 設定會影響所有圖片與內部連結路徑**，三個頁面檔案裡凡是組合路徑
   的地方，一律透過 `import.meta.env.BASE_URL`（並正規化確保結尾有斜線）取
   得前綴，不可以再手寫 `/images/...` 這種假設「網站在網域根目錄」的寫法。

**在 GitHub 網站上，Settings → Pages → Source 必須選 `GitHub Actions`**（不是
`Deploy from a branch`），這個設定只需要做一次。

## 資料驗證

2.0 版建立過 `schema/` 與 `scripts/validate-data.js`／`scripts/render-test.js`
這套自動化驗證工具，Astro 版目前**尚未移植過來**。由於資料結構完全沒變，這套
工具理論上可以直接沿用（頂多路徑要從 `data/characters/` 改成
`src/data/characters/`），但這件事還沒有實際做，屬於待辦事項。

在補上自動化驗證之前，資料修改後至少要手動確認：`npm run build` 能不能無錯誤
跑完（26 個頁面：20 位人物 + 5 個勢力頁 + 首頁）、改過的人物頁點開來看內容有
沒有正確顯示。

## 已知風險與待辦

- **雙資料源同步風險**：2.0 版跟 Astro 版目前各自維護一份 `data/characters/`，
  沒有自動同步機制，容易像孫權事件一樣其中一邊改了、另一邊沒跟上。長期應該
  收斂成單一資料來源。
- **`scripts/validate-data.js`／`render-test.js` 尚未移植**到 Astro 版。
- **自動索引產生器**（讓 `filterGroup`／`searchTerms` 直接寫在人物 JSON 裡，
  自動產生 `index.json`，不用手動同步）——2.0 版曾規劃過方案但未實作，這個需
  求在 Astro 版依然成立，尚未處理。
- **首次載入圖片偏慢**：目前判斷主因是 GitHub Pages 全球快取網路的正常暖機
  現象（同一使用者第二次載入同一張圖會走瀏覽器快取，明顯變快），不是架構問
  題；如果之後仍覺得偏慢，可以檢查 `public/images/` 裡有沒有未壓縮的大檔案。

## 專案狀態

目前收錄 20 位人物，資料規則與 2.0 版完全一致。網站已部署上線並可公開存取。