"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewButtons({ postId }: { postId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    const actionName = newStatus === "APPROVED" ? "核准" : "退回";
    if (!confirm(`確定要將此文章「${actionName}」嗎？`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert(`已成功${actionName}文章！`);
        // 重新整理目前的路由，讓伺服器重新撈取資料，已審核的文章就會從待審列表中消失
        router.refresh(); 
      } else {
        const errorData = await res.json();
        alert(`更新失敗: ${errorData.error}`);
      }
    } catch (error) {
      console.error("發生錯誤:", error);
      alert("系統發生錯誤，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-3 mt-4 md:mt-0">
      <button
        onClick={() => handleUpdateStatus("APPROVED")}
        disabled={isLoading}
        className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 border-none"
      >
        {isLoading ? "處理中..." : "核准 (Approve)"}
      </button>
      <button
        onClick={() => handleUpdateStatus("REJECTED")}
        disabled={isLoading}
        className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 border-none"
      >
        {isLoading ? "處理中..." : "退回 (Reject)"}
      </button>
    </div>
  );
}