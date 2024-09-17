import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt: title, content, selected, record, api_key, model } = await req.json();
  const fetchUrl = process.env.NEXT_PUBLIC_AI_FETCH_URL
  const openai = new OpenAI({ apiKey: api_key, baseURL: fetchUrl, });

  const prompt = `You are a helpful assistant which can help user in writing.

If user ask you to help them for about their article text, the following is it.

Title: <title>${title}</title>

Content: <content_text>
${content}
</content_text>

Selected Text: <selected_text>${selected}</selected_text>

You will reply in detail and be friendly and patient.

You always use the language as same as user sent.`
  try {
    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages: [{ role: "system", content: prompt }, ...record],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log('=============', error);

    return NextResponse.json(error.error, { status: error.status });
  }
}
