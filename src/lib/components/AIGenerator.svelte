<script lang="ts">
  import { generateMermaidCode } from '@/services/aiService';
  import { setCode } from '$/stores/editor'; // ✅ 项目已有的store，用于更新编辑器内容

  let description = '';
  let result = '';
  let loading = false;
  let error = '';

  async function handleGenerate() {
    if (!description.trim()) {
      error = '请输入图表描述';
      return;
    }
    loading = true;
    error = '';

    const res = await generateMermaidCode(description);
    loading = false;

    if (res.success) {
      result = res.code;
      setCode(res.code); // ✅ 正确调用
    } else {
      error = res.error;
    }
  }
</script>

<div class="ai-generator rounded-xl bg-gray-100 p-4">
  <textarea
    class="w-full rounded-md border p-2"
    rows="4"
    placeholder="请输入要生成的图表描述..."
    bind:value={description} />
  <button
    class="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white"
    on:click={handleGenerate}
    disabled={loading}>
    {loading ? '生成中...' : 'AI 生成 Mermaid 图表'}
  </button>

  {#if error}
    <p class="mt-2 text-red-600">{error}</p>
  {/if}

  {#if result}
    <h3 class="mt-4 font-semibold">生成的代码：</h3>
    <pre class="mt-1 rounded border bg-white p-2">{result}</pre>
  {/if}
</div>
