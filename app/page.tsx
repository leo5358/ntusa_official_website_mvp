import Link from "next/link";
import prisma from "../lib/prisma"; // 直接引入資料庫連線

// 幫助我們把 Tiptap 產生的 HTML 標籤過濾掉，只留下純文字當作摘要
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
}

export default async function Home() {
  // 1. 在伺服器端直接向資料庫撈取所有文章，並依照建立時間由新到舊排序
  const posts = await prisma.post.findMany({
    where: { 
      status: "APPROVED"
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Hero 歡迎區塊 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          國立台灣大學學生會
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          最新消息與動態公告
        </p>
      </div>

      {/* 文章列表區塊 */}
      <div className="space-y-16">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            目前還沒有任何文章喔！請使用右上角登入後發布第一篇文章吧。
          </div>
        ) : (
          posts.map((post, index) => {
            // 2. 核心邏輯：判斷目前是第幾篇，偶數篇圖在左，奇數篇圖在右
            const isEven = index % 2 === 0;
            // 產生 100 字的文章摘要
            const excerpt = stripHtml(post.content).substring(0, 100) + "...";

            return (
              <div 
                key={post.id} 
                // 透過 Tailwind 的 md:flex-row-reverse 達成交錯排版
                className={`flex flex-col md:flex-row ${isEven ? "" : "md:flex-row-reverse"} gap-8 items-center bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-lg`}
              >
                {/* 圖片區塊 (佔一半寬度) */}
                <div className="w-full md:w-1/2 h-64 md:h-80 relative bg-gray-100 flex-shrink-0">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <span className="text-lg font-medium">台大學生會</span>
                    </div>
                  )}
                </div>

                {/* 文字區塊 (佔另一半寬度) */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="text-sm text-blue-600 font-semibold mb-2 tracking-wide">
                    {new Date(post.createdAt).toLocaleDateString("zh-TW", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {excerpt}
                  </p>
                  
                  {/* 閱讀全文按鈕 (目前預留路由，下一步實作) */}
                  <div>
                    <Link 
                      href={`/post/${post.id}`} 
                      className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      閱讀全文
                      <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}