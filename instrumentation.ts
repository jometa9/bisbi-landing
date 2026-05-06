export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSubscriptionCheckScheduler } =
      await import("@/lib/subscriptions/subscription-check-scheduler");

    startSubscriptionCheckScheduler();
  }
}
