// 浏览器友好的 AI 服务适配器，给现有页面提供 window.aiServiceClient.generateMermaidCode
// 调用后端代理接口，返回解析后的 mermaid 代码字符串

export async function generateMermaidCode({
  description,
  apiKey,
  model,
  baseUrl,
  timeoutMs = 30000,
  retries = 2,
  retryDelayMs = 800,
  onStatus // optional callback(status: 'loading'|'retry'|'done'|'error', info?)
}) {
  if (!description || !description.trim) {
    throw new Error('描述不能为空');
  }

  const url = baseUrl || '/api/generate-chart';

  let lastErr = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    if (onStatus) onStatus(attempt === 1 ? 'loading' : 'retry', { attempt });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ description, apiKey, model })
      });

      clearTimeout(timer);

      if (!resp.ok) {
        let msg = `HTTP ${resp.status}`;
        try {
          const txt = await resp.text();
          if (txt) msg += ' ' + txt;
        } catch (readErr) {
          console.warn('Failed to read response text', readErr);
        }
        lastErr = new Error(msg);
        // 如果最后一次尝试则抛出
        if (attempt > retries) throw lastErr;
        await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
        continue;
      }

      const data = await resp.json();

      if (data.error) {
        lastErr = new Error(data.error || '后端返回错误');
        if (attempt > retries) throw lastErr;
        await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
        continue;
      }

      const code = data.code ?? data.mermaidCode ?? data.output ?? null;
      if (!code) {
        lastErr = new Error('未从后端获得有效的Mermaid代码');
        if (attempt > retries) throw lastErr;
        await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
        continue;
      }

      // 尝试剥离 ```mermaid ``` 包裹
      const fenced = /```mermaid\s*([\s\S]*?)```/i.exec(String(code));
      let result = null;
      if (fenced && fenced[1]) result = fenced[1].trim();
      else {
        const anyFenced = /```\s*([\s\S]*?)```/i.exec(String(code));
        if (anyFenced && anyFenced[1]) {
          const inner = anyFenced[1].trim();
          if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie)/i.test(inner))
            result = inner;
        }
      }

      if (!result) result = String(code).trim();

      if (onStatus) onStatus('done', { attempt, result });
      return result;
    } catch (err) {
      clearTimeout(timer);
      // 区分超时和其他错误
      if (err && err.name === 'AbortError') {
        lastErr = new Error(`请求超时（${timeoutMs}ms）`);
      } else {
        lastErr = err instanceof Error ? err : new Error(String(err));
      }

      if (attempt > retries) {
        if (onStatus) onStatus('error', { error: lastErr.message });
        throw lastErr;
      }

      // 等待一段时间后重试
      await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
    }
  }

  // 如果走到这里，抛出最后错误
  throw lastErr || new Error('未知错误');
}

// 将适配器挂载到 window，方便老代码使用
if (typeof window !== 'undefined') {
  window.aiServiceClient = {
    generateMermaidCode: (opts) => generateMermaidCode(opts)
  };
}
