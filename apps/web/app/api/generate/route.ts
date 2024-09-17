import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { match } from "ts-pattern";
import { NextResponse } from 'next/server';

// Create an OpenAI API client (that's edge friendly!)

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const { prompt, type, language, command, api_key, model } = await req.json();
  // const fetchUrl = `https://api.302.ai/v1`;
  // const fetchUrl = `https://test-api.gpt302.com/v1`;
  const fetchUrl = process.env.NEXT_PUBLIC_AI_FETCH_URL

  const openai = new OpenAI({
    apiKey: api_key,
    baseURL: fetchUrl,
  });

  const messages = match(type)
    // 总结
    .with("summary", () => [
      {
        role: "user",
        content: `You are a helpful assistant which can help me to summarize content.
You should detect language of the input content before your action, the result language must same as the input content.
You must summrize the content into a short, concise sentence.
You must output the result directly, do not add explanations and notes.

Following is the input content:"""
${prompt}
"""`
      },
    ])
    // 续写
    .with("continued writing", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in content continuation.
You can continue the sentence which user provided, generate a high quality result in your own words.
Ensure that the content flows naturally and avoids an AI-generated feel.
You must return the result in plain text, the result language must same as the input content.
Before your task, you should detect the language of the input content.
Return the result directly, never add explanations and notes.

Following is the input content:"""
${prompt}
"""`
      },
    ])
    // 改写
    .with("rewrite", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in rewrite content.
You can rewrite the content to a high quality and professional version.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

Following is the input content:"""
${prompt}
"""`,
      },
    ])
    // 缩写
    .with("abbreviation", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in content reduction.
You can shorten the long content into a minimalist and concise one with your own words, make sure that is the best version.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

Following is the input content:"""
${prompt}
"""`
      },
    ])
    // 扩写
    .with("expand written article", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in expanding content.
You can expand a short content to a longer, detailed version in your own words.
Ensure that the content flows naturally and avoids an AI-generated feel.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

Following is the input content:"""
${prompt}
"""`
      }
    ])
    // 翻译
    .with("translate", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in translate content into any languages fluently.
You must return the best quality version, ensure that the content flows naturally and avoids an AI-generated feel.
Before your action, you should detect language of the input content.
The target language is ${language}.
If the content's language same as the target language, you should return the original content directly.
You must keep the markdown format as same as the original content.
Return the result directly, never add explantions, greetings and notes.

Following is the input content you need to translate:"""
${prompt}
"""`
      },
    ])
    // 自由改写
    .with("free rewriting", () => [
      {
        role: "user",
        content: `You are a helpful assistant which can help me to modify my text.
Before your action, you should detect language of the input content.
If i do not specific the target language, the result language must same as the input content.
You must output the result directly, do not add explanations and notes.
I will give you a modification request, you must follow it and modify the text in your own words.

Following is the input content:"""
${prompt}
"""

My modification request is: ${command}.
`
      },
    ])
    // 生成标题
    .with("generate title", () => [
      {
        role: "user",
        content: `You are a helpful assistant which can generate a high quality title for a article.
Before your action, you should detect the language of the input content.
Then generate a title for this content into the language detected, the title should be professional and concise.
Return the plain text result directly, do not add explanations and notes.

----- Following is the input content -----
${prompt}
----- Above is the input content -----
`
      },
    ])
    .run() as ChatCompletionMessageParam[];

  try {
    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log('================error', error);
    // return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
    return NextResponse.json(error.error, { status: error.status });
    // return error.=
  }
}
