# Mermaid 图表 AI 生成器 — 使用文档

这是一个示例项目：将用户的自然语言描述通过大模型（Qwen / DashScope）转换为可执行的 Mermaid 图表代码，并在前端实时渲染预览。

仓库结构要点：

- `backend.py` — Flask 后端，代理调用 DashScope（或 Qwen）文本生成接口并返回 Mermaid 代码
- `static\test.html` — 提供交互式页面：输入描述、保存 API Key、触发生成、编辑代码、实时预览
- `src\services\aiService.ts` — TypeScript 前端 AI 服务（可在前端项目中导入使用）
- `scr\services\aiService.browser.js` — 浏览器友好适配器，`test.html` 使用它在浏览器中调用后端
- `src\utils\promptTemplates.ts` — 生成 prompt 的模板和规则

本文档覆盖：快速运行、AI 功能使用说明、前端集成示例和安全建议。

## 先决条件

- Python 3.8+
- 已安装依赖：Flask、requests、python-dotenv（在 `requirements.txt` 中列出）
- DashScope / Qwen API Key（可在后端环境变量中配置或在前端临时保存用于测试）

## 快速运行（本地体验）

1. 安装 Python 依赖：

```powershell
# 在项目根目录 (d:\qwen-api-test)
python -m pip install -r requirements.txt
```

2. 设置后端 API Key（推荐在后端设置环境变量，避免在浏览器中暴露）：

```powershell
# Windows PowerShell 示例：把你的 DashScope API Key 设置为环境变量
$env:DASHSCOPE_API_KEY = 'sk-xxxxxxxxxxxx'
# 或在 .env 文件中写入 DASHSCOPE_API_KEY=sk-xxxxx，然后 backend.py 会使用 python-dotenv 加载
```

3. 启动后端服务：

```powershell
python backend.py
```

后端默认监听 `http://0.0.0.0:5000`（页面中的 `BACKEND_URL` 默认为 `http://localhost:5000`）。

4. 启动静态页面（推荐，不要直接用 file:// 协议以避免跨域或 fetch 限制）：

```powershell
# 在项目根目录运行一个简单的静态服务器
python -m http.server 8000
# 然后在浏览器打开 http://localhost:8000/test.html
```

## 页面（test.html）功能简介

- 输入自然语言描述（例如：“生成一个用户注册到购买的流程图，包含错误处理分支”）
- 保存并管理 API Key（本示例会把 Key 保存在浏览器 localStorage，仅供测试）
- 点击“AI生成图表”调用后端生成 Mermaid 代码并自动填入编辑器
- 编辑器支持复制/清空，右侧实时渲染 Mermaid 预览

注意：在生产环境请不要将真实 API Key 存放在浏览器或前端代码中。优先把 Key 存在后端环境变量，后端作为代理来调用模型接口。

## 后端 API 说明（交互契约）

POST /api/generate-chart

- 请求体（JSON）示例：

```json
{
  "description": "生成一个用户登录的流程图",
  "model": "qwen-max",
  "apiKey": "sk-..." // 可选：后端通常从环境变量读取，前端仅在测试时传递
}
```

- 成功响应（JSON）示例：

````json
{
  "code": "graph TD\n  A[开始] --> B[输入用户名密码]\n  B --> C{验证成功?}\n  C -->|是| D[进入首页]\n  C -->|否| E[显示错误]",
  "original": "```mermaid\ngraph TD ... ```",
  "fixed": false
}
````

- 失败响应示例：

```json
{ "error": "未提供API Key" }
```

该契约保证前端通过标准 HTTP POST 请求发送描述，后端返回可直接用于渲染的 `code` 字段。

## 前端集成示例

1. 使用 `test.html`（已集成）

- 页面已引入 `services/aiService.browser.js`，并在点击“AI生成图表”时调用：

```js
// window.aiServiceClient.generateMermaidCode 已在页面上下文中可用
const mermaidCode = await window.aiServiceClient.generateMermaidCode({
  description: '生成一个登录流程图',
  apiKey: '<可选，用于测试>',
  model: 'qwen-max',
  baseUrl: 'http://localhost:5000/api/generate-chart'
});
```

函数会返回纯 Mermaid 代码字符串（会自动剥离 `mermaid ` 包裹），可直接填入编辑器并通过 Mermaid 渲染。

2. 在 TypeScript 前端项目中使用 `services/aiService.ts`

```ts
import { initAIService, getAIService } from './services/aiService';

// 可选：自定义 baseUrl（例如代理路径或相对路径）
initAIService({ baseUrl: '/api/generate-chart', maxRetries: 3 });

const svc = getAIService();
const result = await svc.generateMermaidCode({ description: '生成一个用户注册流程图' });
if (result.success) {
  // result.mermaidCode 即为可渲染内容
}
```

返回值（TS 版本）为对象：`{ success: boolean, mermaidCode?: string, error?: string, original?: string, fixed?: boolean }`。

## 模块与文件说明

- `services/aiService.ts`：TypeScript 实现，适合在打包型前端项目中使用（提供 init/get 单例与 retry 逻辑）。
- `services/aiService.browser.js`：浏览器适配器（ES module），`test.html` 直接引入并将 `aiServiceClient` 挂载到 `window`。
- `backend.py`：后端实现了 `/api/generate-chart` 和 `/api/health`，并包含对生成结果的简单修复（`validate_and_fix_mermaid_code`）。

## 安全与最佳实践

- 不要在前端或浏览器存储真实 API Key（localStorage/IndexedDB 均不安全）。
- 推荐把 API Key 存在后端（环境变量或机密管理服务），前端通过后端代理调用模型服务。
- 对后端请求添加速率限制（rate limiting）、鉴权与日志审计，避免滥用。

## 常见问题与排查

- 无法从前端访问后端：

  - 确认后端在 `5000` 端口运行且 `BACKEND_URL` 与页面一致。
  - 如果页面通过 `file://` 打开，浏览器会阻止跨域 fetch，请使用静态服务器（`python -m http.server`）。

- 后端返回格式不正确：

  - 查看后端日志（Flask 控制台），检查调用 DashScope 的响应结构。
  - `backend.py` 期望返回 JSON 格式，且 `output.text` 包含生成文本。

- Mermaid 渲染错误：
  - 检查生成的代码是否为合法 Mermaid 语法（节点未闭合或缺少图头如 `graph TD`）。
  - `backend.py` 中有简单修复逻辑，但复杂语法错误需要手动调整。

## 下一步建议（可选）

- 把前端改成模块化项目（React / Vue）并引入 `services/aiService.ts`，写单元测试（mock fetch）覆盖不同后端返回情况。
- 在后端实现缓存（相同描述复用结果）与并发控制。
- 增加 prompt 版本管理（不同风格或语言的 prompt 模板）。
