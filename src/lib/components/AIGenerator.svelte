<script lang="ts">
  export let onGenerate: (code: string) => void;

  let isOpen = false;
  let promptText = '';
  let isLoading = false;

  // 最简单的实现 - 直接调用后端
  async function handleSubmit() {
    if (!promptText.trim()) {
      alert('请输入图表描述');
      return;
    }
    loading = true;
    error = '';

    isLoading = true;

    try {
      // 🎯 直接调用后端API
      const response = await fetch('http://localhost:5000/api/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: promptText
        })
      });

      const result = await response.json();

      if (result.code) {
        // 成功！把生成的代码传给父组件
        onGenerate(result.code);
        alert('图表生成成功！');
      } else {
        alert('生成失败: ' + (result.error || '未知错误'));
      }

    } catch (error) {
      console.error('错误:', error);
      alert('生成失败！请确保后端正在运行：python backend.py');
    } finally {
      isLoading = false;
      isOpen = false;
    }
  }
</script>

<button on:click={()=> isOpen = true}
  class="ai-btn"
  disabled={isLoading}
  >
  {#if isLoading}
  ⏳ 生成中
  {:else}
  🤖 AI生成
  {/if}
</button>

{#if isOpen}
<div class="modal-overlay" on:click={()=> isOpen = false}>
  <div class="modal-content" on:click|stopPropagation>
    <h3>AI图表生成</h3>
    <textarea bind:value={promptText} placeholder="例如：创建一个用户登录流程的流程图" rows="4"></textarea>

    <div class="examples">
      <p>示例：</p>
      <ul>
        <li>"时序图：用户下单到支付的完整过程"</li>
        <li>"类图：电商系统的用户、商品、订单类"</li>
      </ul>
    </div>

    <div class="modal-actions">
      <button on:click={()=> isOpen = false}>取消</button>
      <button on:click={handleSubmit} disabled={!promptText.trim() || isLoading}>
        {isLoading ? '生成中...' : '生成图表'}
      </button>
    </div>
  </div>
</div>
{/if}

<style>
  .ai-btn {
    background: #007acc;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .ai-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }

  textarea {
    width: 100%;
    margin: 10px 0;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 15px;
  }
</style>