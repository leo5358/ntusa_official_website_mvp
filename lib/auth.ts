import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserGroups } from "./google-admin";

export const authOptions: NextAuthOptions = {
  // 1. 確保加入 secret
  secret: process.env.NEXTAUTH_SECRET, 
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // 檢查使用者信箱是否以指定網域結尾
      const isAllowedToSignIn = user.email?.endsWith("@ntusa.ntu.edu.tw");
      
      if (isAllowedToSignIn) {
        return true; 
      } else {
        // 若不允許，則回傳 false 禁止登入
        return false; 
      }
    },
    async redirect({ url, baseUrl }) {
      // 修正反向代理導致的 http/https 協議不匹配問題
      if (url.startsWith("http://ntusa.ntu.edu.tw")) {
        return url.replace("http://", "https://");
      }
      // 確保重新導向網址始終在同一個網域下
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      // 第一次登入時，從 Google Directory API 取得群組資訊
      if (account && user && user.email) {
        console.log(`[NextAuth] Initial sign-in for: ${user.email}`);
        const groups = await getUserGroups(user.email);
        
        let role: "admin" | "reviewer" | "editor" = "editor";
        let department: string = "一般部門";

        // 根據群組信箱對應角色與部門
        for (const group of groups) {
          const groupEmail = group.email?.toLowerCase();
          console.log(`[NextAuth] Checking group: ${groupEmail}`);
          
          if (groupEmail === "infor@ntusa.ntu.edu.tw") {
            role = "admin";
            department = "資訊部";
            break;
          } else if (groupEmail === "pr-dept@ntusa.ntu.edu.tw") {
            role = "reviewer";
            department = "公關部";
            break;
          } else if (groupEmail?.endsWith("@ntusa.ntu.edu.tw")) {
            role = "editor";
            department = group.name || groupEmail.split("@")[0];
          }
        }

        console.log(`[NextAuth] Assigned Role: ${role}, Department: ${department}`);
        token.role = role;
        token.department = department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
        session.user.department = token.department as any;
      }
      return session;
    },
  },
  // 2. 讓 NextAuth 知道它是在反向代理之後運作
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true // 強制使用安全 Cookie
      }
    }
  }
};
