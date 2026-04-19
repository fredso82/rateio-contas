import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { APP_DEFAULT_PATH, sanitizeRedirect } from "@/lib/navigation";
import { AppError, serializeErrorForLog } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  OAUTH_LINK_COOKIE_NAME,
  readOAuthLinkIntent,
} from "@/lib/oauth-link";
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
  trustHost: process.env.AUTH_TRUST_HOST === "true",
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
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const cookieStore = await cookies();
      const linkIntent = readOAuthLinkIntent(
        cookieStore.get(OAUTH_LINK_COOKIE_NAME)?.value,
      );

      try {
        const syncedUser = await syncGoogleUser({
          providerAccountId: account.providerAccountId,
          email: user.email,
          name: user.name,
          emailVerified:
            typeof profile === "object" &&
            profile !== null &&
            "email_verified" in profile
              ? profile.email_verified === true
              : false,
          linkUserId: linkIntent?.userId,
        });

        user.id = syncedUser.id;
        user.email = syncedUser.email;
        user.name = syncedUser.name;

        return true;
      } catch (error) {
        logger.error(
          "Falha ao sincronizar login Google.",
          serializeErrorForLog(error),
        );

        if (linkIntent) {
          const errorCode =
            error instanceof AppError ? error.code : "GOOGLE_LINK_FAILED";

          return `/app/perfil?linkError=${encodeURIComponent(errorCode)}`;
        }

        if (error instanceof AppError) {
          return `/entrar?error=${encodeURIComponent(error.code)}`;
        }

        return false;
      } finally {
        if (linkIntent) {
          cookieStore.delete(OAUTH_LINK_COOKIE_NAME);
        }
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
      logger.error("Auth.js retornou um erro.", serializeErrorForLog(error));
    },
    warn(code) {
      logger.warn("Auth.js retornou um warning.", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        logger.debug("Auth.js debug.", { code, metadata });
      }
    },
  },
});
