import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserGroups } from "./google-admin";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // 關鍵設定：如果是 https 環境，強制啟用安全 Cookie
  useSecureCookies: useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      const isAllowedToSignIn = user.email?.endsWith("@ntusa.ntu.edu.tw");
      return !!isAllowedToSignIn;
    },
    async redirect({ url, baseUrl }) {
      // 確保即使在反向代理後方，跳轉網址也維持 https
      if (url.startsWith("http://ntusa.ntu.edu.tw")) {
        return url.replace("http://", "https://");
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
};
