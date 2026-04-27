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

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body,
    });

    return new Response(nvidiaResponse.body, {
      status: nvidiaResponse.status,
      headers: {
        'Content-Type': nvidiaResponse.headers.get('content-type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器请求超时，请稍后重试' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}