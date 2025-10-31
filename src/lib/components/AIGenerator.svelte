<!-- src/lib/components/AIGenerator.svelte -->
<script lang="ts">
  //回调函数是留下来的接口给ai
  export let onGenerate: (code: string) => void;
  
  let isOpen = false;
  let promptText = '';    // 用户输入的描述文本
  let isLoading = false;


  // 用户点击生成 → 调用AI服务 
  function handleSubmit() {
    // 1. 检查用户是否输入了内容
    if (!promptText.trim()) {
      alert('请输入图表描述');
      return;
    }

    // 2. 开始加载状态（显示⏳图标）
    isLoading = true;

    // 3. 模拟AI调用（2秒延迟）
    setTimeout(() => {
      // 4. 生成的Mermaid代码 需替换调用api的函数
      const mockCode = `graph TD\n    A[${promptText}] --> B[AI生成图表]`;
      
      // 5. 通过接口返回生成的代码给父组件
      onGenerate(mockCode);  

      // 6. 显示成功提示
      alert('图表生成成功！');

      // 7. 关闭加载状态
      isLoading = false;

      // 8. 关闭模态框
      isOpen = false;
    }, 2000);
  }
</script>

<button 
  on:click={() => isOpen = true} 
  class="ai-btn" 
  disabled={isLoading}
  title="AI生成图表"
>
  {#if isLoading}
    ⏳ 生成中
  {:else}
    🤖 AI生成
  {/if}
</button>

{#if isOpen}
  <div class="modal-overlay" on:click={() => isOpen = false}>
    <div class="modal-content" on:click|stopPropagation>
      <h3>AI图表生成</h3>
      <textarea 
        bind:value={promptText}
        placeholder="例如：创建一个用户登录流程的流程图"
        rows="4"
      ></textarea>
      
      <div class="examples">
        <p>示例：</p>
        <ul>
          <li>"时序图：用户下单到支付的完整过程"</li>
          <li>"类图：电商系统的用户、商品、订单类"</li>
        </ul>
      </div>
      
      <div class="modal-actions">
        <button on:click={() => isOpen = false}>取消</button>
        <button on:click={handleSubmit} disabled={!promptText.trim()}>
          生成图表
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .ai-btn {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .ai-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .ai-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
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
    max-height: 80vh;
    overflow: auto;
  }
  
  .modal-content h3 {
    margin: 0 0 16px 0;
  }
  
  .modal-content textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    box-sizing: border-box;
  }
  
  .examples {
    margin: 12px 0;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .examples ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
  }
  
  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  .modal-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .modal-actions button:last-child {
    background: #3b82f6;
    color: white;
  }
</style>