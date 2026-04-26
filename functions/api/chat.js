// functions/api/chat.js
// Cloudflare Pages Function - 只处理 POST 请求

export async function onRequestPost({ request }) {
  // 你的 NVIDIA API 密钥（直接写在这里）
  const NVIDIA_API_KEY = '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';

  try {
    // 拿到前端发来的请求体
    const body = await request.text();

    // 转发给 NVIDIA API
    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body,
    });

    // 直接把 NVIDIA 的流式响应原样返回给前端
    return new Response(nvidiaResponse.body, {
      status: nvidiaResponse.status,
      headers: {
        'Content-Type': nvidiaResponse.headers.get('content-type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // 虽然同源，但加上 CORS 头也没坏处
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