export type CampusToolCategoryId =
  | "academics"
  | "campus-life"
  | "clubs"
  | "utilities";

export type CampusTool = {
  id: string;
  categoryId: CampusToolCategoryId;
  name: string;
  tagline: string;
  description: string;
  href: string;
  /** If true, primary button is disabled and shows 敬請期待 */
  comingSoon?: boolean;
  featured?: boolean;
  maintainers?: string[];
};

export const CATEGORY_ORDER: CampusToolCategoryId[] = [
  "academics",
  "campus-life",
  "clubs",
  "utilities",
];

export const CATEGORY_LABELS: Record<CampusToolCategoryId, string> = {
  academics: "課業與學習",
  "campus-life": "校園生活",
  clubs: "社團與活動",
  utilities: "實用小工具",
};

/** 與首頁區塊一致：小標英文、標題中文 */
export const CATEGORY_SECTION_TAGS: Record<CampusToolCategoryId, string> = {
  academics: "Academics",
  "campus-life": "Campus life",
  clubs: "Clubs",
  utilities: "Utilities",
};

export type GroupedCampusTools = {
  categoryId: CampusToolCategoryId;
  label: string;
  tools: CampusTool[];
};

export function groupToolsByCategory(tools: CampusTool[]): GroupedCampusTools[] {
  const byCategory = new Map<CampusToolCategoryId, CampusTool[]>();
  for (const id of CATEGORY_ORDER) {
    byCategory.set(id, []);
  }
  for (const tool of tools) {
    byCategory.get(tool.categoryId)!.push(tool);
  }
  return CATEGORY_ORDER.filter(
    (id) => (byCategory.get(id)!.length ?? 0) > 0,
  ).map((id) => ({
    categoryId: id,
    label: CATEGORY_LABELS[id],
    tools: byCategory.get(id)!,
  }));
}

export function getFeaturedTool(tools: CampusTool[]): CampusTool | undefined {
  if (tools.length === 0) return undefined;
  const featured = tools.find((t) => t.featured);
  return featured ?? tools[0];
}

export const campusTools: CampusTool[] = [
  {
    id: "ntusa-campus-toolkit",
    categoryId: "campus-life",
    name: "校園工具集（範例）",
    tagline: "把常用連結與提醒放在同一個入口",
    description:
      "此為展示用項目，請替換為實際由同學開發的服務名稱、說明與網址。建議一句話寫「幫你省下什麼時間」，避免堆疊技術名詞。",
    href: "#",
    featured: true,
    comingSoon: true,
    maintainers: ["臺大學生會 資訊部（範例）"],
  },
  {
    id: "course-helper-placeholder",
    categoryId: "academics",
    name: "選課與功課小幫手（範例）",
    tagline: "更快整理課表與截止日",
    description:
      "可用於介紹由同學維護的選課查詢、作業提醒或共筆索引等工具。上線前請更新連結與維護者資訊。",
    href: "#",
    comingSoon: true,
  },
  {
    id: "club-events-board",
    categoryId: "clubs",
    name: "社團活動看板（範例）",
    tagline: "活動報名與宣傳更容易被看見",
    description:
      "若學生會或部門有協助社團曝光的平台，可在這裡以「活動／招募」視角說明，而非以程式專案視角。",
    href: "#",
    comingSoon: true,
  },
];
