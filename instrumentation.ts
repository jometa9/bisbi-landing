export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startSubscriptionCheckScheduler } = await import(
    "@/lib/subscriptions/subscription-check-scheduler"
  );
  startSubscriptionCheckScheduler();
}
