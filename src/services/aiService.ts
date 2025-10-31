// 简洁、自包含的前端 AI 服务，用于从后端（或可配置的 API）获取 Mermaid 代码
// 设计目标：
// - 前端调用 generateMermaidCode({ description }) 即可获得 mermaid code 或错误信息
// - 默认调用后端代理 `/api/generate-chart`（更安全，不在浏览器暴露 API Key）

export interface GenerateRequest {
  description: string;
  chartType?: string;
  stylePreference?: string;
  apiKey?: string; // 可选：如果需要前端传递给后端（通常不推荐）
}

export interface GenerateResult {
  success: boolean;
  mermaidCode?: string;
  original?: string;
  fixed?: boolean;
  error?: string;
}

export interface AIServiceConfig {
  baseUrl?: string; // 默认为后端代理
  maxRetries?: number;
  retryDelayMs?: number;
}

export class AIService {
  private baseUrl: string;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(config?: AIServiceConfig) {
    this.baseUrl = config?.baseUrl || '/api/generate-chart';
    this.maxRetries = config?.maxRetries ?? 3;
    this.retryDelayMs = config?.retryDelayMs ?? 800; // 基础重试间隔
  }

  /**
   * 接收前端的自然语言描述，返回 Mermaid 代码
   */
  // 完整的修复示例
  async generateMermaidCode(req: GenerateRequest): Promise<GenerateResult> {
    const description = req.description?.trim?.();
    if (!description) {
      return { success: false, error: '描述不能为空' };
    }

    if (description.length > 5000) {
      return { success: false, error: '描述长度过长' };
    }

    let lastErr: unknown = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const body: Record<string, unknown> = { description };
        if (req.chartType) body.chartType = req.chartType;
        if (req.stylePreference) body.stylePreference = req.stylePreference;
        if (req.apiKey) body.apiKey = req.apiKey;

        const resp = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`HTTP ${resp.status} ${text}`);
        }

        const data = (await resp.json()) as Record<string, unknown>;

        if (data && typeof data === 'object') {
          const code =
            data['code'] ?? data['mermaidCode'] ?? data['codeText'] ?? data['output'] ?? null;

          if (!code) {
            const errMsg = data.error || data.message || '未从后端获得 mermaid 代码';
            return { success: false, error: String(errMsg) };
          }

          const cleaned = AIService.extractMermaidCode(String(code)) || String(code);

          return {
            success: true,
            mermaidCode: cleaned,
            original: data.original ? String(data.original) : '', // 使用空字符串作为默认值
            fixed: Boolean(data.fixed) // 强制转换为 boolean
          };
        } else {
          return { success: false, error: '数据格式不正确' };
        }
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          await AIService.delay(this.retryDelayMs * attempt);
        }
      }
    }

    const message = lastErr instanceof Error ? lastErr.message : String(lastErr ?? '未知错误');
    return { success: false, error: `生成失败: ${message}` };
  }

  /**
   * 从可能包含 ```mermaid``` 包裹或直接的响应中提取纯 mermaid 代码
   */
  static extractMermaidCode(content: string): string | null {
    if (!content) return null;

    // 尝试匹配 ```mermaid ... ``` 或 ``` ... ```
    const fencedMermaid = /```mermaid\s*([\s\S]*?)```/i.exec(content);
    if (fencedMermaid && fencedMermaid[1]) return fencedMermaid[1].trim();

    const fencedAny = /```\s*([\s\S]*?)```/i.exec(content);
    if (fencedAny && fencedAny[1]) {
      const inner = fencedAny[1].trim();
      // 如果内文看起来像 mermaid，就返回
      if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie)/i.test(inner)) {
        return inner;
      }
    }

    // 直接以mermaid关键词开头的情况
    const trimmed = content.trim();
    if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie)/i.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  static delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}

// 默认导出一个单例，前端可用 initAIService 改写配置
let _instance: AIService | null = new AIService();

export const initAIService = (config?: AIServiceConfig) => {
  _instance = new AIService(config);
  return _instance;
};

export const getAIService = () => {
  if (!_instance) _instance = new AIService();
  return _instance;
};

export default getAIService();
