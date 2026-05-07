import { relations, sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("passwordHash"),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  image: text("image"),
  apiKey: text("apiKey").unique(),
  resetToken: text("resetToken"),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  deletedAt: timestamp("deletedAt"),
  stripeCustomerId: text("stripeCustomerId").unique(),
});

export const userProductSubscription = pgTable("userProductSubscription", {
  id: serial("id").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productKey: varchar("productKey", { length: 20 }).notNull(),
  tier: varchar("tier", { length: 20 }).notNull().default("free"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  billingPeriod: varchar("billingPeriod", { length: 10 }),
  stripeSubscriptionId: text("stripeSubscriptionId").unique(),
  stripeProductId: text("stripeProductId"),
  planName: varchar("planName", { length: 50 }),
  expiresAt: timestamp("expiresAt"),
  metaPurchaseEventId: text("metaPurchaseEventId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const appSettings = pgTable("appSettings", {
  id: serial("id").primaryKey(),
  resendApiKey: text("resendApiKey"),
  emailFrom: text("emailFrom"),
  resendInboundWebhookSecret: text("resendInboundWebhookSecret"),
  discordWebhookUrl: text("discordWebhookUrl"),
  discordDailyReportWebhookUrl: text("discordDailyReportWebhookUrl"),
  internalApiKey: text("internalApiKey"),
  stripeSecretKey: text("stripeSecretKey"),
  stripeWebhookSecret: text("stripeWebhookSecret"),
  bisbiProMonthlyPriceId: text("bisbiProMonthlyPriceId"),
  bisbiProAnnualPriceId: text("bisbiProAnnualPriceId"),
  bisbiProMonthlyAmount: integer("bisbiProMonthlyAmount"),
  bisbiProAnnualAmount: integer("bisbiProAnnualAmount"),
  bisbiFreeMonthlyWordLimit: integer("bisbiFreeMonthlyWordLimit"),
  bisbiWindowsDownloadUrl: text("bisbiWindowsDownloadUrl"),
  bisbiMacDownloadUrl: text("bisbiMacDownloadUrl"),
  bisbiLinuxDownloadUrl: text("bisbiLinuxDownloadUrl"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  updatedBy: uuid("updatedBy").references(() => user.id),
});

export const userMonthlyUsage = pgTable(
  "userMonthlyUsage",
  {
    id: serial("id").primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productKey: varchar("productKey", { length: 20 }).notNull(),
    monthKey: varchar("monthKey", { length: 7 }).notNull(),
    wordsUsed: integer("wordsUsed").notNull().default(0),
    audioSeconds: integer("audioSeconds").notNull().default(0),
    transcriptionsCount: integer("transcriptionsCount").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userProductMonthIdx: uniqueIndex("userMonthlyUsage_user_product_month_idx").on(
      table.userId,
      table.productKey,
      table.monthKey
    ),
  })
);

export const accounts = pgTable("account", {
  id: serial("id").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refreshToken: text("refreshToken"),
  accessToken: text("accessToken"),
  expiresAt: integer("expiresAt"),
  tokenType: varchar("tokenType", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  idToken: text("idToken"),
  sessionState: varchar("sessionState", { length: 255 }),
});

export const inboundEmail = pgTable("inboundEmail", {
  id: uuid("id").primaryKey().defaultRandom(),
  resendEmailId: text("resendEmailId").notNull().unique(),
  mailFrom: text("mailFrom").notNull(),
  rcptTo: jsonb("rcptTo").notNull(),
  subject: text("subject"),
  messageId: text("messageId"),
  textBody: text("textBody"),
  htmlBody: text("htmlBody"),
  headers: jsonb("headers"),
  rawWebhookPayload: jsonb("rawWebhookPayload"),
  rawEmailContent: jsonb("rawEmailContent"),
  attachments: jsonb("attachments"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  readAt: timestamp("readAt"),
  archivedAt: timestamp("archivedAt"),
  receivedAt: timestamp("receivedAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const cronLock = pgTable("cronLock", {
  id: serial("id").primaryKey(),
  jobName: varchar("jobName", { length: 100 }).notNull().unique(),
  lockKey: integer("lockKey").notNull().unique(),
  lastRunAt: timestamp("lastRunAt"),
  lastRunBy: text("lastRunBy"),
  lastRunDurationMs: integer("lastRunDurationMs"),
  lastRunStatus: varchar("lastRunStatus", { length: 20 }),
  lastRunError: text("lastRunError"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});


export const userRelations = relations(user, ({ many }) => ({
  accounts: many(accounts),
  productSubscriptions: many(userProductSubscription),
}));

export const userProductSubscriptionRelations = relations(
  userProductSubscription,
  ({ one }) => ({
    user: one(user, {
      fields: [userProductSubscription.userId],
      references: [user.id],
    }),
  })
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;
export type UserProductSubscription =
  typeof userProductSubscription.$inferSelect;
export type NewUserProductSubscription =
  typeof userProductSubscription.$inferInsert;
export type InboundEmail = typeof inboundEmail.$inferSelect;
export type NewInboundEmail = typeof inboundEmail.$inferInsert;
export type UserMonthlyUsage = typeof userMonthlyUsage.$inferSelect;
export type NewUserMonthlyUsage = typeof userMonthlyUsage.$inferInsert;
export type CronLock = typeof cronLock.$inferSelect;
export type NewCronLock = typeof cronLock.$inferInsert;

export type ProductKey = "bisbi";
export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "admin_assigned"
  | "canceling"
  | "canceled"
  | "expired"
  | "past_due"
  | "incomplete"
  | "unpaid";

export type InboundEmailStatus = "pending" | "complete" | "partial" | "failed";
