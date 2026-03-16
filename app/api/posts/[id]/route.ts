import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

// DELETE 方法：刪除文章
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 安全檢查：確認使用者有登入才能刪除
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權的請求" }, { status: 401 });
    }

    // 2. 解構取得網址上的文章 ID
    const { id } = await params;

    // 3. 透過 Prisma 刪除資料庫中的文章
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("刪除文章失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}

// PATCH 方法：更新文章狀態
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 安全檢查：確認使用者有登入
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權的請求" }, { status: 401 });
    }

    // TODO: 未來這裡需要加上權限判斷，例如：
    // if (session.user.role !== "reviewer") {
    //   return NextResponse.json({ error: "權限不足，僅審核者可執行此操作" }, { status: 403 });
    // }

    // 2. 解構取得網址上的文章 ID 與請求內容
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 3. 檢查傳入的狀態是否有效
    const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "無效的狀態值" }, { status: 400 });
    }

    // 4. 透過 Prisma 更新文章狀態
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("更新文章狀態失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}