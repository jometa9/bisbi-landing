import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { getAppSettings } from "@/lib/db/queries";

function loadDocsMdContent(): string {
  try {
    const filePath = path.join(process.cwd(), "public", "docs.md");
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8").trim();
    }
  } catch {
  }
  return "";
}

export async function sendMessageToAssistant(message: string): Promise<string> {
  try {
    const settings = await getAppSettings();
    const apiKey = settings.openaiApiKey?.trim() || "";
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is not set. Configure it in Admin → Settings."
      );
    }
    const client = new OpenAI({ apiKey });
    const model = settings.openaiModel?.trim() || "gpt-4o";

    const docsMd = loadDocsMdContent();
    const instructions = docsMd
      ? `You are a helpful assistant for IPTRADE.\n\n---\n[Use ONLY the following documentation to answer. Do not make up information that is not in the document. Do not attribute rules or limitations to the documentation unless they are explicitly written in it. If you do not have the information, say so. Always respond in English unless the user writes in another language; in that case, respond in the user's language.]\n\n${docsMd}`
      : "You are a helpful assistant for IPTRADE. Always respond in English unless the user writes in another language; in that case, respond in the user's language.";

    const response = await client.responses.create({
      model,
      instructions,
      input: message,
      store: false,
    });

    if (response.output_text) {
      return response.output_text;
    }

    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text" && content.text) {
              return content.text;
            }
          }
        }
      }
    }

    throw new Error("Invalid response format from assistant");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Assistant error:", error.message);
      throw new Error(`Assistant error: ${error.message}`);
    }

    throw new Error("Failed to get response from assistant");
  }
}
