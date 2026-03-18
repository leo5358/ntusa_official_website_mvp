import prisma from "../lib/prisma";
import HomeClient from "../components/HomeClient";

// 幫助我們把 Tiptap 產生的 HTML 標籤過濾掉，只留下純文字當作摘要
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
}

export default async function Home() {
  // 1. 在伺服器端直接向資料庫撈取所有文章
  const posts = await prisma.post.findMany({
    where: { 
      status: "APPROVED"
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. 將 Prisma 資料轉換成可以傳給 Client component 的格式
  const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: stripHtml(post.content).substring(0, 80) + "...",
    createdAt: new Date(post.createdAt).toLocaleDateString("zh-TW", { year: 'numeric', month: 'long', day: 'numeric' }),
    coverImage: post.coverImage,
  }));

  // 3. 把資料傳給負責渲染首頁所有 Tab 的客戶端元件
  return <HomeClient posts={formattedPosts} />;
}
