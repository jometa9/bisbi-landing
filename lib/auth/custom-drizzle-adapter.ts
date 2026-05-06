import { db } from "@/lib/db/drizzle";
import { accounts, user } from "@/lib/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import type { Adapter, AdapterAccount } from "next-auth/adapters";
import { createNewUserWithOnboarding } from "./user-onboarding";

export function CustomDrizzleAdapter(): Adapter {
  return {
    ...DrizzleAdapter(db, {
      schema: {
        user,
        account: accounts,
      },
    }),
    async getUserByAccount({ provider, providerAccountId }) {
      const result = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId)
          )
        )
        .leftJoin(user, eq(accounts.userId, user.id))
        .limit(1);

      if (!result[0]?.user) {
        return null;
      }

      return result[0].user;
    },
    async createUser(data: {
      email: string;
      name?: string | null;
      image?: string | null;
    }) {
      const email = data.email;

      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return existingUser[0];
      }

      const result = await createNewUserWithOnboarding({
        email,
        name: data.name || null,
        source: "oauth_google",
      });

      if (!result.success || !result.user) {
        console.error(`[OAuth Adapter] Failed to create user: ${email}`);
        throw new Error("Failed to create user");
      }

      return result.user;
    },
    async createAccount(data: AdapterAccount) {
      const [account] = await db.insert(accounts).values(data).returning();
      return account;
    },
    async updateAccount(data: AdapterAccount) {
      const [account] = await db
        .update(accounts)
        .set(data)
        .where(
          and(
            eq(accounts.provider, data.provider),
            eq(accounts.providerAccountId, data.providerAccountId)
          )
        )
        .returning();
      return account;
    },
    async linkAccount(account: AdapterAccount) {
      try {
        const [linkedAccount] = await db
          .insert(accounts)
          .values(account)
          .returning();
        if (!linkedAccount) {
          throw new Error("Failed to create account record");
        }
        return linkedAccount;
      } catch (error) {
        throw error;
      }
    },
    async unlinkAccount({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) {
      const [unlinkedAccount] = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId)
          )
        )
        .returning();
      return unlinkedAccount;
    },
    async deleteAccount({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) {
      const [deletedAccount] = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId)
          )
        )
        .returning();
      return deletedAccount;
    },
  };
}
