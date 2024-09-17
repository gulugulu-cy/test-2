
import { NextResponse } from 'next/server';
import { cueWord } from '../cueWord';
import ky from 'ky';

export async function POST(request: Request) {
  const { api_key, model, name, params } = await request.json();

  if (!api_key || !model || !name) {
    return NextResponse.json({ error: '参数不正确' }, { status: 400 });
  }

  const myHeaders = {
    "Accept": "application/json",
    "Authorization": `Bearer ${api_key}`,
    "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    "Content-Type": "application/json"
  };

  const messages = cueWord[name]({ ...params });
  let raw = JSON.stringify({ model, messages, stream: true });
  // const fetchUrl = `https://test-api.gpt302.com/v1/chat/completions`;
  // const fetchUrl = `https://api.302.ai/v1/chat/completions`;
  const fetchUrl = `${process.env.NEXT_PUBLIC_AI_FETCH_URL}/chat/completions`

  if (name === 'generate content') {
    try {
      const response = await ky(fetchUrl, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ model, messages }),
        timeout: false,
      });
      if (response.ok) {
        const res = await response.text()
        const temp = JSON.parse(res);
        if (temp?.choices[0]?.message?.content) {
          const output = temp.choices[0].message.content;
          const continueMessages = [...messages, { role: "assistant", content: output }].concat(cueWord[`${name}2`]({ ...params }));
          raw = JSON.stringify({ model, messages: continueMessages, stream: true })
        }
        // return NextResponse.json({ message: 'success', data: [] });
      } else {
        const resJson: any = await response.json();
        return NextResponse.json({ ...resJson }, { status: 400 });
      }
    } catch (error: any) {
      // return NextResponse.json({ error, err_code: 500 }, { status: 500 });
      if (error.response) {
        // 尝试从响应中解析错误信息
        try {
          const errorData = await error.response.json();
          // console.log('==========errorData', errorData);
          return NextResponse.json({ ...errorData }, { status: error.response.status });
        } catch (parseError) {
          console.log('Error parsing JSON from response:', parseError);
          return NextResponse.json({ message: 'Failed to parse error response' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
      }
    }
  }
  // console.log('========', raw);

  try {
    const response = await ky(fetchUrl, {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      timeout: false
    });
    console.log('=======response=========', response);

    if (response.ok && response.body !== null) {
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const reader: any = response?.body?.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const strChunk = decoder.decode(value, { stream: true });
              if (strChunk && strChunk.length > 1) {
                const arr = strChunk.split('data: ');
                for (let index = 1; index < arr.length; index++) {
                  const jsonString = arr[index];
                  if (isValidJSONObject(jsonString)) {
                    const parsedChunk = JSON.parse(jsonString);
                    if (parsedChunk.choices[0]) {
                      const delta = parsedChunk.choices[0].delta;
                      if (delta && Object.keys(delta).length > 0) {
                        controller.enqueue(`data: ${JSON.stringify(delta)}\n\n`);
                      } else {
                        controller.enqueue(`data: ${JSON.stringify({ stop: parsedChunk.choices[0].finish_reason })}\n\n`);
                      }
                    }
                  }
                }
              }
            }

            controller.close();
          } catch (error) {
            console.log('=============error', error);
            controller.error(error);
          }
        }
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      const resJson: any = await response.json();
      console.log('==========resJson', resJson);

      return NextResponse.json({ ...resJson }, { status: 400 });
    }
  } catch (error: any) {
    // console.log('================error', { ...error });

    // return NextResponse.json({ error }, { status: 400 });
    if (error.response) {
      // 尝试从响应中解析错误信息
      try {
        const errorData = await error.response.json();
        // console.log('==========errorData', errorData);
        return NextResponse.json({ ...errorData }, { status: error.response.status });
      } catch (parseError) {
        console.log('Error parsing JSON from response:', parseError);
        return NextResponse.json({ message: 'Failed to parse error response' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
    }
  }
}


// 判断字符串是否是一个合法的 JSON 对象
function isValidJSONObject(str: string) {
  if (typeof str !== 'string' || str.trim() === '') {
    return false;
  }
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch (e) {
    return false;
  }
}