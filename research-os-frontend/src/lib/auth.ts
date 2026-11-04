import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Partial<Record<string, unknown>> | undefined) {
        if (credentials?.email && credentials?.password) {
          return { id: "1", email: credentials.email as string, name: "Researcher" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});