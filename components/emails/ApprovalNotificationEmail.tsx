import {
    Html,
    Body,
    Container,
    Text,
    Section,
    Heading,
  } from "@react-email/components";
  import * as React from "react";
  
  interface ApprovalEmailProps {
    postTitle: string;
    status: "APPROVED" | "REJECTED";
  }
  
  export default function ApprovalNotificationEmail({ postTitle, status }: ApprovalEmailProps) {
    const isApproved = status === "APPROVED";
  
    return (
      <Html>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>台大學生會 官網文章審核通知</Heading>
            
            <Section style={section}>
              <Text style={text}>您好：</Text>
              <Text style={text}>
                您所提交的文章 <strong>「{postTitle}」</strong> 已經由公關部完成審核。
              </Text>
              
              <div style={isApproved ? approvedBox : rejectedBox}>
                <Text style={statusText}>
                  目前狀態：{isApproved ? "已核准 (發布至前台)" : "已退回 (請修正後重新提交)"}
                </Text>
              </div>
  
              <Text style={text}>
                {isApproved 
                  ? "您的文章現在已經可以在官方網站首頁看到了！" 
                  : "請登入系統查看退回原因並進行修改。如果有任何問題，請聯繫公關部。"}
              </Text>
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
  
  // 以下為簡單的 Inline CSS 樣式
  const main = { backgroundColor: "#f6f9fc", padding: "40px 0", fontFamily: "sans-serif" };
  const container = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", margin: "0 auto", padding: "20px", maxWidth: "600px" };
  const heading = { fontSize: "24px", color: "#1f2937", textAlign: "center" as const, borderBottom: "2px solid #e5e7eb", paddingBottom: "16px" };
  const section = { padding: "20px 0" };
  const text = { fontSize: "16px", color: "#4b5563", lineHeight: "1.5" };
  const approvedBox = { backgroundColor: "#ecfdf5", borderLeft: "4px solid #10b981", padding: "12px", margin: "16px 0" };
  const rejectedBox = { backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444", padding: "12px", margin: "16px 0" };
  const statusText = { fontSize: "16px", fontWeight: "bold" as const, color: "#111827", margin: 0 };
  const footer = { fontSize: "12px", color: "#9ca3af", textAlign: "center" as const, marginTop: "24px" };
