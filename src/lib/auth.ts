import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail, sendVerificationEmail, sendPasswordResetEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
    },
  },


  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }: { user: { email: string }; url: string }) {
      await sendPasswordResetEmail(user.email, url);
    },
    async sendVerificationEmail({ user, url }: { user: { email: string }; url: string }) {
      await sendVerificationEmail(user.email, url);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({
        email,
        token,
        url,
      }: {
        email: string;
        token: string;
        url: string;
      }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
  ],
});

