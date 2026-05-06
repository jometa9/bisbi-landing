import { AIAssistantScreen } from "@/components/ai-assistant-screen";
import { getCurrentUserFromSession } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AssistantPage() {
  const user = await getCurrentUserFromSession();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="px-3 w-full h-full">
      <AIAssistantScreen />
    </div>
  );
}
