
import { NextResponse } from 'next/server';
import { cueWord } from '../cueWord';
import ky from 'ky';

export async function POST(request: Request) {
  const { api_key, model, params, name } = await request.json();

  if (!api_key || !model || !name) {
    return NextResponse.json({ error: '参数不正确' }, { status: 400 });
  }

  const myHeaders = {
    "Accept": "application/json",
    "Authorization": `Bearer ${api_key}`,
    "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    "Content-Type": "application/json"
  };

  const fetchUrl = `${process.env.NEXT_PUBLIC_AI_FETCH_URL}/chat/completions`

  if (name === 'generate content') {
    const messages = cueWord[name]({ ...params });
    const raw = JSON.stringify({ model, messages });
    try {
      const response = await ky(fetchUrl, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        timeout: false,
      });
      if (response.ok) {
        const res = await response.text()
        const temp = JSON.parse(res);
        console.log('========temp', temp);
        console.log('temp?.choices[0]?.message?.content', temp?.choices[0]?.message?.content);

        if (temp?.choices[0]?.message?.content) {
          const output = temp.choices[0].message.content;
          const continueMessages = [...messages, { role: "assistant", content: output }].concat(cueWord[`${name}2`]({ ...params }));
          const continueResponse = await fetch(fetchUrl, {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ model, messages: continueMessages }),
          });
          if (continueResponse.ok) {
            const continueRes = await continueResponse.text()
            const continueData = JSON.parse(continueRes);
            return NextResponse.json({ message: 'success', data: continueData });
          } else {
            const resJson: any = await response.json();
            return NextResponse.json({ ...resJson }, { status: 400 });
          }
        }
        return NextResponse.json({ message: 'success', data: [] });
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
  } else {
    const messages = cueWord[name]({ ...params });
    const raw = JSON.stringify({ model, messages });
    try {
      const response = await ky(fetchUrl, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        timeout: false,
      });
      if (response.ok) {
        console.log('========response', response);
        const res = await response.text()
        console.log('========res', res);

        const data = JSON.parse(res);
        return NextResponse.json({ message: 'success', data });
      } else {
        const resJson: any = await response.json();
        return NextResponse.json({ ...resJson }, { status: 400 });
      }
    } catch (error: any) {
      // return NextResponse.json({ error, err_code: 400 }, { status: 400 });
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
}
