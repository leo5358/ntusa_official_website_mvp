"use client";

import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import { tabFromHashFragment } from "@/lib/home-active-tab";
import AlternatingPostList from "./AlternatingPostList";

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

  const applyHashToTab = useCallback((scrollBehavior: ScrollBehavior = "smooth") => {
    const tab = tabFromHashFragment(window.location.hash);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  }, []);

  // Apply hash before paint so navigations from other routes (e.g. /campus-tools) do not flash the home hero.
  useLayoutEffect(() => {
    applyHashToTab("auto");
  }, [applyHashToTab]);

  useEffect(() => {
    const handleHashChange = () => applyHashToTab("smooth");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [applyHashToTab]);

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

    return () => fadeObserver.disconnect(); 
  }, [activeTab]);

  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    window.history.pushState(null, "", `/#${id}`);
    window.dispatchEvent(new Event("hashchange"));
  };

  const deptsData = [
    {
       name: "會本部",
       desc: "部門簡介尚未提供，敬請期待。"
    },
    {
       name: "秘書處",
       desc: "部門簡介尚未提供，敬請期待。"
    },
    {
       name: "學術部",
       desc: "部門簡介尚未提供，敬請期待。"
    },
    {
        name: "公關部",
        desc: "以提升學生福祉為出發點，致力於洽談特約廠商及多元跨界合作。除籌辦「期中期末補給站」等參與式活動，亦主導社群媒體素材發想與資訊傳遞，同時擔任對外聯絡窗口。期望能透過資源整合，將社會能量引進校園，提升學生福祉。"
    },
    {
        name: "資訊部",
        desc: "資訊部是學生會與校園數位環境之間的橋樑，負責倡議改善同學日常使用的校園資訊系統，包含校內網路、印表機體驗等。此外，我們也會追蹤資訊安全與隱私權議題、處理陳情案件與突發事件通報。在技術開發上，我們維護財務報帳系統、學生會官網，同時負責會內各部門的資料整合與密碼管理基礎建設。"
    },
    {
       name: "財務部",
       desc: "負責預決算編列、會內請款報帳、校內核銷與控管會內整體財務狀況"
    },
    {
       name: "國際部",
       desc: "部門簡介尚未提供，敬請期待。"
    },
    {
       name: "選舉罷免執行委員會",
       desc: "部門簡介尚未提供，敬請期待。"
    }
  ];

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
            <Link href="/#rights" onClick={(e) => navigateTo(e, "rights")} className="btn btn-primary">
              查看最新學權公告
            </Link>
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
            <Link href="/#rights" onClick={(e) => navigateTo(e, "rights")} className="btn btn-outline">
              查看所有公告 →
            </Link>
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
          </div>
          <div className="about-body fade-up-target">
            <p>國立臺灣大學學生會正式成立於 1988 年八月，其前身為國立臺灣大學學生代表聯合會。其章程〈國立臺灣大學學生會自治規程〉，於 1990 年正式經全校同學複決通過。成立迄今已是第三十八屆。</p>
            <p>臺大學生會最早可以追溯至戰後初期由各學院學生自治會會組成的「學生自治會聯合會」。不過在1949 年「四六事件」爆發以後，學校加強對學生自治團體的管理。改為由各學院組成院學生代表會與「一年級學生代表會」共同組成「各學院學生代表會聯合會」，選出正副主席與各部總幹事，即是學生會的前身代聯會。</p>
            <p>隨著時間發展，代聯會也從「各學院學生代表會聯合會」改名為「學生代表聯合會」，與各院院代會從上下隸屬關係，轉型各自獨立的學生組織。代聯會主席也由各院代表選出，擴大為由班代選出。從 1962 年起，代聯會主席主席任期由一學期改為一學年，有更長的時間能推動會務。當時的代聯會，享有先天上的極度優勢 ，不管是人力或財力均為全校各社團之冠，史料上每屆列名的幹部均在一、二百人之譜，實際的工作人員更多達三、四百人，當時一年可以出版四期厚達一百餘頁的《臺大青年》，全校性的活動更幾乎由代聯會所包辦，可說是代聯會的全盛時期。</p>
            <p>1971 年學生活動中心落成，臺大的新社團開始陸續成立，臺大校內的學生活動更為多元。當時的代聯會首創「臺大節」系列活動、園遊會、學術性社團聯展、音樂季、科系聯展、開辦家教中心。配合當時風起雲湧的保釣運動，對民主化與言論自由產生新一輪的反思。時任代聯會主席王復蘇，在班代大會中通過將「學生代表聯合會」改為「學生聯合會」，並修改章程主張普選代聯會主席，然而卻被當時的校方否決。當時的法學院學生代表會，在前後任主任洪三雄、陳玲玉，在《法言》上大力挑戰戒嚴時代的言論自由尺度。然而到了 1970 年代末期，班代大會參與度降低，經常難以成會。當時的代聯會曾經一度以設置諮詢會取代班代大會。</p>
            <p>進入 1980 年代，爭取民主正式成為臺灣社會的共同聲音。1982 年年底，在代聯會主席選舉前夕，由五人小組主導，在《大學新聞》、《台大法言》、《醫訊》等學生刊物上刊登社論呼籲代聯會主席直選，震驚全校。隨後幾年，爭取直選成為校內最主要的政治議題。1985 年，學代大會以 94:0 通過代聯會主席直選議案，然而再次被校方否決。1986 年，因為學校以違反審稿辦法將大新社停社一年，學生發動「自由之愛」運動，倡議學術自由、集會結社自由、教授治校、大學自治。同年代聯會選出陳志柔擔任主席，任內使校方同意學生會長直選，選出首任學代會議長何榮幸，為代聯會向學生會過渡做準備。</p>
            <p>1988 年，全體臺大學生以 53% 的投票率，選出首任學生會長羅文嘉。然而學生會究竟該採用總統制還是內閣制，各種制度的設計旋即又成為爭論的焦點。經過章程制定委員會、學代大會等各種漫長的討論與爭執，在 1990 年由全校學生投票通過的〈臺大學生會自治規程〉正式確立為學生會的根本大法。又經歷了數年的爭論，才在 1992 年陸續完成行政、立法、司法、選舉等重要法規的立法。</p>
            <p>前幾屆臺大學生會，在野百合學運帶起的學生運動風潮下，成為進步議題的橋頭堡。第二屆學生會長范雲、第三屆林奕華、第六屆黃國昌後來都走上從政的道路。投票率也都在 30% 以上。在此期間，學生會也促使立法院在1993年修正大學法，確立大學自治的制度保障。1994年在校務會議推動廢除必修軍護課程。同時因應大學法的修正，臺大在 1993 - 1994 年間進行了臺大組織規程的修正，圍繞組織規程開啟了校務會議學生代表比例、產生方式、學生會與研究生協會權限分配、學生會費收取的討論。1995年學生法院做出解釋第三號，確立研究生屬於臺大學生會的當然會員。</p>
            <p>1996 年的第八屆學生會長選舉，是學生會創立以來會長選舉投票率跌破 20%。學生法院做出第四號解釋，規定選舉設置投票門檻違反學生憲章。隨著民主化的進程，各種社團在校內可以跟學生會平起平坐，學生反映意見不一定需要透過學生會。學生會於是開始各種活動的嘗試，首創臺大電影節、臺大藝術季、杜鵑花節等活動，同時推動舟山路廢道、維持春假等校內社會議題。2001 年的第十四屆學生會長選舉，因為選務的問題，成為迄今唯一一次遭到學生法院判決選舉無效的會長選舉。在 2002 - 2003 年間，學代會通過了預算法與決算法，確立學生會財務制度的基礎。</p>
            <p>2008 年，在第二十一屆學生會長許菁芳的領導下，學生會積極參與社會運動，除了當時社會上的野草莓運動，也結合校內的意識報社、海島新聞等社團，發起「百大維新」系列運動，質疑當時學校領導層過於迷信前進全球百大，犧牲其他重要問題。第二十三屆學生會長陳乙棋任內，因為舉辦四校聯合公益演唱會虧損七十三萬，引起巨大爭議。在 2009 - 2011 年間，學代會陸續修訂了行政、立法、司法、選舉相關法規，成立選舉罷免執行委員會，通過〈會費收取條例〉、〈會長代理與繼任條例〉、〈學代會職權行使法〉、〈學代會監察法〉等重要自治法規。</p>
            <p>學生會也隨著社會潮流，成立新的政策部門如性別部（今學術部性別平等工作坊）、外務部（今國際事務部）、永續部（今學術部永續執行組）與資訊部，讓學生會的組織更貼近學生的需求。學代會也在 2015 年通過〈多元性別平等促進法〉，彰顯對於多元價值的支持。選委會也在 2014 年嘗試導入電子投票，但是在經過幾年的嘗試與爭論後，因系統穩定性與秘密投票問題，在 2019 年正式廢止電子投票。</p>
            <p>隨著校長遴選新制的實施，學生會也致力於增加讓學生參與校長遴選的機會。第三十屆學生會長林彥廷在擔任學生遴選委員同時也首創「校長，給問嗎？」，讓校長候選人直面學生。隨後在新任臺大校長管中閔的聘任爭議中，學生代表也秉持堅持程序正義的態度，在校務會議、媒體上積極發聲。</p>
            <p>面對校內外的政治壓力，學生會依然積極推動各種校內議題，降低服務學習、廢除大學國文、推動轉型正義、本土語言、反成績公布新聞，在跟校方的攻防中，偶有成功。任何一點的進步，都需要數年的推動。</p>
            <p>在 2020 到 2022 年，三年的疫情對臺灣社會與臺大校園都產生衝擊，學生會在陪伴學生走過疫情、檢討校內疫情政策、發起疫情共編的同時，也要面對自身存續的壓力。在限制群聚的三級警戒下，2021 年學生會第一次無法如期改選學生會長。在疫情與後疫情時代的壓力下，投票率低、收入下降成為學生會的常態，儘管如此，學生會依然推動無車校園、首創 Open House NTU、開辦校級主管座談會。</p>
            <p>2025年，學生會出現了當了一分鐘的會長。2026 年三月，時任學生會長陳柏承成為首位被罷免的學生會長。從代聯會到大學生會，我們始終都承載著臺大學生探索民主的歷程，背負「塑造自由平等之社會，建設民主法治之國家」的夢想。</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="section-header fade-up-target">
            <div className="section-tag">部門介紹</div>
            <h2 className="section-title">各部門工作內容</h2>
            <p className="section-sub">學生會由多個部門共同運作，各司其職，守護學生權益</p>
          </div>

        <div className="dept-grid">
            {deptsData.map((dept) => (
              <div className="dept-card fade-up-target" key={dept.name}>
                <h3 className="dept-name">{dept.name}</h3>
                <p className="dept-desc">{dept.desc}</p>
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
          {/* 原本的 placeholder 已替換為 AlternatingPostList */}
          <div className="fade-up-target">
            <AlternatingPostList posts={posts} />
          </div>
        </div>
      </section>

      {/* ── PAGE: 相關連結 ── */}
      <section className={`page ${activeTab === "forms" ? "active" : ""}`} id="forms">
        <div className="page-hero-mini">
          <div className="page-hero-mini-content">
            <div className="section-tag">Links</div>
            <h1 className="page-title">相關連結</h1>
            <p className="page-desc">學生會各部門網站、學權申訴管道及外部資源連結。</p>
          </div>
        </div>

        <div className="section-wrap">
          <div className="section-header fade-up-target">
            <div className="section-tag">學權申訴</div>
            <h2 className="section-title">學生權益管道</h2>
          </div>
          <div className="links-grid">
            <a
              href="https://line.me/R/ti/p/%40ntusa"
              target="_blank"
              rel="noopener noreferrer"
              className="link-card fade-up-target"
            >
              <div className="link-card-icon line-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </div>
              <div className="link-card-body">
                <div className="link-card-tag">LINE 官方帳號</div>
                <h3 className="link-card-title">學權申訴 LINE Bot</h3>
                <p className="link-card-desc">加入 @ntusa 官方帳號，直接向學生會反映學權問題。</p>
              </div>
              <span className="link-card-arrow">→</span>
            </a>
          </div>

          <div className="section-header fade-up-target" style={{ marginTop: "56px" }}>
            <div className="section-tag">各部門</div>
            <h2 className="section-title">部門網站連結</h2>
          </div>
          <div className="links-grid">
            <div className="link-card link-card-placeholder fade-up-target">
              <div className="link-card-body">
                <div className="link-card-tag">即將上線</div>
                <h3 className="link-card-title">各部門網站</h3>
                <p className="link-card-desc">部門連結即將陸續新增。</p>
              </div>
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