import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權的請求" }, { status: 401 });
    }

    // 1. 接收前端傳來的 FormData
    const formData = await request.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json({ error: "沒有收到檔案" }, { status: 400 });
    }

    // 2. 準備轉發給 ImgBB 的資料
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", file);
    imgbbFormData.append("key", process.env.IMGBB_API_KEY as string);

    // 3. 呼叫 ImgBB API
    const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    });

    const data = await imgbbRes.json();

    // 4. 回傳結果
    if (data.success) {
      return NextResponse.json({ url: data.data.url });
    } else {
      throw new Error(data.error?.message || "ImgBB 拒絕了上傳");
    }

  } catch (error) {
    console.error("上傳至 ImgBB 失敗:", error);
    return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
  }
}