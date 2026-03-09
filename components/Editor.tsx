"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder"; // 引入 Placeholder
import { useRouter } from "next/navigation";
import { uploadImage } from "../lib/upload";

interface EditorProps {
  authorEmail: string;
}

export default function Editor({ authorEmail }: EditorProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化 Tiptap 編輯器
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: "請在此輸入文章內容...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    immediatelyRender: false,
    content: "", // 清空預設內容，改由 Placeholder 接手
    editorProps: {
      attributes: {
        // 加入 text-gray-900 強制深色文字，避免在深色模式下變成白底白字
        className: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] border border-gray-300 rounded-md p-4 text-gray-900",
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

  // 處理內文圖片上傳
  const onEditorImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editor) {
      setIsUploadingImage(true);
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      setIsUploadingImage(false);
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

  // 封裝按鈕樣式函數，讓工具列程式碼更乾淨
  const getButtonClass = (isActive: boolean = false) => 
    `px-2 py-1.5 rounded text-sm font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`;

  return (
    <div className="flex flex-col gap-6 text-gray-900">
      {/* 標題區 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">文章標題</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="請輸入一個響亮的標題..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
      <div className="border border-gray-300 rounded-md bg-gray-50 shadow-sm overflow-hidden">
        {/* 工具列 (支援換行顯示) */}
        <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-100">
           {/* 文字樣式 */}
           <button onClick={() => editor?.chain().focus().toggleBold().run()} className={getButtonClass(editor?.isActive('bold'))}>粗體</button>
           <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={getButtonClass(editor?.isActive('italic'))}>斜體</button>
           <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={getButtonClass(editor?.isActive('strike'))}>刪除線</button>
           
           <div className="w-px bg-gray-300 mx-1 my-1"></div>
           
           {/* 標題 */}
           <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={getButtonClass(editor?.isActive('heading', { level: 1 }))}>H1</button>
           <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={getButtonClass(editor?.isActive('heading', { level: 2 }))}>H2</button>
           <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={getButtonClass(editor?.isActive('heading', { level: 3 }))}>H3</button>
           
           <div className="w-px bg-gray-300 mx-1 my-1"></div>

           {/* 列表與區塊 */}
           <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={getButtonClass(editor?.isActive('bulletList'))}>項目清單</button>
           <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={getButtonClass(editor?.isActive('orderedList'))}>編號清單</button>
           <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={getButtonClass(editor?.isActive('blockquote'))}>引用</button>
           <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={getButtonClass()}>分隔線</button>

           <div className="w-px bg-gray-300 mx-1 my-1"></div>

           {/* 歷史紀錄 */}
           <button onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} className="px-2 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-30">復原</button>
           <button onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} className="px-2 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-30">重做</button>

           <div className="flex-grow"></div> {/* 將插入圖片推到最右邊 */}

           {/* 插入圖片 */}
           <input type="file" accept="image/*" ref={fileInputRef} onChange={onEditorImageChange} className="hidden" />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-3 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-200"
             disabled={isUploadingImage}
           >
             {isUploadingImage ? "圖片上傳中..." : "插入圖片"}
           </button>
        </div>
        
        {/* Tiptap 編輯器本體 */}
        <EditorContent editor={editor} className="bg-white min-h-[400px] cursor-text" onClick={() => editor?.commands.focus()} />
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