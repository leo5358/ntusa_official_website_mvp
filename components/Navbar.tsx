"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("home");

  // 監聽滾動與 Hash 變更
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    const handleHash = () => {
      setActiveHash(window.location.hash.replace("#", "") || "home");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleHash);
    
    // 初始化設定
    handleHash();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  // 處理鍵盤與抽屜開關
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    document.body.style.overflow = "";
  };

  const navLinks = [
    { id: "home", label: "首頁" },
    { id: "about", label: "關於我們" },
    { id: "rights", label: "學權公告" },
    { id: "forms", label: "表單連結" },
    { id: "data", label: "公開資料" },
  ];

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
        <div className="nav-inner">
          <Link href="/#home" className="nav-logo" onClick={closeDrawer}>
            <div className="logo-mark">logo</div>
            <div className="logo-text">
              <span className="logo-title">臺大學生會</span>
              <span className="logo-sub">NTU Student Association</span>
            </div>
          </Link>

          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={`/#${link.id}`}
                className={`nav-link ${activeHash === link.id ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className={`hamburger ${isDrawerOpen ? "open" : ""}`}
            onClick={isDrawerOpen ? closeDrawer : openDrawer}
            aria-label="開啟選單"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* 手機版側邊選單 */}
      <div
        className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
      ></div>
      <aside className={`drawer ${isDrawerOpen ? "open" : ""}`} id="drawer">
        <button className="drawer-close" onClick={closeDrawer} aria-label="關閉選單">
          ✕
        </button>
        <div className="drawer-logo">
          <div className="logo-mark"></div>
          <div className="logo-text">
            <span className="logo-title">臺大學生會</span>
            <span className="logo-sub">NTU Student Association</span>
          </div>
        </div>
        <nav className="drawer-nav">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              className={`drawer-link ${activeHash === link.id ? "active" : ""}`}
              onClick={closeDrawer}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
