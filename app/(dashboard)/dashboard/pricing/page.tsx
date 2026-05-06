import { PricingSection } from "@/components/pricing-section";
import { getCurrentUserFromSession } from "@/lib/db/queries";
import { paymentsEnabled } from "@/lib/payments/feature-flag";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  const user = await getCurrentUserFromSession();
  if (!user) {
    redirect("/sign-in");
  }
  if (!paymentsEnabled) {
    redirect("/dashboard");
  }

  return (
    <div className="px-3 w-full pb-20">
        <h1 className="text-2xl">Pricing plans</h1>
        <p className=" text-gray-600 text-sm max-w-2xl pt-1">
          Choose the plan that best fits your trading needs. Upgrade or
          downgrade at any time.
        </p>

      <PricingSection user={user} isCompact={true} />
    </div>
  );
}
