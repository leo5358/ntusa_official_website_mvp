"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 加上防呆確認視窗，避免誤按
    const confirmed = confirm("確定要刪除這篇文章嗎？此動作無法復原！");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("文章已成功刪除！");
        router.push("/"); // 刪除後導回首頁
        router.refresh(); // 強制首頁重新向資料庫抓取最新列表
      } else {
        throw new Error("刪除失敗");
      }
    } catch (error) {
      alert("發生錯誤，請稍後再試。");
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium rounded-md transition-colors disabled:opacity-50"
    >
      {isDeleting ? "刪除中..." : "刪除文章"}
    </button>
  );
}