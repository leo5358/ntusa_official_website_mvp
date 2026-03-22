import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import ReviewButtons from "../../components/ReviewButtons";
import Link from "next/link";

// 💡 這裡設定公關部的信箱（可以設定多個），匹配到的人就有審核權限
const PR_EMAILS = ["liyu.yang@ntusa.ntu.edu.tw", "admin@ntusa.ntu.edu.tw"];

// 輔助元件：狀態標籤
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "APPROVED":
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">已通過</span>;
    case "REJECTED":
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">已退回</span>;
    case "PENDING":
    default:
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">審核中</span>;
  }
};

export default async function ReviewDashboard() {
  // 1. 權限驗證
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/api/auth/signin");
  }

  const userEmail = session.user.email;
  const isPR = PR_EMAILS.includes(userEmail);

  // 2. 根據身分撈取文章
  // - 公關部 (isPR): 撈取所有「待審核 (PENDING)」的文章
  // - 一般部門: 撈取「自己部門 (authorEmail)」發布的所有文章
  const targetPosts = isPR
    ? await prisma.post.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } })
    : await prisma.post.findMany({ where: { authorEmail: userEmail }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-5xl mx-auto p-8 pt-24">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {isPR ? "審核者儀表板" : "部門文章狀態"}
        </h1>
        <p className="text-gray-500 mt-2">
          {isPR 
            ? "公關部專用：以下顯示各部門提交的待審核文章。" 
            : `目前登入身分：${userEmail}，以下為您提交過的文章狀態。`}
        </p>
      </div>

      {targetPosts.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-dashed">
          <p className="text-gray-500 text-lg">
            {isPR ? "目前沒有任何待審核的文章" : "您目前尚未提交過任何文章"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {targetPosts.map((post) => (
            <div 
              key={post.id} 
              className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white flex flex-col"
            >
              {/* 上半部：標題、資訊與按鈕 */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                    {/* 一般部門顯示狀態 Badge，公關部如果是看 PENDING 也可以顯示 */}
                    {!isPR && <StatusBadge status={post.status} />}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {isPR && (
                      <p><span className="font-medium">提交者信箱：</span> {post.authorEmail}</p>
                    )}
                    <p><span className="font-medium">提交時間：</span> {new Date(post.createdAt).toLocaleString("zh-TW")}</p>
                  </div>
                </div>

                {/* 只有公關部能看到審核按鈕 (Approve / Reject) */}
                {isPR && <ReviewButtons postId={post.id} />}
              </div>

              {/* 下半部：文章內容預覽 (手風琴折疊) */}
              <details className="mt-4 border-t pt-4 group">
                <summary className="cursor-pointer text-[var(--color-brand-dark)] font-medium hover:opacity-80 outline-none list-none flex items-center gap-2">
                  <svg className="w-5 h-5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  檢視文章完整內容
                </summary>
                
                <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-100">
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
                  
                  <span className="text-sm text-gray-500 font-medium block mb-2">文章內容：</span>
                  <div 
                    className="prose max-w-none bg-white p-4 border rounded-md"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                  
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