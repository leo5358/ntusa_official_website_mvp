"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    handleHashChange(); 
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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

    document.querySelectorAll(".fade-up-target").forEach((el, i) => {
      (el as HTMLElement).style.setProperty("--delay", `${(i % 5) * 60}ms`);
      el.classList.add("fade-up");
      fadeObserver.observe(el);
    });

    return () => fadeObserver.disconnect(); }, [activeTab]);

  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    window.history.pushState(null, "", `/#${id}`);
    window.dispatchEvent(new Event("hashchange"));
  };

  const depts = ["會本部", "秘書處", "學術部", "公關部", "資訊部", "財務部", "國際部", "選舉罷免執行委員會"];

  return (
    <>
      {/* ── PAGE: 首頁 ── */}
      <section className={`page ${activeTab === "home" ? "active" : ""}`} id="home">
        <div className="hero">
          <div className="hero-bg-placeholder">
            <span className="hero-placeholder-label">主視覺橫幅（Banner 圖片區）</span>
          </div>
          <div className="hero-overlay"></div>
          <div className="hero-content fade-up-target">
            <h1 className="hero-title">臺大學生會</h1>
            <p className="hero-desc">代表每一位臺大學生，守護學生權益、促進校園民主。</p>
            <a href="/#rights" onClick={(e) => navigateTo(e, "rights")} className="btn btn-primary">
              查看最新學權公告
            </a>
          </div>
          <div className="hero-scroll-hint">
            <span>向下捲動</span>
            <div className="scroll-arrow"></div>
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
                  <div className="news-card-img" style={post.coverImage ? { backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
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
          
          <div className="section-footer fade-up-target">
            <a href="/#rights" onClick={(e) => navigateTo(e, "rights")} className="btn btn-outline">
              查看所有公告 →
            </a>
          </div>
        </div>
      </section>

      {/* ── PAGE: 關於我們 ── */}
      <section className={`page ${activeTab === "about" ? "active" : ""}`} id="about">
        <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <div className="section-tag">About Us</div>
            <h1 className="page-title">關於我們</h1>
            <p className="page-desc">臺大學生會由全體學生組成，各部門協力推動校園事務。</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="section-header fade-up-target">
            <div className="section-tag">關於臺大學生會</div>
            <h2 className="section-title">歷史沿革</h2>
            <p className="section-sub">請不知道誰講古一下</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="section-header fade-up-target">
            <div className="section-tag">部門介紹</div>
            <h2 className="section-title">各部門工作內容</h2>
            <p className="section-sub">學生會由多個部門共同運作，各司其職，守護學生權益</p>
          </div>

          <div className="dept-grid">
            {depts.map((dept) => (
              <div className="dept-card fade-up-target" key={dept}>
                <h3 className="dept-name">{dept}</h3>
                <p className="dept-desc dept-placeholder">部門簡介尚未提供，敬請期待。</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAGE: 學權公告 ── */}
      <section className={`page ${activeTab === "rights" ? "active" : ""}`} id="rights">
        <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <div className="section-tag">Student Rights</div>
            <h1 className="page-title">學權公告</h1>
            <p className="page-desc">學生會關於學生權益之最新公告、聲明與說明。</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="rights-placeholder-box fade-up-target">
            <div className="placeholder-icon">📢</div>
            <h3>學權公告系統</h3>
            <p>此區塊將與後端發文系統進行連動，<br/>公告內容將由後端自動帶入顯示。</p>
            <div className="placeholder-badge">後端連動預留區</div>
          </div>
        </div>
      </section>

      {/* ── PAGE: 表單連結 ── */}
      <section className={`page ${activeTab === "forms" ? "active" : ""}`} id="forms">
        <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <div className="section-tag">Forms</div>
            <h1 className="page-title">表單連結</h1>
            <p className="page-desc">學生申訴、意見回饋及其他學生會表單連結一覽。</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="forms-grid">
            <div className="form-card fade-up-target">
              <div className="form-card-header"><span className="form-tag">申訴</span></div>
              <h3 className="form-title">學生申訴表單</h3>
              <p className="form-desc form-placeholder">連結尚未提供，即將上線。</p>
              <button className="btn btn-primary btn-sm disabled">即將上線</button>
            </div>
            <div className="form-card fade-up-target">
              <div className="form-card-header"><span className="form-tag">意見</span></div>
              <h3 className="form-title">意見回饋表單</h3>
              <p className="form-desc form-placeholder">連結尚未提供，即將上線。</p>
              <button className="btn btn-primary btn-sm disabled">即將上線</button>
            </div>
            <div className="form-card fade-up-target">
              <div className="form-card-header"><span className="form-tag">合作</span></div>
              <h3 className="form-title">活動合作申請</h3>
              <p className="form-desc form-placeholder">連結尚未提供，即將上線。</p>
              <button className="btn btn-primary btn-sm disabled">即將上線</button>
            </div>
            <div className="form-card add-card fade-up-target">
              <span className="add-icon">+</span>
              <p>更多表單即將新增</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAGE: 公開資料 ── */}
      <section className={`page ${activeTab === "data" ? "active" : ""}`} id="data">
        <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <div className="section-tag">Public Records</div>
            <h1 className="page-title">公開資料</h1>
            <p className="page-desc">學生會會議紀錄、決預算及其他公開文件。</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="data-tabs">
            <button className={`data-tab ${dataTab === "minutes" ? "active" : ""}`} onClick={() => setDataTab("minutes")}>會議紀錄</button>
            <button className={`data-tab ${dataTab === "budget" ? "active" : ""}`} onClick={() => setDataTab("budget")}>決預算</button>
            <button className={`data-tab ${dataTab === "other" ? "active" : ""}`} onClick={() => setDataTab("other")}>其他文件</button>
          </div>

          <div className={`data-panel ${dataTab === "minutes" ? "active" : ""}`}>
            <div className="rights-placeholder-box fade-up-target">
              <div className="placeholder-icon">📄</div>
              <h3>會議紀錄</h3>
              <p>此區塊將嵌入 Google Docs 或 Google Sheets，<br/>屆時會議紀錄將公開於此。</p>
              <div className="placeholder-badge">Google Docs / Sheets 嵌入區</div>
            </div>
          </div>
          <div className={`data-panel ${dataTab === "budget" ? "active" : ""}`}>
            <div className="rights-placeholder-box fade-up-target">
              <div className="placeholder-icon">💰</div>
              <h3>決預算</h3>
              <p>此區塊將嵌入 Google Sheets，<br/>學生會決預算資料將公開於此。</p>
              <div className="placeholder-badge">Google Sheets 嵌入區</div>
            </div>
          </div>
          <div className={`data-panel ${dataTab === "other" ? "active" : ""}`}>
            <div className="rights-placeholder-box fade-up-target">
              <div className="placeholder-icon">📂</div>
              <h3>其他文件</h3>
              <p>其他公開資料將陸續更新於此。</p>
              <div className="placeholder-badge">文件嵌入區</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
