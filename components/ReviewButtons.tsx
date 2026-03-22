"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewButtons({ postId }: { postId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    let reason = null;

    // 1. 根據按下的按鈕決定不同的互動邏輯
    if (newStatus === "REJECTED") {
      // 退回時要求輸入原因
      reason = window.prompt("請輸入退回原因（必填，將附在通知信中）：");
      
      // 如果按取消或沒有輸入內容，則中斷操作
      if (reason === null) return; 
      if (reason.trim() === "") {
        alert("退回文章必須填寫原因！");
        return;
      }
    } else {
      // 核准時只做簡單確認
      if (!window.confirm("確定要將此文章「核准」嗎？")) return;
    }

    setIsLoading(true);
    try {
      // 2. 將狀態與退回原因 (如果有) 一併傳給後端
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          rejectReason: reason // 傳送退回原因
        }),
      });

      if (res.ok) {
        const actionName = newStatus === "APPROVED" ? "核准" : "退回";
        alert(`已成功${actionName}文章！`);
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