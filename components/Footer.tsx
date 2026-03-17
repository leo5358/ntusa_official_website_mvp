import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo-mark small">logo</div>
          <div>
            <div className="footer-name">國立臺灣大學學生會</div>
            <div className="footer-name-en">NTU Student Association</div>
          </div>
        </div>
        <div className="footer-links">
          <Link href="/#home">首頁</Link>
          <Link href="/#about">關於我們</Link>
          <Link href="/#rights">學權公告</Link>
          <Link href="/#forms">表單連結</Link>
          <Link href="/#data">公開資料</Link>
        </div>

        <div className="footer-socials">
          <a href="https://www.facebook.com/NTUSAtw/" target="_blank" rel="noopener noreferrer">
            {/* 放入你的 Facebook SVG */}
            FB
          </a>
          <a href="https://www.instagram.com/ntusa.taiwan/" target="_blank" rel="noopener noreferrer">
             {/* 放入你的 IG SVG */}
            IG
          </a>
        </div>

        <div className="footer-copy">© 2026 國立臺灣大學學生會資訊部</div>
      </div>
    </footer>
  );
}
