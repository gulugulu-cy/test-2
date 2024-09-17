import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt: title, plan, written, next, api_key, model } = await req.json();
  const fetchUrl = process.env.NEXT_PUBLIC_AI_FETCH_URL
  const openai = new OpenAI({
    apiKey: api_key,
    baseURL: fetchUrl,
  });

  const prompt_2 = `You are an excellent writing assistant.
You will write a long-form article based on the original instruction and planned writing steps.
You will write the each sections in detail, and you must use the language as same as the writing instruction.
I will give the entire section plan and the text I have already written, you continue writing the next section based on these informations.
Make sure the content is consistent and fluent, reducing AI-generated sensations.
You can break down the section into some sub-sections, which helps you writing in detailed.
Output the result in Markdown format, use '##' for title and '###' for subtitle when you want to split the content.`+
    "Do not wrap the entire content in code block with '```' or '```text'." +

    `Writing instruction:<text>${title}</text>

Writing steps:<text>
${plan}
</text>

Already written text:<text>
${written}
</text>

Please integrate the original writing instruction, writing steps, and the already written text, and now continue writing:<section>
${next}
</section>

Output language must be same as the writing instruction.`

  try {
    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages: [{ role: "user", content: prompt_2 }],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    return NextResponse.json(error.error, { status: error.status });
  }
}
