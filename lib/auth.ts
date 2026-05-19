import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserGroups } from "./google-admin";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Force https for production domain to fix proxy issues
      if (url.startsWith("http://ntusa.ntu.edu.tw")) {
        return url.replace("http://", "https://");
      }
      return baseUrl;
    },
    async signIn({ user }) {
      const isAllowedToSignIn = user.email?.endsWith("@ntusa.ntu.edu.tw");
      return !!isAllowedToSignIn;
    },
    async jwt({ token, user, account }) {
      if (account && user && user.email) {
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
  // 讓 NextAuth 知道它是在反向代理之後運作，強制使用安全 Cookie
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
