import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  campusTools,
  getFeaturedTool,
  groupToolsByCategory,
} from "@/lib/campus-tools";
import CampusToolsPageClient from "@/components/campus-tools/CampusToolsPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("campusToolsTitle"),
    description: t("campusToolsDescription"),
  };
}

export default function CampusToolsPage() {
  const featured = getFeaturedTool(campusTools);
  const listTools = featured
    ? campusTools.filter((t) => t.id !== featured.id)
    : campusTools;
  const grouped = groupToolsByCategory(listTools);

  return <CampusToolsPageClient grouped={grouped} featured={featured} />;
}
