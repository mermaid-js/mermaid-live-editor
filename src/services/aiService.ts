// src/services/aiService.ts
export async function generateMermaidCode(description: string) {
  try {
    const response = await fetch('http://localhost:5000/api/generate-chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return { success: true, code: data.code };
  } catch (error) {
    console.error('生成失败:', error);
    return { success: false, error: error.message || '请求出错' };
  }
}
