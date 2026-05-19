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
    const contentType = request.headers.get('Content-Type') || '';
    
    let body;
    let headers = new Headers({
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    });

    // 处理 multipart/form-data（包含图片）
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const messages = formData.get('messages');
      const model = formData.get('model');
      const temperature = formData.get('temperature');
      const top_p = formData.get('top_p');
      const max_tokens = formData.get('max_tokens');
      const chat_template_kwargs = formData.get('chat_template_kwargs');
      
      // 构建 NVIDIA API 请求
      const nvidiaBody = {
        model,
        messages: JSON.parse(messages),
        max_tokens: parseInt(max_tokens),
        temperature: parseFloat(temperature),
        top_p: parseFloat(top_p),
        stream: true
      };
      
      if (chat_template_kwargs && chat_template_kwargs !== 'undefined') {
        try {
          nvidiaBody.chat_template_kwargs = JSON.parse(chat_template_kwargs);
        } catch (e) {
          // ignore
        }
      }
      
      body = JSON.stringify(nvidiaBody);
      headers.set('Content-Type', 'application/json');
      
      const acceptHeader = request.headers.get('Accept');
      if (acceptHeader) {
        headers.set('Accept', acceptHeader);
      }
    } else {
      // 普通 JSON 请求
      body = await request.text();
      headers.set('Content-Type', 'application/json');
      
      const acceptHeader = request.headers.get('Accept');
      if (acceptHeader) {
        headers.set('Accept', acceptHeader);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 300000);

    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseHeaders = new Headers();
    nvidiaResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'no-cache');
    responseHeaders.set('Connection', 'keep-alive');
    responseHeaders.set('Transfer-Encoding', 'chunked');

    return new Response(nvidiaResponse.body, {
      status: nvidiaResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: '请求超时，请缩短问题或稍后重试' }), {
        status: 504,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    return new Response(JSON.stringify({ error: `服务器错误: ${error.message}` }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
