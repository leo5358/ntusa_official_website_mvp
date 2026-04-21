"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { tabFromHashFragment } from "@/lib/home-active-tab";

type NavHashItem = { kind: "hash"; id: string; label: string };
type NavRouteItem = { kind: "route"; href: string; label: string };
type NavItem = NavHashItem | NavRouteItem;

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("home");

  const openDrawer = () => {
    setIsDrawerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    const handleHash = () => {
      setActiveHash(tabFromHashFragment(window.location.hash));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleHash);
    handleHash();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  // Client navigations (e.g. router.push("/#about") from /campus-tools) often skip the native hashchange event.
  useEffect(() => {
    setActiveHash(tabFromHashFragment(window.location.hash));
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    closeDrawer();
    if (pathname === "/") {
      window.history.pushState(null, "", `/#${id}`);
      window.dispatchEvent(new Event("hashchange"));
    } else {
      router.push(`/#${id}`);
    }
  };

  const navItems: NavItem[] = [
    { kind: "hash", id: "home", label: "首頁" },
    { kind: "hash", id: "about", label: "關於我們" },
    { kind: "hash", id: "rights", label: "學權公告" },
    { kind: "hash", id: "forms", label: "表單連結" },
    { kind: "hash", id: "data", label: "公開資料" },
    { kind: "route", href: "/campus-tools", label: "校園工具" },
  ];

  const isNavActive = (item: NavItem) => {
    if (item.kind === "route") return pathname === item.href;
    return pathname === "/" && activeHash === item.id;
  };

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
        <div className="nav-inner">
          <Link href="/#home" className="nav-logo" onClick={(e) => navigateTo(e, "home")}>
            <div className="logo-mark">logo</div>
            <div className="logo-text">
              <span className="logo-title">臺大學生會</span>
              <span className="logo-sub">NTU Student Association</span>
            </div>
          </Link>

          <nav className="nav-links">
            {navItems.map((item) =>
              item.kind === "route" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isNavActive(item) ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.id}
                  href={`/#${item.id}`}
                  onClick={(e) => navigateTo(e, item.id)}
                  className={`nav-link ${isNavActive(item) ? "active" : ""}`}
                >
                  {item.label}
                </a>
              ),
            )}

            {/* 登入後才會顯示的按鈕 */}
            {session && (
              <>
                <div style={{ width: "1px", height: "20px", background: "var(--color-border)", margin: "0 8px" }}></div>
                <Link href="/editor" className="nav-link" style={{ color: "var(--color-brand-dark)", fontWeight: "bold" }}>
                  新增公告
                </Link>
                <Link href="/review" className="nav-link" style={{ color: "var(--color-secondary)", fontWeight: "bold" }}>
                  審核系統
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="nav-link" style={{ color: "#e53e3e" }}>
                  登出
                </button>
              </>
            )}
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
      <div className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`} onClick={closeDrawer}></div>
      <aside className={`drawer ${isDrawerOpen ? "open" : ""}`} id="drawer">
        <button className="drawer-close" onClick={closeDrawer} aria-label="關閉選單">✕</button>
        <div className="drawer-logo">
          <div className="logo-mark"></div>
          <div className="logo-text">
            <span className="logo-title">臺大學生會</span>
            <span className="logo-sub">NTU Student Association</span>
          </div>
        </div>
        <nav className="drawer-nav">
          {navItems.map((item) =>
            item.kind === "route" ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className={`drawer-link ${isNavActive(item) ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.id}
                href={`/#${item.id}`}
                onClick={(e) => navigateTo(e, item.id)}
                className={`drawer-link ${isNavActive(item) ? "active" : ""}`}
              >
                {item.label}
              </a>
            ),
          )}

          {/* 手機版：登入後按鈕 */}
          {session && (
            <>
              <div style={{ height: "1px", background: "var(--color-border)", margin: "8px 0" }}></div>
              <Link href="/editor" className="drawer-link" onClick={closeDrawer} style={{ color: "var(--color-brand-dark)", fontWeight: "bold" }}>
                ✨ 新增公告
              </Link>
              <Link href="/review" className="drawer-link" onClick={closeDrawer} style={{ color: "var(--color-secondary)", fontWeight: "bold" }}>
                📋 審核系統
              </Link>
              <button onClick={() => { closeDrawer(); signOut({ callbackUrl: '/' }); }} className="drawer-link" style={{ color: "#e53e3e", textAlign: "left" }}>
                登出
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}