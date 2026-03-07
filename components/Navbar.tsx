"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  // 取得目前的登入狀態 (session 包含使用者資訊，status 包含 loading/authenticated/unauthenticated)
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-md fixed w-full z-10 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 左側：網站 Logo 或名稱 */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
              台大學生會官網
            </Link>
          </div>

          {/* 右側：登入狀態與按鈕 */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-gray-500">載入中...</span>
            ) : session ? (
              // 已經登入顯示的畫面
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {session.user?.name} ({session.user?.email})
                </span>
                <Link 
                  href="/editor" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  發布文章
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              // 尚未登入顯示的畫面
              <button
                // 點擊後直接觸發 Google 登入流程
                onClick={() => signIn("google")}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                學生會信箱登入
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}