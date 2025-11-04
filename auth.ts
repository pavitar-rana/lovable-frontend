import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { prisma } from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: "no-reply@pomogolo.ninja",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 2, // 2 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = typeof token.id === "string" ? token.id : "";

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
