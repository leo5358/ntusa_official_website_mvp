import { unstable_cache } from "next/cache";
import prisma from "./prisma";
import { formatPostsForHome } from "./home-posts";

const getApprovedPostRows = unstable_cache(
  async () => {
    return prisma.post.findMany({
      where: {
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        coverImage: true,
        createdAt: true,
      },
    });
  },
  ["home-approved-post-previews"],
  { revalidate: 60 },
);

/** 快取核准文章列表，避免每次從其他路由回到首頁都重新打遠端 DB */
export async function getCachedHomePostPreviews() {
  const posts = await getApprovedPostRows();
  return formatPostsForHome(posts);
}
