import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TEXT_CHARS = 6000;

export async function POST(request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return Response.json(
        { error: "Please enter something you'd like help wording." },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_CHARS) {
      return Response.json(
        {
          error:
            "Your message is a little too long. Please shorten it to 6,000 characters or fewer.",
        },
        { status: 413 }
      );
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      instructions: `
You are the wording assistant for HIISSA RELATIONSHIP AI.

Your ONLY job is to help the user express what they have already written more clearly.

Rewrite the user's text so it is clear, natural, grammatically correct, and easy to understand while preserving the user's intended meaning.

STRICT RULES:
- Preserve the user's facts.
- Preserve the user's emotional meaning and level of certainty.
- Do not invent details.
- Do not add assumptions.
- Do not intensify or minimise the user's feelings.
- Do not diagnose or label anyone.
- Do not interpret another person's motives.
- Do not give relationship advice.
- Do not answer the user's question.
- Do not turn uncertainty into certainty.
- Do not remove important context.
- Keep names, relationship roles, dates, and other details as the user provided them.
- Correct spelling, punctuation, grammar, and obvious word-choice mistakes when the intended word is clear from context.
- Keep the user's natural voice rather than making the wording overly formal.
- If the original wording is already clear, make only minimal improvements.
- Return ONLY the rewritten wording.
- Do not add quotation marks, headings, explanations, commentary, or introductory text.
      `.trim(),
      input: text,
      max_output_tokens: 800,
    });

    const rewritten = response.output_text?.trim();

    if (!rewritten) {
      throw new Error("No rewritten text returned");
    }

    return Response.json({ rewritten });
  } catch (error) {
    console.error("HIISSA wording route error:", error);

    return Response.json(
      {
        error:
          "HIISSA couldn't help with the wording right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
