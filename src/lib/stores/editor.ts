import { get, writable } from 'svelte/store';

/**
 * 全局编辑器状态 store
 * 保存当前 mermaid 代码、是否加载中、错误状态等。
 */
export interface EditorState {
  code: string; // 当前 mermaid 代码
  lastGenerated?: string; // 上一次由 AI 生成的代码
  isLoading: boolean; // 是否正在生成/处理
  error?: string | null; // 错误信息
}

const initialState: EditorState = {
  code: 'graph TD\nA-->B',
  isLoading: false,
  error: null
};

// ✅ 创建 Svelte 可写 store
export const editorStore = writable<EditorState>(initialState);

/**
 * 获取当前 Mermaid 代码
 */
export function getCode(): string {
  return get(editorStore).code;
}

/**
 * 设置编辑器代码（用于 AI 自动更新或手动修改）
 */
export function setCode(newCode: string) {
  editorStore.update((state) => ({
    ...state,
    code: newCode,
    lastGenerated: newCode,
    error: null
  }));
}

/**
 * 设置加载状态（例如调用 AI 时）
 */
export function setLoading(isLoading: boolean) {
  editorStore.update((state) => ({
    ...state,
    isLoading
  }));
}

/**
 * 设置错误信息
 */
export function setError(error: string | null) {
  editorStore.update((state) => ({
    ...state,
    error
  }));
}

/**
 * 订阅编辑器状态变化
 */
export function subscribe(run: (value: EditorState) => void) {
  return editorStore.subscribe(run);
}
