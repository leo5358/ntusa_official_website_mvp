import type { Metadata } from "next";
import {
  campusTools,
  getFeaturedTool,
  groupToolsByCategory,
} from "@/lib/campus-tools";
import CampusToolsPageClient from "@/components/campus-tools/CampusToolsPageClient";

export const metadata: Metadata = {
  title: "校園工具｜臺大學生會",
  description:
    "由同學開發的應用與工具，讓校園生活更順手。臺大學生會彙整學生打造的數位服務。",
};

export default function CampusToolsPage() {
  const featured = getFeaturedTool(campusTools);
  const listTools = featured
    ? campusTools.filter((t) => t.id !== featured.id)
    : campusTools;
  const grouped = groupToolsByCategory(listTools);

  return <CampusToolsPageClient grouped={grouped} featured={featured} />;
}
