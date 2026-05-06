"use server";

import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { trackCompleteRegistration } from "@/lib/meta";
import { generateApiKey } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

interface CreateNewUserParams {
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  source: "signup_form" | "oauth_google" | "internal_api";
  formData?: FormData;
  profile?: {
    given_name?: string;
    family_name?: string;
  };
  skipWelcomeEmail?: boolean;
}

interface CreateNewUserResult {
  success: boolean;
  user?: typeof user.$inferSelect;
  error?: string;
  welcomeEmailSent: boolean;
  stripeCustomerCreated: boolean;
}

export async function createNewUserWithOnboarding(
  params: CreateNewUserParams
): Promise<CreateNewUserResult> {
  const { email, name, passwordHash, source, formData, profile, skipWelcomeEmail } = params;

  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      error: "Email already in use.",
      welcomeEmailSent: false,
      stripeCustomerCreated: false,
    };
  }

  const apiKey = generateApiKey();
  const stripeCustomerCreated = false;

  const [createdUser] = await db
    .insert(user)
    .values({
      email,
      name: name || null,
      passwordHash: passwordHash || null,
      apiKey,
      role: "owner",
    })
    .returning();

  if (!createdUser) {
    console.error(`[Onboarding] Failed to create user in database: ${email}`);
    return {
      success: false,
      error: "Failed to create user. Please try again.",
      welcomeEmailSent: false,
      stripeCustomerCreated,
    };
  }

  const welcomeEmailSent = false;

  if (source === "internal_api") {
    return {
      success: true,
      user: createdUser,
      welcomeEmailSent,
      stripeCustomerCreated,
    };
  }

  try {
    const headersList = await headers();
    const eventId = formData?.get("eventId") as string | null;
    const userAgent = headersList.get("user-agent") || undefined;
    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : headersList.get("x-real-ip") || undefined;

    const cookieHeader = headersList.get("cookie");
    let fbc: string | undefined;
    let fbp: string | undefined;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );
      fbc = cookies._fbc;
      fbp = cookies._fbp;
    }

    const firstName =
      profile?.given_name || createdUser.name?.split(" ")[0];
    const lastName =
      profile?.family_name || createdUser.name?.split(" ").slice(1).join(" ");

    await trackCompleteRegistration({
      email: createdUser.email,
      firstName,
      lastName,
      status: "completed",
      eventSourceUrl:
        getAppUrl() + (source === "oauth_google" ? "/sign-in" : "/sign-up"),
      eventId: eventId || undefined,
      clientIpAddress: clientIp,
      clientUserAgent: userAgent,
      fbc,
      fbp,
    });
  } catch (metaError) {
    console.error("[Onboarding] Error tracking Meta conversion:", metaError);
  }

  return {
    success: true,
    user: createdUser,
    welcomeEmailSent,
    stripeCustomerCreated,
  };
}
