"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Editor from "../../components/Editor";

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // check login status and redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">驗證身分中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm mt-8 rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">發布新文章</h1>
      {/* 呼叫真正的編輯器核心組件，並把作者的信箱傳進去 */}
      <Editor authorEmail={session?.user?.email as string} />
    </div>
  );
}