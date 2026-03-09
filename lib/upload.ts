import imageCompression from "browser-image-compression";

// 函式名稱改為通用的 uploadImage
export async function uploadImage(file: File): Promise<string | null> {
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp", 
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // 直接將檔案打包
    const formData = new FormData();
    formData.append("image", compressedFile);

    // 送給我們的後端 API
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData, // fetch 發現是 FormData 會自動設定正確的 headers
    });

    if (!res.ok) throw new Error("上傳失敗");
    
    const data = await res.json();
    return data.url;

  } catch (error) {
    console.error("圖片處理失敗:", error);
    alert("圖片過大導致壓縮或上傳失敗，請先自行壓縮再上傳！");
    return null;
  }
}