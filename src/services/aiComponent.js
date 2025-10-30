// AI 组件封装（浏览器端），集成 aiService 浏览器适配器，提供加载状态回调、超时、重试等配置
// 用法：
// window.aiComponent.generate({ description, apiKey, model, onLoading, onRetry, onError })

export async function generate({
  description,
  apiKey,
  model = 'qwen-max',
  baseUrl,
  timeoutMs = 30000,
  retries = 2,
  retryDelayMs = 800,
  onLoading, // (isLoading: boolean) => void
  onRetry, // (attempt:number, error?) => void
  onError // (errorMessage) => void
}) {
  if (!description || !description.trim()) {
    const msg = '描述不能为空';
    if (onError) onError(msg);
    throw new Error(msg);
  }

  if (onLoading) onLoading(true);

  try {
    // aiServiceClient 已在 window 上由 aiService.browser.js 注入
    if (
      !window.aiServiceClient ||
      typeof window.aiServiceClient.generateMermaidCode !== 'function'
    ) {
      const msg = 'AI 服务未加载';
      if (onError) onError(msg);
      throw new Error(msg);
    }

    // 将 onStatus 转换为更细粒度的回调
    const onStatus = (status, info) => {
      if (status === 'retry' && onRetry) onRetry(info.attempt, info);
      if (status === 'error' && onError) onError(info.error);
      // 'loading' and 'done' handled externally
    };

    const result = await window.aiServiceClient.generateMermaidCode({
      apiKey,
      baseUrl,
      description,
      model,
      onStatus,
      retries,
      retryDelayMs,
      timeoutMs
    });

    if (onLoading) onLoading(false);
    return result;
  } catch (err) {
    if (onLoading) onLoading(false);
    const message = err?.message ?? String(err);
    if (onError) onError(message);
    throw err;
  }
}

// 挂载到 window 方便旧代码/测试页面使用
if (typeof window !== 'undefined') {
  window.aiComponent = {
    generate: (opts) => generate(opts)
  };
}
