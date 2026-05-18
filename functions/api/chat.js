// functions/api/chat.js
export async function onRequestPost({ request, env }) {
  const NVIDIA_API_KEY = env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) {
    return new Response(JSON.stringify({ error: '未配置 API 密钥' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body = await request.text();

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    });

    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader) {
      headers.set('Accept', acceptHeader);
    }

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body,
    });

    const responseHeaders = new Headers();
    nvidiaResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'no-cache');
    responseHeaders.set('Connection', 'keep-alive');

    return new Response(nvidiaResponse.body, {
      status: nvidiaResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器请求超时，请稍后重试' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}