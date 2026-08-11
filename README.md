# 三國人物誌

以史料分層、人物資料結構化與可持續擴充為核心的三國人物知識網站。

網址：`https://jasonkuo-0630.github.io/Three-Kingdoms-Biographies-Astro/`

## 這是什麼網站

出於對三國這段歷史的熱愛，加上受到手機遊戲《率土之濱》裡「史實／演義列傳」這
個設計的啟發——同一位人物，遊戲裡會分開呈現他在正史記載裡的樣子，跟他在《三
國演義》或後世文學裡的樣子。這個網站想做的，就是把這個概念做成一個完整的三國
人物資料庫：**每一位收錄人物，都嘗試同時整理他在《三國志》正文、裴松之注引史
料、其他史籍，跟《三國演義》及後世文學裡的不同面貌**，並且清楚標示每一段敘述
來自哪一種史料層級，不讓後世的故事悄悄冒充成正史記載。

網站以白話解說為主、原始文獻為輔，透過來源引用、年代警語與史實差異說明，讓讀
者可以自己判斷「這件事史書真的有記載」還是「這是後世加上去的」。

網站是純靜態網站：使用 [Astro](https://astro.build) 在打包階段把 JSON 資料組
裝成 HTML，使用者的瀏覽器拿到的是純 HTML/CSS/JS，不需要伺服器或資料庫運算，
透過 GitHub Pages 免費託管。

## 目前收錄狀況

21 位人物，分布：

| 勢力 | 人數 |
|---|---|
| 曹魏 | 5 |
| 蜀漢 | 11 |
| 孫吳 | 3 |
| 東漢 | 1 |
| 群雄 | 1 |

## 三方協作模式

這個專案由三方一起維護，各自的角色分工很明確：

- **宇軒（使用者）**：決定要收錄誰、拍板所有史料判斷、設計方向與視覺呈現，是
  最終的決策者。
- **奈奈（ChatGPT）**：負責查證史料、整理人物資料，輸出成本站的 JSON 資料格
  式；遇到史料異說、著作歸屬爭議這類問題，通常由她先查證、給出判斷跟理由。
- **娜娜（Claude）**：負責架構設計、資料整合、程式碼撰寫，並在奈奈的查證結果
  或試作稿出現疑點時主動交叉核對、提出質疑——不是被動照單全收，會實際去查證
  原始文獻，抓過不只一次奈奈初稿裡的疏漏（史料異體字誤植、著作歸屬判斷過寬、
  資料庫規則違反等等）。

這三方的分工，讓資料品質有兩層把關：奈奈負責「找得到」，娜娜負責「核對過」，
宇軒負責「拍板定案」。任何一份新資料進到網站之前，理論上都會經過這個流程，不
是誰整理完就直接上線。

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
只收錄已逐字核對的原始文獻。找不到可靠原文時，省略 `originalTexts`，不自行生
成仿古文字。

**史料沉默不等於可以自由補完。** 正史未記載的出生年、官職、戰功、親屬或言行，
明確寫成「未見記載」或保留空值，不以小說、遊戲或後世傳說填補。

**虛構人物維持虛構身分。** 小說原創人物可以建檔（如馬雲騄），但必須標明其文學
來源，`historicalBio` 維持空陣列，不挪用相關歷史人物的史料拼成虛構人物的「史
實生平」。

**名稱採保守原則。** 史書未記本名時，主顯示名稱使用可確定的稱呼（如「黃夫人」
而非後世通稱的「黃月英」），後世名稱透過 `commonAlias` 補充。

**同一件事有不同傳本時，分開保存，不擇一或合併。** 如果史書對同一件事留下措辭
不同的兩種記錄（例如周瑜臨終前的上疏，《三國志‧魯肅傳》正文跟裴注引《江表
傳》文字並不相同，裴松之本人也特別註明兩者「意旨雖同，其辭乖異」），本站會拆
成兩筆獨立的著作紀錄各自保存，不會挑一個「正確版本」捨棄另一個，也不會拼接成
一篇。

**著作收錄門檻嚴格，代筆作品不歸入本人名下。** 傳世文字如果有明確證據顯示是幕
僚代筆（例如陳琳替袁紹撰寫的檄文、書信），即使史書以雇主名義發出，也不列入雇
主本人的著作清單，會在著作說明裡註記排除理由。

## ID 系統

| ID／欄位 | 所在位置 | 用途 |
|---|---|---|
| `id` | 人物 JSON 最外層 | 人物唯一識別碼，與檔名一致，也對應網址路徑 `/character/{id}` |
| `personId` | 親屬、勢力歷程等 | 指向另一位人物；對方未建檔時保持 `null`，不可預先捏造未來可能會用到的 ID |
| `sourceId` | citations、originalTexts | 指向 `data/sources.json` 的來源項目 |
| `actualFactionId` | overview.factionTimeline | 指向 `data/factions.json` 的具體政權或勢力階段 |
| `filterGroup` | 人物索引、勢力目錄 | 網站瀏覽用的大分類（`wei`／`shu`／`wu`／`donghan`／`qunxiong`），也對應勢力頁網址 `/faction/{filterGroup}` |

## 目錄結構

```
├── astro.config.mjs          網址與 base 路徑設定（GitHub Pages 部署需要）
├── package.json
├── scripts/
│   └── validate-data.js      資料驗證工具，見下方「資料驗證」
├── src/
│   ├── env.d.ts
│   ├── data/
│   │   ├── index.json             人物輕量索引
│   │   ├── sources.json           來源目錄
│   │   ├── factions.json          勢力目錄
│   │   ├── factionPortalMeta.ts   首頁與勢力頁的敘事資料（君主、格言、肖像）
│   │   └── characters/
│   │       └── {id}.json          單一人物完整資料
│   ├── pages/
│   │   ├── index.astro                首頁
│   │   ├── faction/[group].astro      勢力頁（動態路由）
│   │   └── character/[id].astro       人物頁（動態路由）
│   └── styles/
│       └── style.css
├── public/
│   ├── favicon.ico / favicon.svg
│   ├── images/
│   └── fonts/
└── .github/workflows/deploy.yml   自動化部署設定
```

`data/characters/` 維持扁平結構，不依效忠陣營拆資料夾——人物可能歷經多個政
權，檔案位置不該由「最後效忠陣營」決定，這件事交給 `filterGroup` 欄位處理。

## 動態路由：新增人物不用碰程式碼

`character/[id].astro`、`faction/[group].astro` 檔名裡的中括號是 Astro 的動態
路由語法：打包時會讀取資料清單，自動幫每一項各自生成一份靜態頁面。

新增一位人物，只需要：

1. 在 `src/data/characters/` 新增 `{id}.json`
2. 在 `src/data/index.json` 補上對應的索引項目
3. `npm run build` 確認頁面正確生成在 `dist/character/{id}/index.html`

不需要手動建立任何新的 `.astro` 檔案。

勢力頁目前只幫 `factionPortalMeta.ts` 裡有定義敘事資料的五個勢力（`wei`／
`shu`／`wu`／`donghan`／`qunxiong`）生成頁面。`factions.json` 裡其實還保留了
一個 `jin`（西晉）分類，是為未來預留的，目前沒有任何人物使用，也不生成對應頁
面。

## 人物 JSON 欄位

### 最外層

| 欄位 | 用途 |
|---|---|
| `schemaVersion` | 資料規格版本 |
| `dataStatus` | 完整人物固定為 `"reviewed-draft"`；空檔佔位人物完全不填這個欄位 |
| `published` | 是否公開列出並建立連結 |
| `id` / `name` / `courtesyName` / `childhoodName` / `artName` / `otherNames` / `commonAlias` | 各種名稱欄位 |
| `lifespan` / `birthplace` / `primaryIdentity` | 基本資訊 |
| `summary` | 頁首簡介，建議約 120–160 字 |
| `avatar` | 人物頭像路徑 |
| `overview` | 勢力歷程、親屬、官爵、評價等總覽資料 |
| `historicalBio` / `romanceBio` | 史實／演義生平事件陣列 |
| `works` / `worksNote` | 傳世作品，見下方「著作收錄規則」 |

### overview 的六個子欄位

`intro`（人物簡介）、`factionTimeline`（勢力歷程）、`relatives`（親屬）、
`titlesAndRanks`（官爵）、`posthumousTitle`（諡號）、`evaluations`（當世／後
世評價）。完整人物這六個欄位都要存在（值可以是空陣列或 `null`）。

**relatives 的 `relationGroup`**（供排序使用）：`ancestor`（父母尊親）／
`sibling`（兄弟姊妹）／`spouse`（配偶）／`child`（子女）／`grandchild`（孫
輩）／`other`（無法歸類的關係）。排序規則：父母 → 兄弟姊妹 → 配偶 → 子女 →
孫輩，同層內男性排女性之前。

**`natureCategory`**（供程式判斷徽章樣式）：`historical`／`literary`／
`mixed`／`uncertain`。若正史關係與《三國演義》的結拜、義親等設定同時存在，用
`fictionalRelation` 分層保存（需要同時填 `natureType` 跟 `natureCategory`，缺
`natureCategory` 會導致畫面誤判成正史樣式），不擠在同一段 `relation` 裡。

### ContentBlock 結構

人物簡介、生平事件、史實差異共用的白話＋原文結構：

```json
{
  "paragraphs": [{ "text": "白話整理內容。", "citations": [{ "sourceId": "...", "locator": "..." }] }],
  "originalTexts": [{ "text": "逐字核對過的史料原文。", "sourceId": "...", "locator": "..." }]
}
```

`uncertaintyNote` 只能放在渲染邏輯會讀取的位置——事件層級（跟 `period`／
`title` 或 `chapter`／`eventName` 平行）、`overview.intro` 內部、
`romanceBio[].historicalDifference` 內部。不能放進 `historicalBio[].content`
或 `romanceBio[].content` 內部，那兩個位置不會被讀取顯示。

### 著作收錄規則

**沒有符合收錄條件的作品時，`works` 使用空陣列，且不得保留 `worksNote`**——
這個欄位在 `works` 為空時，畫面上永遠不會顯示，寫了也是白寫。這個規則被違反過
不只一次（多位人物都曾一度殘留這種寫了也不會顯示的說明文字），是編輯資料時最
容易疏漏的地方之一。

`worksNote` 只在 `works` 至少有一篇作品時使用，用來補充傳本、真偽、收錄範圍等
問題。

`fullText`（完整原文）跟 `excerpt`（原文摘錄）可以並存，但如果一篇作品全文本
身就很短、跟摘錄內容完全重複，建議只保留 `fullText`，省略 `excerpt`，避免讀者
在頁面上看到同一段文字出現兩次。

只要有 `fullText`，不論字數長短，畫面上一律以收合／展開的形式呈現，展開前會先
顯示自動算出的字數。

## 資料驗證

`scripts/validate-data.js` 是純 Node.js 內建功能寫成的檢查工具，不需要安裝任
何額外套件，幾秒內跑完：

```bash
node scripts/validate-data.js
```

檢查項目：

- 人物 JSON 是否為合法格式，檔名是否跟 `id` 一致
- 人物 ID、來源 ID、勢力 ID 是否重複
- 所有 `sourceId`／`actualFactionId`／`personId` 引用的對象是否真的存在
- `works` 為空陣列時是否還殘留 `worksNote`
- `data/index.json` 跟人物檔的姓名、頭像、發布狀態是否一致

這個工具只檢查「資料格式跟交叉引用對不對」，不檢查「畫面好不好看」或「文字寫
得好不好」，兩者是不同層次的品質把關，後者仍然仰賴人工閱讀。

## 本機開發

```bash
npm install     # 第一次使用，或套件版本更新後才需要
npm run dev     # 開發模式，存檔自動刷新
npm run build   # 打包成最終成品，輸出到 dist/
npm run preview # 預覽 dist/ 打包後的最終成品
```

`astro.config.mjs` 設定了 `base: "/Three-Kingdoms-Biographies-Astro"`，本機開
發網址需要帶上這段路徑：`http://localhost:4321/Three-Kingdoms-Biographies-Astro/`。

## 部署

`.github/workflows/deploy.yml` 設定了 GitHub Actions 自動化流程：每次
`git push` 到 `main` 分支，GitHub 會自動執行 `npm install` + `npm run build`，
並把結果部署到 GitHub Pages。本機不需要自己跑 build 再上傳，只要 push 原始碼
即可；GitHub 網站的 Settings → Pages → Source 需設定為 `GitHub Actions`。

## 頁內導覽

人物詳細頁提供頁內導覽，內容跟著目前作用中的頁籤（總覽／史實生平／演義生平／
著作）動態切換，只列出這位人物真正存在的區塊或事件，不會出現空白項目。

- **寬螢幕（1400px 以上）**：右側固定一個半透明懸浮面板，捲動時自動標示目前
  所在區塊。
- **較窄螢幕（含手機）**：右上角一個直排文字的書籤式標籤，點擊後從右側滑出完
  整導覽面板。

每個頁籤的導覽清單最上方都有一個「回到頂端」的捷徑，不參與捲動位置的自動判
斷，純粹是導覽用途。

## 已知風險與待辦

- 2.0 版（純 HTML/CSS/JS）的 `data/` 資料夾仍另外保存，作為封存版本比對用，
  不再同步更新；Astro 版 `src/data/` 是唯一正式資料來源。
- 所有陣營人物仍在持續擴充中。