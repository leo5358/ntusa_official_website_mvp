import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

// ⚠️ 注意這裡：不能寫 export default，必須明確指定為 DELETE 方法
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