import axios from 'axios';
import { NextResponse } from "next/server";
export async function POST(request: Request) {
    const { api_key, model, voice } = await request.json();

    if (!api_key || !model || !voice) {
        return NextResponse.json({ error: '参数不正确' }, { status: 400 });
    }

    var data = '<speak version=\'1.0\' xml:lang=\'en-US\'>\r\n    <voice xml:lang=\'en-US\' xml:gender=\'Male\' name=\'en-US-ChristopherNeural\'>\r\n        I\'m excited to try text to speech!\r\n    </voice>    \r\n</speak>';
    const config = {
        method: 'post',
        url: 'https://api.302.ai/cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer sk-sR7EAvkuSzqie5yBq6Qe7b9T7Q6P6sDHBWTdYDZBq5i3L5E3',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Content-Type': 'application/ssml+xml'
        },
        data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            return NextResponse.json({ data: response.data }, { status: 200 });
        })
        .catch(function (error) {
            console.log(error);
            return NextResponse.json({ error }, { status: 400 });

        });
}