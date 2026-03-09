"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRouter } from "next/navigation";
import { uploadImage } from "../lib/upload"; // 引入我們剛剛抽離的工具

interface EditorProps {
  authorEmail: string;
}

export default function Editor({ authorEmail }: EditorProps) {
  const router = useRouter();
  
  // 狀態管理
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化 Tiptap 編輯器
  const editor = useEditor({
    extensions: [StarterKit, Image],
    immediatelyRender: false,
    content: "<p>請在此輸入文章內容...</p>",
    editorProps: {
      attributes: {
        className: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] border border-gray-300 rounded-md p-4",
      },
    },
  });

  // 處理封面圖片上傳
  const onCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingImage(true);
      const url = await uploadImage(e.target.files[0]);
      if (url) setCoverImage(url);
      setIsUploadingImage(false);
    }
  };

  // 處理內文圖片上傳 (插入 Tiptap)
  const onEditorImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editor) {
      setIsUploadingImage(true);
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      setIsUploadingImage(false);
      
      // 清空 input 的值，這樣重複上傳同一張圖片才會觸發 onChange
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 提交文章到資料庫
  const handleSubmit = async () => {
    if (!title.trim() || !editor || editor.isEmpty) {
      alert("請填寫標題與內容！");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          coverImage,
          authorEmail,
        }),
      });

      if (res.ok) {
        alert("文章發布成功！");
        router.push("/");
      } else {
        throw new Error("發布失敗");
      }
    } catch (error) {
      alert("系統發生錯誤，請稍後再試。");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 標題區 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">文章標題</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="請輸入一個響亮的標題..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 封面圖區 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">封面圖片</label>
        {coverImage && (
          <img src={coverImage} alt="Cover Preview" className="mb-2 max-w-xs rounded-md shadow-sm object-cover" />
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={onCoverImageChange} 
          disabled={isUploadingImage}
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* 編輯器工具列與內文區 */}
      <div className="border border-gray-200 rounded-md bg-gray-50 shadow-sm">
        {/* 工具列 */}
        <div className="border-b border-gray-200 p-2 flex gap-2 bg-white rounded-t-md">
           <button 
             onClick={() => editor?.chain().focus().toggleBold().run()}
             className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor?.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             粗體
           </button>
           <button 
             onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
             className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             H2 標題
           </button>
           
           <div className="w-px bg-gray-300 mx-1"></div> {/* 分隔線 */}

           {/* 隱藏的檔案上傳輸入框 */}
           <input 
             type="file" 
             accept="image/*" 
             ref={fileInputRef} 
             onChange={onEditorImageChange} 
             className="hidden" 
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
             disabled={isUploadingImage}
           >
             {isUploadingImage ? "圖片上傳中..." : "插入圖片"}
           </button>
        </div>
        
        {/* Tiptap 編輯器本體 */}
        <EditorContent editor={editor} className="bg-white min-h-[300px] rounded-b-md" />
      </div>

      {/* 提交按鈕 */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploadingImage || !title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-md disabled:bg-gray-400 transition-colors shadow-sm"
        >
          {isSubmitting ? "發布中..." : "送出並發布"}
        </button>
      </div>
    </div>
  );
}