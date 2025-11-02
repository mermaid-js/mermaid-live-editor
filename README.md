# Mermaid-AI-Copilot

## 项目简介

本项目基于开源的 Mermaid Live Editor，集成了 AI 智能图表生成功能。用户可以通过自然语言描述，让 AI 自动生成对应的 Mermaid 流程图代码，并实时渲染在编辑器中。这大大降低了使用 Mermaid 语法的学习成本，让图表创建变得更加直观和高效。

## 功能亮点

### 🤖 AI 智能生成
- **自然语言转图表**：用简单的文字描述即可生成专业的 Mermaid 流程图
- **智能代码生成**：AI 理解用户意图，输出标准化的 Mermaid 语法代码
- **实时预览更新**：生成的代码自动同步到编辑器，即时渲染图表

### 🎨 无缝用户体验
- **一键操作**：代码编辑框提供 AI 生成按钮
- **直观交互**：简洁的模态框设计，降低用户学习成本
- **智能反馈**：实时加载状态提示和错误处理

### 🔧 技术优势
- **模块化架构**：AI 功能独立组件设计，与原编辑器完美解耦
- **可扩展后端**：支持多种大语言模型，轻松切换 AI 服务提供商
- **类型安全**：完整的 TypeScript 支持，确保代码质量

## 技术架构

### 前端技术栈
- **框架**：Svelte 5 + TypeScript
- **状态管理**：Svelte Store
- **编辑器**：Monaco Editor（支持 Mermaid 语法高亮）
- **UI 组件**：TailwindCSS + 自定义组件
- **构建工具**：Vite

### 后端技术栈
- **框架**：Flask (Python)
- **AI 服务**：Qwen 大语言模型（可替换为 GPT、Claude 等）
- **API 设计**：RESTful 接口
- **部署**：支持本地运行和容器化部署

### 系统架构图

```
用户界面层
├── Mermaid 编辑器 (原有功能)
├── AI 生成按钮 (新增)
└── 生成模态框 (新增)

业务逻辑层  
├── AI 服务调用
├── 代码生成处理
└── 状态同步管理

数据服务层
├── Flask API 服务
├── Qwen 模型接口
└── 响应数据格式化
```

## 安装部署指南

### 环境要求
- Node.js 16+ 
- Python 3.8+
- 有效的 Qwen API Key

### 前端部署

1. **克隆项目**
```bash
git clone https://github.com/LYY-Z/Mermaid-AI-Copilot
cd Mermaid-AI-Copilot
```

2. **下载Docker Desktop**
3. **配置 Docker 镜像源**
- 打开Docker Desktop → 进入 Settings → Docker Engine
- 用下面内容覆盖原有整个配置
```r
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```
- 点击 Apply & Restart
- 等待 Docker 重启完成

4. **在项目目录下运行** (需保证 Docker Desktop 已打开)
```r
# 在项目根目录 (自己修改)
cd F:\schoolwork\Mermaid-AI-Copilot

# 使用 docker compose 构建并启动
docker compose up --build
```
- 运行成功后，在浏览器打开
![alt text](<./images/image.jpg>)
```r
http://localhost:3000/
```

### 后端部署

1. **进入后端目录**
```bash
cd backend
```

2. **安装 Python 依赖**
```bash
pip install -r requirements.txt
```

3. **配置环境变量**
创建 `.env` 文件：
```bash
DASHSCOPE_API_KEY=你的Qwen_API密钥
```

4. **启动后端服务**
```bash
python backend.py
```
![alt text](<./images/image-1.jpg>)

## 使用方法示例

### 基本使用流程

1. **打开 AI 生成功能**
   - 点击代码编辑栏的 "🤖 AI生成" 按钮
  ![alt text](<./images/image-2.jpg>)
   - 在弹出的模态框中输入图表描述
  


1. **输入自然语言描述**
   ```
   生成一个用户登录系统的流程图，包含登录页面、验证凭证、成功进入主页和失败显示错误信息
   ```
   ![alt text](<./images/image-3.jpg>)

2. **AI 生成图表**
   - 点击"生成"按钮
   - 等待 AI 处理（显示加载状态）
  ![alt text](<./images/image-4.jpg>)
   - 查看生成的 Mermaid 代码和渲染结果
  ![alt text](<./images/image-5.jpg>)