"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function DeleteButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const t = useTranslations("post");

  const handleDelete = async () => {
    // 加上防呆確認視窗，避免誤按
    const confirmed = confirm(t("deleteConfirm"));
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert(t("deleteSuccess"));
        router.push("/"); // 刪除後導回首頁
        router.refresh(); // 強制首頁重新向資料庫抓取最新列表
      } else {
        throw new Error(t("deleteFailedInternal"));
      }
    } catch (error) {
      alert(t("deleteError"));
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
      {isDeleting ? t("deleteButtonLoading") : t("deleteButton")}
    </button>
  );
}