// functions/api/chat.js
export async function onRequestPost({ request }) {
  // 换成你新的 NVIDIA API 密钥
  const NVIDIA_API_KEY = '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';

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
    return new Response(JSON.stringify({ error: '代理请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}