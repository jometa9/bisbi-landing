"use server";

import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { sendBroadcastEmail } from "@/lib/email";
import { and, isNull, ne } from "drizzle-orm";
import { user as userSchema } from "./schema";

export async function sendBroadcastEmailAction(
  data: FormData | null | undefined
) {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return {
      error: "Unauthorized - only admins can send broadcast emails",
    };
  }

  if (!data || !(data instanceof FormData)) {
    return {
      error: "No data provided",
    };
  }

  const subject = data.get("subject")?.toString();
  const message = data.get("message")?.toString();
  const ctaLabel = data.get("ctaLabel")?.toString();
  const ctaUrl = data.get("ctaUrl")?.toString();
  const isImportant = data.get("isImportant") === "true";

  if (!subject || subject.trim() === "") {
    return {
      error: "El asunto es obligatorio",
    };
  }

  if (!message || message.trim() === "") {
    return {
      error: "El mensaje es obligatorio",
    };
  }

  if (ctaLabel && (!ctaUrl || !ctaUrl.startsWith("http"))) {
    return {
      error: "Si se proporciona una etiqueta CTA, la URL debe ser válida",
    };
  }

  try {
    const activeUsers = await db
      .select()
      .from(userSchema)
      .where(and(
        ne(userSchema.email, ""),
        isNull(userSchema.deletedAt)
      ));

    if (activeUsers.length === 0) {
      return {
        error: "No se encontraron usuarios activos para enviar el mensaje",
      };
    }

    const batchSize = 5;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize);

      const emailPromises = batch.map((recipient) =>
        sendBroadcastEmail({
          email: recipient.email,
          name: recipient.name || recipient.email.split("@")[0],
          subject: subject,
          message: message,
          isImportant: isImportant,
        })
          .then(() => {
            successCount++;
            return true;
          })
          .catch(() => {
            failureCount++;
            return false;
          })
      );

      await Promise.all(emailPromises);

      if (i + batchSize < activeUsers.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return {
      success: `Email enviado con éxito a ${successCount} usuarios (${failureCount} fallidos)`,
    };
  } catch (error) {
    console.error("Error sending broadcast email:", error);
    return {
      error: "Ocurrió un error al enviar los emails",
    };
  }
}
