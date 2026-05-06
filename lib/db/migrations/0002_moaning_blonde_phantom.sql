CREATE TABLE "subscriptionHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"eventType" varchar(50) NOT NULL,
	"planName" varchar(50),
	"previousPlanName" varchar(50),
	"subscriptionStatus" varchar(20),
	"stripeSubscriptionId" text,
	"stripeProductId" text,
	"subscriptionStartDate" timestamp,
	"subscriptionEndDate" timestamp,
	"eventDate" timestamp DEFAULT now() NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "user" ADD COLUMN "firstSubscriptionDate" timestamp;
ALTER TABLE "user" ADD COLUMN "lastCancellationDate" timestamp;
ALTER TABLE "user" ADD COLUMN "totalSubscriptionMonths" integer DEFAULT 0;
ALTER TABLE "subscriptionHistory" ADD CONSTRAINT "subscriptionHistory_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
