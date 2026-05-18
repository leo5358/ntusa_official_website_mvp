import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { Resend } from "resend";
import ApprovalNotificationEmail from "../../../../components/emails/ApprovalNotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// DELETE 方法：刪除文章
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ errorCode: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await params;

    // [修正] 先尋找文章，確認是否存在
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ errorCode: "POST_NOT_FOUND" }, { status: 404 });
    }

    // [修正] 權限驗證：只有「原作者本人」、「同部門成員」或「具備管理權限 (admin/reviewer)」可以刪除文章
    const userEmail = session.user.email;
    const userRole = session.user.role;
    const userDepartment = session.user.department;

    const isAuthor = post.authorEmail === userEmail;
    const isDeptMember = post.department === userDepartment;
    const canManageAll = userRole === "admin" || userRole === "reviewer";

    if (!isAuthor && !isDeptMember && !canManageAll) {
      return NextResponse.json({ errorCode: "FORBIDDEN_DELETE" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("刪除文章失敗:", error);
    return NextResponse.json({ errorCode: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// PATCH 方法：更新文章狀態 (審核) + 寄送 Email
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ errorCode: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectReason, title, content, coverImage } = body;

    // 先尋找文章
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ errorCode: "POST_NOT_FOUND" }, { status: 404 });
    }

    const userEmail = session.user.email;
    const userRole = session.user.role;
    const userDepartment = session.user.department;

    const isAuthor = post.authorEmail === userEmail;
    const isDeptMember = post.department === userDepartment;
    const canManageAll = userRole === "admin" || userRole === "reviewer";

    // 1. 審核邏輯 (變更狀態)
    if (status && !title) {
      if (userRole !== "admin" && userRole !== "reviewer") {
        return NextResponse.json({ errorCode: "FORBIDDEN_REVIEW" }, { status: 403 });
      }

      const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ errorCode: "INVALID_STATUS" }, { status: 400 });
      }

      if (status === "REJECTED" && (!rejectReason || rejectReason.trim() === "")) {
        return NextResponse.json({ errorCode: "REJECT_REASON_REQUIRED" }, { status: 400 });
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: { 
          status,
          rejectReason: status === "REJECTED" ? rejectReason : null 
        },
      });

      // 寄送審核結果通知信給作者
      if (status === "APPROVED" || status === "REJECTED") {
        try {
          const actionName = status === "APPROVED" ? "核准" : "退回";
          await resend.emails.send({
            from: "NTUSA Website<noreply@notify.ntusa.ntu.edu.tw>",
            to: [post.authorEmail], 
            subject: `【文章審核通知】您的文章已${actionName}`,
            react: ApprovalNotificationEmail({
              postTitle: post.title,
              status: status as "APPROVED" | "REJECTED",
              rejectReason: status === "REJECTED" ? rejectReason : null
            }) as React.ReactElement,
          });
        } catch (emailError) {
          console.error("發送審核通知信失敗:", emailError);
        }
      }

      revalidatePath("/");
      return NextResponse.json(updatedPost, { status: 200 });
    }

    // 2. 編輯邏輯 (變更內容)
    if (title || content) {
      if (!isAuthor && !isDeptMember && !canManageAll) {
        return NextResponse.json({ errorCode: "FORBIDDEN_UPDATE" }, { status: 403 });
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title: title || post.title,
          content: content || post.content,
          coverImage: coverImage !== undefined ? coverImage : post.coverImage,
          status: status || "PENDING", // 修改後預設回到待審核
          rejectReason: null, // 清空先前的退回原因
        },
      });

      revalidatePath("/");
      return NextResponse.json(updatedPost, { status: 200 });
    }

    return NextResponse.json({ errorCode: "BAD_REQUEST" }, { status: 400 });
  } catch (error) {
    console.error("更新文章狀態失敗:", error);
    return NextResponse.json({ errorCode: "INTERNAL_ERROR" }, { status: 500 });
  }
}
