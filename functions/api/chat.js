// functions/api/chat.js
export async function onRequestPost({ request }) {
  // 你的新 NVIDIA API 密钥
  const NVIDIA_API_KEY = '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';

  try {
    const body = await request.text();

    // 增加超时控制，防止 Cloudflare 524 超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒后中断

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

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
    return new Response(JSON.stringify({ error: '请求超时或服务繁忙，请稍后重试' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}