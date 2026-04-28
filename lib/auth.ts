import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
