import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { APP_DEFAULT_PATH, sanitizeRedirect } from "@/lib/navigation";
import { logger } from "@/lib/logger";
import { signInSchema } from "@/lib/validation/auth";
import { syncGoogleUser, verifyCredentials } from "@/server/auth/repository";

function normalizeCallbackUrl(url: string, baseUrl: string) {
  if (url.startsWith("/")) {
    return `${baseUrl}${sanitizeRedirect(url)}`;
  }

  if (url.startsWith(baseUrl)) {
    const relativePath = url.slice(baseUrl.length) || APP_DEFAULT_PATH;
    return `${baseUrl}${sanitizeRedirect(relativePath)}`;
  }

  return `${baseUrl}${APP_DEFAULT_PATH}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.AUTH_TRUST_HOST !== "false",
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Email e senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        return verifyCredentials(
          parsedCredentials.data.email,
          parsedCredentials.data.password,
        );
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      try {
        const syncedUser = await syncGoogleUser({
          providerAccountId: account.providerAccountId,
          email: user.email,
          name: user.name,
        });

        user.id = syncedUser.id;
        user.email = syncedUser.email;
        user.name = syncedUser.name;

        return true;
      } catch (error) {
        logger.error("Falha ao sincronizar login Google.", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      return normalizeCallbackUrl(url, baseUrl);
    },
  },
  logger: {
    error(error) {
      logger.error("Auth.js retornou um erro.", error);
    },
    warn(code) {
      logger.warn("Auth.js retornou um warning.", code);
    },
    debug(code, metadata) {
      logger.debug("Auth.js debug.", { code, metadata });
    },
  },
});
