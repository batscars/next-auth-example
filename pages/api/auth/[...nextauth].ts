import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import Auth0Provider from "next-auth/providers/auth0";
import { signIn } from "next-auth/react";
// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    authToken?: string | null;
  };
}

interface CustomUser extends User {
  authToken?: string | null;
}

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    authToken?: string | null;
  };
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains

    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const resp = await fetch("/api/login");
      if (resp.ok) {
        const respJson = await resp.json();
        (user as CustomUser).authToken = respJson.token;
        console.info("signIn", user, account, profile, email, credentials);
        return true;
      }

      return false;
    },
    async jwt({ token, user }) {
      const resp = await fetch("/api/login");
      if (resp.ok) {
        const respJson = await resp.json();
        token.authToken = respJson.token;
        console.info("jwt", token, user);
      }
      return token;
    },
    async session({ session, token, user }) {
      const customSession = session as CustomSession;
      if (token) {
        customSession.user = {
          name: token.name,
          authToken: token.authToken as string,
        };
      }
      console.info("session", session, customSession, user, token);
      return customSession;
    },
  },
};

export default NextAuth(authOptions);
