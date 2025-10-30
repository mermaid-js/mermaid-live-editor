<script>
  import { getAIService } from '../../services/aiService';
  import Button from './ui/button/button.svelte';
  import { render as renderDiagram } from '$/util/mermaid';
  import uniqueID from 'lodash-es/uniqueId';
  import { updateCode, inputStateStore } from '$/util/state';
  import { get } from 'svelte/store';

  export let onGenerate = (code) => {
    // 默认回调：记录调用以避免空箭头函数的 ESLint 报错
    console.debug(
      '[AIGenerator] default onGenerate called, code length',
      code ? String(code).length : 0
    );
  }; // 回调函数，当生成新代码时调用

  let description = '';
  let isGenerating = false;
  let error = '';
  let modelType = 'qwen-max';
  let generatedCode = '';
  let previewContainer = null;

  function copyCode() {
    if (!generatedCode) return;
    try {
      navigator.clipboard.writeText(generatedCode);
    } catch (e) {
      console.error('复制失败', e);
    }
  }

  function insertToEditor() {
    if (!generatedCode) return;
    try {
      onGenerate(generatedCode);
    } catch (e) {
      console.error('插入编辑器失败', e);
    }
  }

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

      console.debug('[AIGenerator] AI service result', result);
      if (result.success && result.mermaidCode) {
        // 将生成的代码保存并渲染预览
        generatedCode = result.mermaidCode;
        // 仍然调用回调以便编辑器更新（保持原有行为）
        try {
          onGenerate(result.mermaidCode);
        } catch (e) {
          console.warn('[AIGenerator] onGenerate callback failed', e);
        }

        // 也直接更新状态，确保编辑器收到最新代码
        try {
          updateCode(generatedCode, { updateDiagram: true });
          // Log current store snapshot to help debugging
          try {
            console.debug('[AIGenerator] inputStateStore after update', get(inputStateStore));
          } catch (e) {
            console.warn('[AIGenerator] failed to read inputStateStore', e);
          }
        } catch (e) {
          console.error('updateCode failed', e);
        }

        // 渲染预览到组件内
        try {
          const viewID = uniqueID('ai-graph-');
          const { svg, bindFunctions } = await renderDiagram({}, generatedCode, viewID);
          if (previewContainer) {
            // eslint-disable-next-line svelte/no-dom-manipulating
            previewContainer.innerHTML = svg || '';
            const graphEl = document.querySelector(`#${viewID}`);
            if (graphEl && bindFunctions) bindFunctions(graphEl);
          }
        } catch (renderErr) {
          console.error('渲染失败', renderErr);
        }

        description = ''; // 清空输入
      } else {
        error = result.error || '生成失败，请重试';
      }
    } catch (err) {
      error = err.message || '生成过程发生错误';
    } finally {
      isGenerating = false;
    }
  }
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

  {#if generatedCode}
    <div class="result-section">
      <div class="preview" bind:this={previewContainer} aria-live="polite"></div>

      <div class="code-area">
        <div class="code-actions">
          <Button variant="secondary" on:click={copyCode}>复制代码</Button>
          <Button variant="accent" on:click={insertToEditor}>插入到编辑器</Button>
        </div>
        <pre class="generated-code"><code>{generatedCode}</code></pre>
      </div>
    </div>
  {/if}
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

  .result-section {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .preview {
    flex: 1 1 50%;
    min-height: 160px;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 6px;
    padding: 0.5rem;
    background: var(--background-color, #fff);
    overflow: auto;
  }

  .code-area {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
  }

  .code-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }

  .generated-code {
    white-space: pre-wrap;
    word-break: break-word;
    background: #0f172a;
    color: #e6eef8;
    padding: 0.75rem;
    border-radius: 6px;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Noto Mono', 'Segoe UI Mono',
      monospace;
    font-size: 0.85rem;
    max-height: 360px;
    overflow: auto;
  }
</style>
