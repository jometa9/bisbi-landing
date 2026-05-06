import { sendMessageToAssistant } from "@/lib/openai/assistant";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = chatSchema.parse(body);

    const response = await sendMessageToAssistant(validatedData.message);

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
          fallback: true,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          fallback: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to get response from assistant",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
