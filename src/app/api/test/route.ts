import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function GET() {
  try {
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: 'Respond with "OpenAI API is working correctly" if you can read this message.',
    })

    return Response.json({
      success: true,
      message: text,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage)
    return Response.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}

