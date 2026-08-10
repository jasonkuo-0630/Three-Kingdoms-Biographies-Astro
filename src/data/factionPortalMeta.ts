/**
 * factionPortalMeta.ts — 首頁「勢力入口」用的敘事中繼資料
 * 從原本 js/faction-portal-meta.js 搬過來，內容一字未改，只是改成 ES module
 * 匯出，讓 .astro 檔案可以直接 import。
 */

export interface FactionPortalMeta {
  mark: string;
  label: string;
  ruler: string;
  motto: string;
  portrait: string | null;
}

export const FACTION_PORTAL_META: Record<string, FactionPortalMeta> = {
  donghan: {
    mark: "漢",
    label: "東漢",
    ruler: "劉協",
    motto: "四百年治終將亂，帝星黯淡暮色沉。",
    portrait: "images/liu_xie_main.png",
  },
  wei: {
    mark: "魏",
    label: "曹魏",
    ruler: "曹操",
    motto: "唯才是舉納群賢，魏武揮鞭傲中原。",
    portrait: "images/cao_cao_main.png",
  },
  shu: {
    mark: "蜀",
    label: "蜀漢",
    ruler: "劉備",
    motto: "義膽忠魂扶漢志，凌雲揮戈挽山河。",
    portrait: "images/liu_bei_main.png",
  },
  wu: {
    mark: "吳",
    label: "孫吳",
    ruler: "孫權",
    motto: "江東才俊領風騷，赤壁雄兵火連天。",
    portrait: "images/sun_quan_main.png",
  },
  qunxiong: {
    mark: "群",
    label: "群雄",
    ruler: "",
    motto: "逐鹿天下無常主，虎嘯龍吟各一方。",
    portrait: null,
  },
};

// 首頁固定顯示這五個入口，順序固定（不管 factions.json 順序如何變動）
export const FACTION_PORTAL_ORDER = ["wei", "shu", "wu", "donghan", "qunxiong"] as const;