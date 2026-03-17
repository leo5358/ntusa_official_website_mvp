import {
    Html,
    Body,
    Container,
    Text,
    Section,
    Heading,
    Link,
  } from "@react-email/components";
  import * as React from "react";
  
  interface ReviewRequestEmailProps {
    postTitle: string;
    authorEmail: string;
  }
  
  export default function ReviewRequestEmail({ postTitle, authorEmail }: ReviewRequestEmailProps) {
    return (
      <Html>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>新文章待審核通知</Heading>
            
            <Section style={section}>
              <Text style={text}>公關部 您好：</Text>
              <Text style={text}>
                系統剛剛收到了一篇新文章的發布申請，目前正在等待您的審核。
              </Text>
              
              <div style={infoBox}>
                <Text style={infoText}>文章標題：{postTitle}</Text>
                <Text style={infoText}>提交部門：{authorEmail}</Text>
              </div>
  
              <Text style={text}>
                請登入官網的「審核者儀表板」進行內容確認，並執行核准或退回操作。
              </Text>
  
              {/* 如果你的正式機網址出來了，可以把 href 換成正式網址 */}
              <Link href="https://你的正式網址.com/review" style={button}>
                前往審核儀表板
              </Link>
            </Section>
  
            <Text style={footer}>
              此信件為系統自動發送，請勿直接回覆。<br/>
              國立台灣大學學生會 敬上
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
  
  // Inline CSS 樣式
  const main = { backgroundColor: "#f6f9fc", padding: "40px 0", fontFamily: "sans-serif" };
  const container = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", margin: "0 auto", padding: "20px", maxWidth: "600px" };
  const heading = { fontSize: "24px", color: "#1f2937", textAlign: "center" as const, borderBottom: "2px solid #e5e7eb", paddingBottom: "16px" };
  const section = { padding: "20px 0" };
  const text = { fontSize: "16px", color: "#4b5563", lineHeight: "1.5" };
  const infoBox = { backgroundColor: "#f3f4f6", borderLeft: "4px solid #3b82f6", padding: "12px", margin: "16px 0" };
  const infoText = { fontSize: "16px", fontWeight: "bold" as const, color: "#111827", margin: "4px 0" };
  const button = { backgroundColor: "#2563eb", color: "#ffffff", padding: "12px 20px", borderRadius: "6px", textDecoration: "none", display: "inline-block", marginTop: "16px", fontWeight: "bold" as const };
  const footer = { fontSize: "12px", color: "#9ca3af", textAlign: "center" as const, marginTop: "24px" };