
CREATE TABLE IF NOT EXISTS "inboundEmail" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  "resendEmailId" text NOT NULL UNIQUE,

  "mailFrom" text NOT NULL,
  "rcptTo" jsonb NOT NULL,
  "subject" text,
  "messageId" text,

  "textBody" text,
  "htmlBody" text,
  "headers" jsonb,

  "rawWebhookPayload" jsonb,
  "rawEmailContent" jsonb,

  "status" varchar(20) NOT NULL DEFAULT 'pending',

  "readAt" timestamp,
  "archivedAt" timestamp,

  "receivedAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "inboundEmailAttachment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  "inboundEmailId" uuid NOT NULL REFERENCES "inboundEmail"("id") ON DELETE CASCADE,

  "resendAttachmentId" text,

  "filename" text NOT NULL,
  "contentType" text,
  "sizeBytes" integer,
  "contentId" text,
  "contentDisposition" varchar(20),

  "contentBytes" text,
  "storageUrl" text,

  "rawMetadata" jsonb,

  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "inboundEmail_receivedAt_idx" ON "inboundEmail"("receivedAt" DESC);
CREATE INDEX IF NOT EXISTS "inboundEmail_mailFrom_idx" ON "inboundEmail"("mailFrom");
CREATE INDEX IF NOT EXISTS "inboundEmail_status_idx" ON "inboundEmail"("status");
CREATE INDEX IF NOT EXISTS "inboundEmail_readAt_idx" ON "inboundEmail"("readAt");
CREATE INDEX IF NOT EXISTS "inboundEmailAttachment_inboundEmailId_idx" ON "inboundEmailAttachment"("inboundEmailId");

