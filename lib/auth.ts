import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // signIn callback triggered when user tries to sign in
    async signIn({ user }) {
      // check if the user's email ends with the allowed domain
      const isAllowedToSignIn = user.email?.endsWith("@ntusa.ntu.edu.tw");
      
      if (isAllowedToSignIn) {
        return true; 
      } else {
        // if not allowed, you can optionally log the attempt or show a message to the user
        return false; 
      }
    },
  },
};