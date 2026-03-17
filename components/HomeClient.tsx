"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 定義文章型別
type PostType = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  coverImage: string | null;
};

export default function HomeClient({ posts }: { posts: PostType[] }) {
  const [activeTab, setActiveTab] = useState("home");
  const [dataTab, setDataTab] = useState("minutes");

  // SPA Hash 路由監聽
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      const validPages = ["home", "about", "rights", "forms", "data"];
      if (validPages.includes(hash)) {
        setActiveTab(hash);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Init
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Intersection Observer 動畫載入
  useEffect(() => {
    const observerOptions = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" };
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // 抓取所有有 fade-up-target 的元素套用動畫
    document.querySelectorAll(".fade-up-target").forEach((el, i) => {
      (el as HTMLElement).style.setProperty("--delay", `${i * 60}ms`);
      el.classList.add("fade-up");
      fadeObserver.observe(el);
    });

    return () => fadeObserver.disconnect();
  }, [activeTab]); // 每當切換分頁時重新綁定動畫

  return (
    <>
      {/* ── PAGE: 首頁 ── */}
      <section className={`page ${activeTab === "home" ? "active" : ""}`} id="home">
        <div className="hero">
          <div className="hero-bg-placeholder"></div>
          <div className="hero-overlay"></div>
          <div className="hero-content fade-up-target">
            <h1 className="hero-title">臺大學生會</h1>
            <p className="hero-desc">代表每一位臺大學生，守護學生權益、促進校園民主。</p>
            <Link href="/#rights" className="btn btn-primary">查看最新學權公告</Link>
          </div>
        </div>

        <div className="section-wrap">
          <div className="section-header fade-up-target">
            <div className="section-tag">最新消息</div>
            <h2 className="section-title">學權公告動態</h2>
            <p className="section-sub">即時掌握學生會最新公告與活動資訊</p>
          </div>

          <div className="news-grid" id="newsGrid">
            {posts.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-10">目前尚無公告文章</div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="news-card fade-up-target" role="article">
                  <div className="news-card-img" style={{ backgroundImage: `url(${post.coverImage || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {!post.coverImage && "📄"}
                  </div>
                  <div className="news-card-body">
                    <div className="news-card-meta">
                      <span className="news-card-tag">公告</span>
                      <span className="news-card-date">{post.createdAt}</span>
                    </div>
                    <h3 className="news-card-title line-clamp-2">{post.title}</h3>
                    <p className="news-card-excerpt line-clamp-3">{post.excerpt}</p>
                    <Link href={`/post/${post.id}`} className="news-card-link">
                      閱讀更多 <span>→</span>
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── PAGE: 關於我們 ── */}
      <section className={`page ${activeTab === "about" ? "active" : ""}`} id="about">
         <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <h1 className="page-title">關於我們</h1>
          </div>
        </div>
        <div className="section-wrap">
          <div className="dept-grid">
            <div className="dept-card fade-up-target">
              <h3 className="dept-name">會本部</h3>
              <p className="dept-desc">部門簡介尚未提供，敬請期待。</p>
            </div>
            {/* 這裡可以依序補齊你原本的其餘部門卡片 */}
          </div>
        </div>
      </section>

      {/* ── PAGE: 學權公告 ── */}
      <section className={`page ${activeTab === "rights" ? "active" : ""}`} id="rights">
        {/* 請貼上你 index.html 裡的 #rights 內容 */}
      </section>

      {/* ── PAGE: 表單連結 ── */}
      <section className={`page ${activeTab === "forms" ? "active" : ""}`} id="forms">
        {/* 請貼上你 index.html 裡的 #forms 內容 */}
      </section>

      {/* ── PAGE: 公開資料 ── */}
      <section className={`page ${activeTab === "data" ? "active" : ""}`} id="data">
        <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <h1 className="page-title">公開資料</h1>
          </div>
        </div>

        <div className="section-wrap">
          <div className="data-tabs">
            <button className={`data-tab ${dataTab === "minutes" ? "active" : ""}`} onClick={() => setDataTab("minutes")}>會議紀錄</button>
            <button className={`data-tab ${dataTab === "budget" ? "active" : ""}`} onClick={() => setDataTab("budget")}>決預算</button>
            <button className={`data-tab ${dataTab === "other" ? "active" : ""}`} onClick={() => setDataTab("other")}>其他文件</button>
          </div>

          <div className={`data-panel ${dataTab === "minutes" ? "active" : ""}`}>
             {/* 貼上原本 tab-minutes 的內容 */}
          </div>
          <div className={`data-panel ${dataTab === "budget" ? "active" : ""}`}>
             {/* 貼上原本 tab-budget 的內容 */}
          </div>
          <div className={`data-panel ${dataTab === "other" ? "active" : ""}`}>
             {/* 貼上原本 tab-other 的內容 */}
          </div>
        </div>
      </section>
    </>
  );
}
