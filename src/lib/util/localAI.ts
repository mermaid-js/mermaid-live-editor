import { env } from './env';

export interface LocalAIMessage {
  role: 'assistant' | 'system' | 'user';
  content: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallDelta {
  index: number;
  id?: string;
  type?: 'function';
  function?: {
    name?: string;
    arguments?: string;
  };
}

interface StreamChatOptions {
  messages: LocalAIMessage[];
  tools?: object[];
}

interface StreamChatDelta {
  content?: string;
  toolCalls?: ToolCallDelta[];
}

const getCompletionsUrl = () => {
  const endpoint = env.llmApiEndpoint.replace(/\/$/, '');
  return `${endpoint}/chat/completions`;
};

export const diagramAssistantTools = [
  {
    type: 'function',
    function: {
      name: 'updateDiagram',
      description: 'Replace the current Mermaid diagram code with a full valid Mermaid document.',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'The full valid Mermaid diagram code to replace the current code.'
          }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'updateConfig',
      description: 'Replace the Mermaid configuration with a full valid JSON string.',
      parameters: {
        type: 'object',
        properties: {
          config: {
            type: 'string',
            description: 'The full valid JSON configuration string.'
          }
        },
        required: ['config']
      }
    }
  }
] as const;

export const buildDiagramAssistantSystemPrompt = (
  code: string,
  config: string
) => `You are an expert Mermaid diagram assistant.
Help the user create, edit, explain, and repair Mermaid diagrams.

Current Mermaid diagram:
\`\`\`mermaid
${code}
\`\`\`

Current Mermaid configuration:
\`\`\`json
${config}
\`\`\`

Rules:
1. When changing or repairing diagram code, call updateDiagram with the full corrected Mermaid document.
2. When changing configuration, call updateConfig with the full valid JSON configuration string.
3. Never place JSON configuration inside updateDiagram.
4. Never place Mermaid diagram code inside updateConfig.
5. For any request to add, remove, rename, modify, update, change, fix, repair, or otherwise edit the diagram, the app needs the complete updated code.
6. Never answer an edit or syntax repair request with only an explanation.
7. If tool calls are unavailable, include the full updated Mermaid document in a fenced \`\`\`mermaid code block.
8. Explain the change briefly in normal text and use the relevant tool call for the proposed change.
9. Do not auto-apply changes. The app will ask the user to review and apply them.`;

export async function* streamLocalChatCompletion({
  messages,
  tools
}: StreamChatOptions): AsyncGenerator<StreamChatDelta> {
  const body: {
    messages: LocalAIMessage[];
    model: string;
    stream: boolean;
    tools?: object[];
  } = {
    model: env.llmModel,
    messages,
    stream: true
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
  }

  const response = await fetch(getCompletionsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Local LLM request failed (${response.status} ${response.statusText}): ${details}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Local LLM did not return a streaming response.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      const parsed = JSON.parse(data) as {
        choices?: {
          delta?: {
            content?: string;
            tool_calls?: ToolCallDelta[];
          };
        }[];
      };
      const delta = parsed.choices?.[0]?.delta;
      if (!delta) continue;

      yield {
        content: delta.content,
        toolCalls: delta.tool_calls
      };
    }
  }
}
