import prisma from "../../../lib/prisma"; // 根據資料夾層級往外找 3 層
import { notFound } from "next/navigation";
import Link from "next/link";

// Next.js 15+ 規定 params 是一個 Promise，必須標註型別為 Promise
interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  // 1. 等待並解構出網址上的 id 參數
  const { id } = await params;

  // 2. 透過 ID 從 Neon 資料庫撈取這篇文章的完整內容
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // 3. 防呆機制：如果資料庫找不到這篇文章，觸發 404 找不到頁面
  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 返回按鈕 */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors">
          &larr; 返回首頁
        </Link>
      </div>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 封面圖片 */}
        {post.coverImage && (
          <div className="w-full h-64 md:h-[400px] relative bg-gray-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8 md:p-12">
          {/* 文章標頭資訊 */}
          <header className="mb-10 border-b border-gray-100 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500 gap-4">
              <time dateTime={post.createdAt.toISOString()}>
                {new Date(post.createdAt).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>•</span>
              {/* 取信箱 @ 前面的字串當作作者名稱顯示 */}
              <span>作者：{post.authorEmail.split("@")[0]}</span> 
            </div>
          </header>

          {/* 文章內文 (Tiptap 產生的 HTML) 
            dangerouslySetInnerHTML 讓我們可以把字串當作真實的 HTML 渲染出來
            prose 類別則是 Tailwind Typography 提供的心法，讓它瞬間變好看！
          */}
          <div
            className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  );
}