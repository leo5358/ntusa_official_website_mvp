import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { Resend } from "resend";
import ApprovalNotificationEmail from "../../../../components/emails/ApprovalNotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// DELETE 方法：刪除文章 (維持不變)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權的請求" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("刪除文章失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}

// PATCH 方法：更新文章狀態 + 寄送 Email
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權的請求" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectReason } = body;

    const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "無效的狀態值" }, { status: 400 });
    }

    if (status === "REJECTED" && (!rejectReason || rejectReason.trim() === "")) {
      return NextResponse.json({ error: "退回文章必須提供原因" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "找不到文章" }, { status: 404 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { 
        status,
        rejectReason: status === "REJECTED" ? rejectReason : null 
      },
    });

    // 👇 2. 寄信邏輯：改用 React 模板
    if (status === "APPROVED" || status === "REJECTED") {
      try {
        const actionName = status === "APPROVED" ? "核准" : "退回";
        
        await resend.emails.send({
          from: "NTUSA Website<noreply@notify.ntusa.ntu.edu.tw>", // ⚠️ 記得改成您驗證過的網域
          to: [post.authorEmail], 
          subject: `【文章審核通知】您的文章已${actionName}`,
          // 👇 使用 react 屬性，並將資料傳入元件
          react: ApprovalNotificationEmail({
            postTitle: post.title,
            status: status as "APPROVED" | "REJECTED",
            rejectReason: status === "REJECTED" ? rejectReason : null
          }) as React.ReactElement,
        });
        
        console.log(`成功發送審核通知信至 ${post.authorEmail}`);
      } catch (emailError) {
        console.error("發送 Resend Email 失敗:", emailError);
      }
    }

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("更新文章狀態失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}