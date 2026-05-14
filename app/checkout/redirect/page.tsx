import { getStripe } from "@/lib/payments/stripe";
import { notFound, redirect } from "next/navigation";
import RedirectClient from "./RedirectClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CheckoutRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ sid?: string }>;
}) {
  const { sid } = await searchParams;

  if (!sid || !sid.startsWith("cs_")) {
    notFound();
  }

  const stripe = await getStripe();

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sid);
  } catch {
    notFound();
  }

  if (!session.url) {
    if (session.status === "complete") {
      redirect("/dashboard?checkout=success");
    }
    notFound();
  }

  return <RedirectClient sessionId={sid} stripeUrl={session.url} />;
}
