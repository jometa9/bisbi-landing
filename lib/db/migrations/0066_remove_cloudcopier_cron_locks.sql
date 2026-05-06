
DELETE FROM "cronLock" WHERE "jobName" IN (
  'cleanup-scheduler',
  'heartbeat-check-scheduler',
  'pending-node-actions-scheduler',
  'reserve-nodes-scheduler',
  'snapshot-scheduler'
);

COMMENT ON TABLE "cronLock" IS 'Tracks cron job execution across multiple instances using PostgreSQL advisory locks. Jobs: subscription-check-scheduler';
