import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. 取得網址上的文章 ID
  const { id } = await params;

  // 2. 向資料庫查詢該篇文章
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // 如果文章不存在，直接回傳 404
  if (!post) {
    notFound();
  }

  // 3. 安全性攔截邏輯：如果文章不是「已核准」狀態
  if (post.status !== "APPROVED") {
    const session = await getServerSession(authOptions);
    
    // 如果沒有登入，直接回傳 404，不讓訪客知道這篇文章的存在
    if (!session || !session.user) {
      notFound(); 
    }

    // TODO: 未來 Phase 2 實作完整角色權限 (RBAC) 時，可以在這裡進一步限制：
    // const isAuthor = session.user.email === post.authorEmail;
    // const isReviewer = session.user.role === "reviewer";
    // 如果既不是作者也不是公關部，就 notFound()
    // if (!isAuthor && !isReviewer) notFound();
  }

  // 4. 渲染文章頁面
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      
      {/* 提示區塊：如果這是一篇未公開的文章，顯示警告橫幅給作者或審核者看 */}
      {post.status !== "APPROVED" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>注意：</strong> 這篇文章目前的狀態為 <span className="font-mono bg-yellow-100 px-1 rounded">{post.status}</span>，尚未對外公開。此頁面目前僅有內部人員可見。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 封面圖片 */}
      {post.coverImage && (
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-64 md:h-96 object-cover rounded-xl mb-8 shadow-sm"
        />
      )}
      
      {/* 文章標題 */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
      
      {/* 文章資訊 */}
      <div className="flex items-center text-gray-500 text-sm mb-8 border-b pb-8">
        <span className="mr-4">作者：{post.authorEmail}</span>
        <span>
          發布時間：{new Date(post.createdAt).toLocaleDateString("zh-TW", { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* 文章內容 (HTML 渲染) */}
      <div 
        className="prose prose-lg max-w-none prose-blue"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      {/* 返回按鈕 */}
      <div className="mt-12 pt-8 border-t">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors">
          <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首頁
        </Link>
      </div>
      
    </div>
  );
}