import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { Resend } from "resend";
// 👇 1. 引入剛剛寫好的 Email 模板
import ReviewRequestEmail from "../../../components/emails/ReviewRequestEmail";

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 定義公關部收件信箱（與您在 ReviewDashboard 中設定的維持一致）
const PR_EMAILS = ["liyu.yang@ntusa.ntu.edu.tw", "admin@ntusa.ntu.edu.tw"];

// 明確使用 HTTP 方法的具名匯出 (Named Export)
export async function POST(request: Request) {
  try {
    // 1. 安全性檢查：確認發送請求的人是否有登入
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權的請求" }, { status: 401 });
    }

    // 2. 解析前端傳過來的 JSON 資料
    const body = await request.json();
    const { title, content, coverImage, authorEmail } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "標題與內容為必填欄位" }, { status: 400 });
    }

    // 3. 透過 Prisma 將資料寫入 PostgreSQL 資料庫
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        coverImage,
        authorEmail,
        // 這裡不需要給 status，因為 Schema 已經設定預設為 PENDING
      },
    });

    // 👇 4. 寄送「新文章待審核」通知信給公關部
    try {
      await resend.emails.send({
        from: "NTUSA Website<noreply@notify.ntusa.ntu.edu.tw>", 
        to: PR_EMAILS, // 一次寄給陣列中的所有公關部信箱
        subject: `【待審核通知】新文章申請：「${title}」`,
        // 使用 react 屬性載入您的模板，並傳入需要的 props
        react: ReviewRequestEmail({
          postTitle: title,
          authorEmail: authorEmail,
        }) as React.ReactElement,
      });
      
      console.log("成功發送新文章待審核通知信給公關部");
    } catch (emailError) {
      console.error("發送公關部審核通知信失敗:", emailError);
      // 寄信失敗不應阻擋發文流程，所以只印出錯誤，不 return error
    }

    // 5. 成功後回傳 201 Created 狀態與新建的資料
    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error("寫入資料庫失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}

// 用於首頁撈取文章
export async function GET() {
  try {
    // 撈取狀態為 APPROVED 的所有文章，並依照建立時間由新到舊排序
    const posts = await prisma.post.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("讀取文章失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}