
ALTER TABLE "inboundEmail" 
ADD COLUMN IF NOT EXISTS "attachments" jsonb;

UPDATE "inboundEmail" e
SET "attachments" = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', a."resendAttachmentId",
      'filename', a."filename",
      'contentType', a."contentType",
      'sizeBytes', a."sizeBytes",
      'contentId', a."contentId",
      'contentDisposition', a."contentDisposition",
      'downloadUrl', a."storageUrl",
      'rawMetadata', a."rawMetadata"
    )
  ), '[]'::jsonb)
  FROM "inboundEmailAttachment" a
  WHERE a."inboundEmailId" = e."id"
)
WHERE EXISTS (
  SELECT 1 FROM "inboundEmailAttachment" a WHERE a."inboundEmailId" = e."id"
);

DROP TABLE IF EXISTS "inboundEmailAttachment" CASCADE;
