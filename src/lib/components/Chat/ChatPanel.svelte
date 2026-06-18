<script lang="ts">
  import { Button } from '$/components/ui/button';
  import {
    buildDiagramAssistantSystemPrompt,
    diagramAssistantTools,
    streamLocalChatCompletion,
    type LocalAIMessage,
    type ToolCall,
    type ToolCallDelta
  } from '$/util/localAI';
  import { parse } from '$/util/mermaid';
  import { updateCode, updateCodeStore, updateConfig, validatedState } from '$/util/state.svelte';
  import { tick } from 'svelte';
  import BotIcon from '~icons/material-symbols/smart-toy-outline-rounded';
  import CheckIcon from '~icons/material-symbols/check-rounded';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import DockIcon from '~icons/material-symbols/right-panel-open-rounded';
  import LoaderIcon from '~icons/material-symbols/hourglass-empty-rounded';
  import PopOutIcon from '~icons/material-symbols/open-in-new-rounded';
  import SendIcon from '~icons/material-symbols/send-rounded';
  import TrashIcon from '~icons/material-symbols/delete-outline-rounded';
  import UserIcon from '~icons/material-symbols/person-outline-rounded';

  interface RepairRequest {
    id: number;
    code: string;
    error: string;
  }

  interface Props {
    mode: 'floating' | 'pane';
    onClose?: () => void;
    onDock?: () => void;
    onUndock?: () => void;
    repairRequest?: RepairRequest;
  }

  interface ProposedToolChange {
    kind: 'config' | 'diagram';
    value: string;
  }

  interface ChatMessage extends LocalAIMessage {
    apiContent?: string;
    displayContent?: string;
    proposal?: ProposedToolChange;
    status?: 'accepted' | 'pending' | 'rejected' | 'invalid';
    validationError?: string;
  }

  let { mode, onClose, onDock, onUndock, repairRequest }: Props = $props();

  let messages = $state<ChatMessage[]>([]);
  let input = $state('');
  let isLoading = $state(false);
  let chatContainer = $state<HTMLDivElement>();
  let lastRepairRequestId = $state(0);

  const storageKey = 'mermaid-local-ai-chat-history';

  const scrollToBottom = async () => {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const commitMessages = (nextMessages = messages) => {
    messages = [...nextMessages];
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  $effect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        messages = JSON.parse(saved) as ChatMessage[];
        void scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load local AI chat history', error);
    }
  });

  $effect(() => {
    if (!repairRequest || repairRequest.id === lastRepairRequestId) return;

    lastRepairRequestId = repairRequest.id;
    const repairPrompt = `Repair this Mermaid syntax error. Return the full corrected diagram using the updateDiagram tool. If tool calls are unavailable, include the full corrected diagram in a fenced \`\`\`mermaid code block. Do not respond with only an explanation.

Syntax error:
${repairRequest.error}

Current diagram:
\`\`\`mermaid
${repairRequest.code}
\`\`\``;

    void submitMessage(repairPrompt);
  });

  const toApiMessages = (chatMessages: ChatMessage[]): LocalAIMessage[] => {
    const { code, mermaid } = validatedState.current;
    return [
      {
        role: 'system',
        content: buildDiagramAssistantSystemPrompt(code, mermaid)
      },
      ...chatMessages.map(({ apiContent, content, role, tool_calls }) => ({
        content: apiContent ?? content,
        role,
        tool_calls
      }))
    ];
  };

  const shouldRequireProposal = (content: string) =>
    /\b(add|append|insert|remove|delete|rename|modify|update|change|fix|repair|replace|move)\b/i.test(
      content
    ) && !content.trim().endsWith('?');

  const buildUserMessageContent = (content: string) => {
    if (!shouldRequireProposal(content)) return content;

    return `${content}

This is an edit request. Return a full updated Mermaid diagram using the updateDiagram tool. If tool calls are unavailable, include the full updated Mermaid diagram in a fenced \`\`\`mermaid code block. Do not respond with only an explanation.`;
  };

  const mergeToolCallDelta = (toolCalls: ToolCall[], delta: ToolCallDelta): ToolCall[] => {
    const index = delta.index ?? 0;
    const next = [...toolCalls];
    const existing = next[index] ?? {
      id: delta.id ?? `local-tool-call-${index}`,
      type: 'function',
      function: {
        name: '',
        arguments: ''
      }
    };

    next[index] = {
      id: delta.id ?? existing.id,
      type: 'function',
      function: {
        name: delta.function?.name ?? existing.function.name,
        arguments: `${existing.function.arguments}${delta.function?.arguments ?? ''}`
      }
    };

    return next;
  };

  const extractMermaidCodeBlock = (content: string) => {
    const mermaidMatch = /```(?:mermaid|mmd)\s*\n([\s\S]*?)```/i.exec(content);
    if (mermaidMatch?.[1]) return mermaidMatch[1].trim();

    const genericMatch = /```\s*\n([\s\S]*?)```/.exec(content);
    return genericMatch?.[1]?.trim();
  };

  const extractRawMermaidDocument = (content: string) => {
    const trimmed = content.trim();
    if (
      /^(architecture-beta|block-beta|classDiagram|erDiagram|flowchart|gantt|gitGraph|graph|journey|mindmap|pie|quadrantChart|requirementDiagram|sequenceDiagram|stateDiagram(?:-v2)?|timeline|xychart-beta)\b/i.test(
        trimmed
      )
    ) {
      return trimmed;
    }
  };

  const extractReplacementProposal = async (content: string) => {
    const replacementMatch =
      /(?:corrected|changed|replaced|fixed)(?:\s+the)?(?:\s+typo)?\s+`([^`]+)`\s+(?:to|with)\s+`([^`]+)`/i.exec(
        content
      );
    if (!replacementMatch?.[1] || !replacementMatch[2]) return;

    const proposedCode = validatedState.current.code
      .split(replacementMatch[1])
      .join(replacementMatch[2]);
    if (proposedCode === validatedState.current.code) return;

    await parse(proposedCode);
    return proposedCode;
  };

  const validateProposal = async (messageIndex: number, proposalRequired = false) => {
    const message = messages[messageIndex];
    const toolCall = message.tool_calls?.[0];

    try {
      if (!toolCall) {
        const code =
          extractMermaidCodeBlock(message.content) ?? extractRawMermaidDocument(message.content);
        if (code) {
          await parse(code);
          messages[messageIndex] = {
            ...message,
            proposal: { kind: 'diagram', value: code },
            status: 'pending',
            validationError: undefined
          };
          commitMessages();
          return true;
        }

        const replacementCode = await extractReplacementProposal(message.content);
        if (!replacementCode) {
          if (proposalRequired) {
            throw new Error(
              'The local AI response did not include an updateDiagram tool call or a Mermaid code block.'
            );
          }
          return false;
        }

        messages[messageIndex] = {
          ...message,
          proposal: { kind: 'diagram', value: replacementCode },
          status: 'pending',
          validationError: undefined
        };
        commitMessages();
        return true;
      }

      const args = JSON.parse(toolCall.function.arguments) as { code?: string; config?: string };
      if (toolCall.function.name === 'updateDiagram' && typeof args.code === 'string') {
        await parse(args.code);
        messages[messageIndex] = {
          ...message,
          proposal: { kind: 'diagram', value: args.code },
          status: 'pending',
          validationError: undefined
        };
      } else if (toolCall.function.name === 'updateConfig' && typeof args.config === 'string') {
        JSON.parse(args.config);
        messages[messageIndex] = {
          ...message,
          proposal: { kind: 'config', value: args.config },
          status: 'pending',
          validationError: undefined
        };
      } else {
        throw new Error(`Unsupported local AI tool call: ${toolCall.function.name}`);
      }
    } catch (error) {
      messages[messageIndex] = {
        ...message,
        status: 'invalid',
        validationError: error instanceof Error ? error.message : 'Proposal validation failed.'
      };
      commitMessages();
      return false;
    }

    commitMessages();
    return true;
  };

  const streamAssistantResponse = async (
    apiMessages: LocalAIMessage[],
    assistantIndex: number,
    tools: object[] = [...diagramAssistantTools],
    prefix = ''
  ) => {
    if (prefix) {
      const assistantMessage = messages[assistantIndex];
      messages[assistantIndex] = {
        ...assistantMessage,
        content: `${assistantMessage.content}${prefix}`,
        status: undefined,
        validationError: undefined
      };
      commitMessages();
      await scrollToBottom();
    }

    for await (const delta of streamLocalChatCompletion({
      messages: apiMessages,
      tools
    })) {
      const assistantMessage = messages[assistantIndex];
      messages[assistantIndex] = {
        ...assistantMessage,
        content: `${assistantMessage.content}${delta.content ?? ''}`,
        tool_calls: delta.toolCalls?.reduce(
          (toolCalls, toolCallDelta) => mergeToolCallDelta(toolCalls, toolCallDelta),
          assistantMessage.tool_calls ?? []
        )
      };
      commitMessages();
      void scrollToBottom();
    }
  };

  const retryMissingProposal = async (content: string, assistantIndex: number) => {
    const { code, mermaid } = validatedState.current;
    const retryMessages: LocalAIMessage[] = [
      {
        role: 'system',
        content: `You are a Mermaid code transformation engine.
Output only one complete updated Mermaid diagram.
Prefer a fenced \`\`\`mermaid code block.
Do not explain, summarize, apologize, or describe what changed.
The output must be directly parseable as Mermaid after removing fences.

Current Mermaid diagram:
\`\`\`mermaid
${code}
\`\`\`

Current Mermaid configuration:
\`\`\`json
${mermaid}
\`\`\``
      },
      {
        role: 'user',
        content: `Apply this edit to the current Mermaid diagram and return the full updated diagram only:
${content}`
      }
    ];

    messages[assistantIndex] = {
      ...messages[assistantIndex],
      content: '',
      status: undefined,
      tool_calls: undefined,
      validationError: undefined
    };
    commitMessages();

    await streamAssistantResponse(retryMessages, assistantIndex, []);
    return validateProposal(assistantIndex, true);
  };

  const submitMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    input = '';
    isLoading = true;
    const proposalRequired = shouldRequireProposal(content);
    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: 'user',
        content,
        apiContent: buildUserMessageContent(content),
        displayContent: content
      }
    ];
    const apiMessages = toApiMessages(nextMessages);
    commitMessages([...nextMessages, { role: 'assistant', content: '' }]);
    await scrollToBottom();

    const assistantIndex = messages.length - 1;

    try {
      await streamAssistantResponse(apiMessages, assistantIndex);

      const hasProposal = await validateProposal(assistantIndex, proposalRequired);
      if (!hasProposal && proposalRequired) {
        await retryMissingProposal(content, assistantIndex);
      }
    } catch (error) {
      const assistantMessage = messages[assistantIndex];
      messages[assistantIndex] = {
        ...assistantMessage,
        content: `${assistantMessage.content}\n\nLocal AI error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      };
      commitMessages();
    } finally {
      isLoading = false;
      void scrollToBottom();
    }
  };

  const sendMessage = () => {
    void submitMessage(input);
  };

  const acceptProposal = (index: number) => {
    const message = messages[index];
    if (!message.proposal || message.status !== 'pending') return;

    if (message.proposal.kind === 'config') {
      updateConfig(message.proposal.value);
    } else {
      if (validatedState.current.editorMode === 'config') {
        updateCodeStore({ editorMode: 'code' });
      }
      updateCode(message.proposal.value, { updateDiagram: true, resetPanZoom: true });
    }

    messages[index] = { ...message, status: 'accepted' };
    commitMessages();
  };

  const rejectProposal = (index: number) => {
    messages[index] = { ...messages[index], status: 'rejected' };
    commitMessages();
  };

  const clearChat = () => {
    messages = [];
    input = '';
    isLoading = false;
    localStorage.removeItem(storageKey);
  };
</script>

<div
  class={[
    'flex h-full flex-col overflow-hidden bg-background',
    mode === 'floating' && 'rounded-md border shadow-xl'
  ]}>
  <div class="flex items-center justify-between border-b bg-muted/40 p-2">
    <div class="flex items-center gap-2 text-sm font-medium">
      <BotIcon class="size-4" />
      <span>{mode === 'floating' ? 'Local AI Assistant' : 'Local AI Chat'}</span>
    </div>
    <div class="flex items-center gap-1">
      <Button variant="ghost" size="icon" class="size-7" onclick={clearChat} title="Clear chat">
        <TrashIcon class="size-4" />
      </Button>
      {#if mode === 'floating' && onDock}
        <Button variant="ghost" size="icon" class="size-7" onclick={onDock} title="Dock to side">
          <DockIcon class="size-4" />
        </Button>
      {/if}
      {#if mode === 'pane' && onUndock}
        <Button variant="ghost" size="icon" class="size-7" onclick={onUndock} title="Undock">
          <PopOutIcon class="size-4" />
        </Button>
      {/if}
      {#if onClose}
        <Button variant="ghost" size="icon" class="size-7" onclick={onClose} title="Close">
          <CloseIcon class="size-4" />
        </Button>
      {/if}
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-4" bind:this={chatContainer}>
    {#if messages.length === 0}
      <div
        class="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <BotIcon class="mb-3 size-10" />
        <p class="max-w-60 text-sm">Ask local AI to explain, edit, or repair this diagram.</p>
      </div>
    {/if}

    {#each messages as message, index (index)}
      <div
        class={['mb-4 flex flex-col gap-2', message.role === 'user' ? 'items-end' : 'items-start']}>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          {#if message.role === 'user'}
            <span>You</span>
            <UserIcon class="size-4" />
          {:else}
            <BotIcon class="size-4" />
            <span>Local AI</span>
          {/if}
        </div>

        {#if message.displayContent ?? message.content}
          <div
            class={[
              'max-w-[90%] whitespace-pre-wrap rounded-md p-3 text-sm',
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            ]}>
            {message.displayContent ?? message.content}
          </div>
        {/if}

        {#if message.proposal}
          <div class="flex w-full max-w-[90%] flex-col gap-2 rounded-md border bg-card p-3">
            <div class="flex items-center justify-between gap-2 border-b pb-2">
              <span class="text-xs font-semibold">
                Proposed {message.proposal.kind === 'config' ? 'config' : 'diagram'} change
              </span>
              {#if message.status === 'pending'}
                <span class="text-xs text-amber-600">Validation passed</span>
              {:else if message.status === 'accepted'}
                <span class="flex items-center gap-1 text-xs text-green-600">
                  <CheckIcon class="size-3" /> Accepted
                </span>
              {:else if message.status === 'rejected'}
                <span class="text-xs text-muted-foreground">Rejected</span>
              {/if}
            </div>
            <pre class="max-h-52 overflow-auto rounded bg-muted/60 p-2 text-xs">{message.proposal
                .value}</pre>
            {#if message.status === 'pending'}
              <div class="flex gap-2">
                <Button size="sm" class="flex-1" onclick={() => acceptProposal(index)}>
                  <CheckIcon class="size-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  class="flex-1"
                  onclick={() => rejectProposal(index)}>
                  <CloseIcon class="size-4" />
                  Reject
                </Button>
              </div>
            {/if}
          </div>
        {:else if message.status === 'invalid'}
          <div
            class="max-w-[90%] rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            Proposal validation failed: {message.validationError}
          </div>
        {/if}
      </div>
    {/each}

    {#if isLoading}
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <LoaderIcon class="size-4 animate-spin" />
        <span>Local AI is responding</span>
      </div>
    {/if}
  </div>

  <div class="border-t p-3">
    <div class="relative">
      <textarea
        bind:value={input}
        class="min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Ask local AI about this diagram"
        disabled={isLoading}
        onkeydown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}></textarea>
      <Button
        size="icon"
        class="absolute right-2 bottom-2"
        disabled={isLoading || !input.trim()}
        onclick={sendMessage}>
        {#if isLoading}
          <LoaderIcon class="size-4 animate-spin" />
        {:else}
          <SendIcon class="size-4" />
        {/if}
        <span class="sr-only">Send</span>
      </Button>
    </div>
  </div>
</div>
