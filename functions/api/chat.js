// functions/api/chat.js
export async function onRequestPost({ request, env }) {
  // 从环境变量安全读取密钥，不再暴露在代码中
  const NVIDIA_API_KEY = env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) {
    return new Response(JSON.stringify({ error: '服务配置错误：未设置 API 密钥' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body = await request.text();

    // 流式请求，超时时间设为 25 秒（可根据模型速度调整）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    // 如果流式请求成功，直接转发流
    if (nvidiaResponse.ok) {
      return new Response(nvidiaResponse.body, {
        status: nvidiaResponse.status,
        headers: {
          'Content-Type': nvidiaResponse.headers.get('content-type') || 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 流式请求失败时，自动降级为非流式请求（避免 504）
    const fallbackBody = JSON.stringify({ ...JSON.parse(body), stream: false });
    const fallbackResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: fallbackBody,
    });

    return new Response(fallbackResponse.body, {
      status: fallbackResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: '请求超时或服务繁忙，请稍后重试' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}