"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ReviewButtons({ postId }: { postId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("review.actions");

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    let reason = null;

    // 1. 根據按下的按鈕決定不同的互動邏輯
    if (newStatus === "REJECTED") {
      // 退回時要求輸入原因
      reason = window.prompt(t("rejectPrompt"));

      // 如果按取消或沒有輸入內容，則中斷操作
      if (reason === null) return;
      if (reason.trim() === "") {
        alert(t("rejectMissingReason"));
        return;
      }
    } else {
      // 核准時只做簡單確認
      if (!window.confirm(t("approveConfirm"))) return;
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
          rejectReason: reason, // 傳送退回原因
        }),
      });

      if (res.ok) {
        const action = newStatus === "APPROVED" ? t("approveActionName") : t("rejectActionName");
        alert(t("successAlert", { action }));
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(t("updateFailed", { error: errorData.error ?? "" }));
      }
    } catch (error) {
      console.error("發生錯誤:", error);
      alert(t("systemError"));
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
        {isLoading ? t("buttonLoading") : t("approveButton")}
      </button>
      <button
        onClick={() => handleUpdateStatus("REJECTED")}
        disabled={isLoading}
        className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 border-none"
      >
        {isLoading ? t("buttonLoading") : t("rejectButton")}
      </button>
    </div>
  );
}