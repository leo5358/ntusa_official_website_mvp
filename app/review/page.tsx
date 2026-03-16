import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import ReviewButtons from "../../components/ReviewButtons";
import Link from "next/link";

export default async function ReviewDashboard() {
  // 1. 權限驗證
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  // 2. 撈取「待審核」的文章
  const pendingPosts = await prisma.post.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">審核者儀表板</h1>
        <p className="text-gray-500 mt-2">僅顯示待審核 (PENDING) 的部門文章</p>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-dashed">
          <p className="text-gray-500 text-lg">目前沒有任何待審核的文章 🎉</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingPosts.map((post) => (
            <div 
              key={post.id} 
              className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white flex flex-col"
            >
              {/* 上半部：標題、資訊與按鈕 */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">提交者信箱：</span> 
                      {post.authorEmail}
                    </p>
                    <p>
                      <span className="font-medium">提交時間：</span> 
                      {new Date(post.createdAt).toLocaleString("zh-TW")}
                    </p>
                  </div>
                </div>

                {/* 審核按鈕 */}
                <ReviewButtons postId={post.id} />
              </div>

              {/* 下半部：文章內容預覽 (使用 details 標籤製作手風琴折疊效果) */}
              <details className="mt-4 border-t pt-4 group">
                <summary className="cursor-pointer text-blue-600 font-medium hover:text-blue-800 outline-none list-none flex items-center gap-2">
                  <svg className="w-5 h-5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  檢視文章完整內容
                </summary>
                
                {/* 展開後的內容區塊 */}
                <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-100">
                  {/* 如果有封面圖，優先顯示 */}
                  {post.coverImage && (
                    <div className="mb-6">
                      <span className="text-sm text-gray-500 font-medium block mb-2">封面圖片：</span>
                      <img 
                        src={post.coverImage} 
                        alt="封面圖片預覽" 
                        className="max-w-md w-full h-auto object-cover rounded-md shadow-sm"
                      />
                    </div>
                  )}
                  
                  {/* 文章內容：因為是 HTML，必須使用 dangerouslySetInnerHTML */}
                  <span className="text-sm text-gray-500 font-medium block mb-2">文章內容：</span>
                  <div 
                    className="prose max-w-none bg-white p-4 border rounded-md"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                  
                  {/* 提供另開視窗的獨立預覽連結 */}
                  <div className="mt-4 text-right">
                    <Link 
                      href={`/post/${post.id}`} 
                      target="_blank" 
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      在新分頁模擬前台畫面 ↗
                    </Link>
                  </div>
                </div>
              </details>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}