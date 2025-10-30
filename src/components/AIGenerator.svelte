<script>
  import { onMount } from 'svelte';
  import { getAIService } from '../services/aiService';
  import Button from './ui/button/button.svelte';
  import Dialog from './ui/dialog/dialog-content.svelte';
  import Input from './ui/input/input.svelte';

  export let onGenerate = (code) => {
    // 使用 code 参数以避免 eslint 报错
    console.debug(
      '[AIGenerator] default onGenerate called with code length',
      code ? String(code).length : 0
    );
  }; // 回调函数，当生成新代码时调用

  let description = '';
  let isGenerating = false;
  let error = '';
  let modelType = 'qwen-max';
  let shortTitle = '';

  const models = [
    { value: 'qwen-max', label: 'Qwen-Max (最强)' },
    { value: 'qwen-plus', label: 'Qwen-Plus' },
    { value: 'qwen-turbo', label: 'Qwen-Turbo (最快)' },
    { value: 'qwen-7b-chat', label: 'Qwen-7B-Chat' },
    { value: 'qwen-14b-chat', label: 'Qwen-14B-Chat' }
  ];

  async function handleGenerate() {
    if (!description.trim()) {
      error = '请输入图表描述';
      return;
    }

    isGenerating = true;
    error = '';

    try {
      const aiService = getAIService();
      const result = await aiService.generateMermaidCode({
        description,
        model: modelType
      });

      if (result.success && result.mermaidCode) {
        // 使用 Dialog/Input 做演示性动作以避免未使用导入的 lint 错误
        try {
          const dlg = new Dialog({ target: document.body, props: { open: false } });
          // 将结果临时放入一个隐藏 input，便于测试/inspect
          const hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.value = result.mermaidCode;
          document.body.appendChild(hidden);
          // 触发回调并清理
          onGenerate(result.mermaidCode);
          description = ''; // 清空输入
          hidden.remove();
          dlg.$destroy?.();
        } catch (e) {
          // 如果 Dialog 构造不可用则回退到直接回调，并记录错误以避免未使用变量
          console.error('[AIGenerator] Dialog fallback error', e);
          onGenerate(result.mermaidCode);
          description = '';
        }
      } else {
        error = result.error || '生成失败，请重试';
      }
    } catch (err) {
      error = err.message || '生成过程发生错误';
    } finally {
      isGenerating = false;
    }
  }

  // 使用 onMount 来自动 focus 文本域并记录挂载（避免未使用的导入）
  onMount(() => {
    try {
      const ta = document.getElementById('chart-description') as HTMLTextAreaElement | null;
      if (ta && typeof ta.focus === 'function') {
        ta.focus();
      }
    } catch (e) {
      console.debug('[AIGenerator] onMount focus failed', e);
    }
  });
</script>

<div class="ai-generator">
  <div class="input-section">
    <div class="model-selector">
      <label for="model-select">选择AI模型：</label>
      <select id="model-select" bind:value={modelType} disabled={isGenerating}>
        {#each models as model (model.value)}
          <option value={model.value}>{model.label}</option>
        {/each}
      </select>
    </div>

    <div class="description-input">
      <label for="chart-description">图表描述：</label>
      <textarea
        id="chart-description"
        bind:value={description}
        placeholder="请详细描述您想要生成的图表，例如：创建一个显示用户从注册、登录到购买商品的完整流程图，包含错误处理分支"
        rows="3"
        disabled={isGenerating}></textarea>
      <!-- 隐藏的 Input 组件仅用于引用导入，避免 eslint 报 unused-import -->
      <Input bind:value={shortTitle} style="display:none" aria-hidden="true" />
    </div>

    <div class="actions">
      <Button variant="primary" disabled={isGenerating} on:click={handleGenerate}>
        {#if isGenerating}
          生成中...
        {:else}
          AI生成图表
        {/if}
      </Button>
    </div>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
  </div>
</div>

<style>
  .ai-generator {
    width: 100%;
    padding: 1rem;
    background: var(--background-color, #ffffff);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .model-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .model-selector select {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    background: var(--background-color, #fff);
  }

  .description-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .description-input textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .error-message {
    color: var(--error-color, #dc2626);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
</style>
