import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserGroups } from "./google-admin";

export const authOptions: NextAuthOptions = {
  // 確保使用環境變數中的 Secret
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // 移除手動 Cookie 設定，讓 NextAuth 根據 NEXTAUTH_URL 自動處理 (這最穩定)
  callbacks: {
    async signIn({ user }) {
      const isAllowedToSignIn = user.email?.endsWith("@ntusa.ntu.edu.tw");
      return !!isAllowedToSignIn;
    },
    async jwt({ token, user, account }) {
      if (account && user && user.email) {
        console.log(`[NextAuth] Initial sign-in for: ${user.email}`);
        try {
          const groups = await getUserGroups(user.email);
          let role: "admin" | "reviewer" | "editor" = "editor";
          let department: string = "一般部門";

          for (const group of groups) {
            const groupEmail = group.email?.toLowerCase();
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
          token.role = role;
          token.department = department;
        } catch (error) {
          console.error("[NextAuth] Error fetching user groups:", error);
          token.role = "editor";
          token.department = "一般部門";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as any) || "editor";
        session.user.department = (token.department as any) || "一般部門";
      }
      return session;
    },
  },
  // 針對反向代理的優化
  pages: {
    signIn: '/api/auth/signin',
  }
};
