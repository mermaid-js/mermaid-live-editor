from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def validate_and_fix_mermaid_code(code):
    """
    验证和修复Mermaid代码的常见问题
    """
    if not code:
        return code
    
    # 清理代码
    code = code.strip()
    
    # 移除可能的markdown代码块标记
    code = re.sub(r'```mermaid\s*', '', code)
    code = re.sub(r'```\s*', '', code)
    
    # 检查是否以有效的图表类型开头
    valid_starts = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
                   'stateDiagram', 'pie', 'gantt', 'gitGraph']
    
    starts_with_valid = any(code.startswith(start) for start in valid_starts)
    
    if not starts_with_valid:
        # 尝试自动添加graph TD（最常用的类型）
        if '-->' in code or '->' in code or '[' in code:
            code = 'graph TD\n' + code
        elif 'participant' in code:
            code = 'sequenceDiagram\n' + code
        elif 'title' in code and (' : ' in code or ':' in code):
            code = 'pie\n' + code
    
    # 修复常见的中文引号问题
    code = code.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    
    # 确保有换行符
    if '\n' not in code:
        code = code.replace(';', ';\n').replace('{', '{\n').replace('}', '\n}')
    
    return code

@app.route('/api/generate-chart', methods=['POST'])
def generate_chart():
    """
    代理调用DashScope API生成图表
    """
    try:
        data = request.json
        description = data.get('description', '')
        model = data.get('model', 'qwen-max')
        api_key = data.get('apiKey', os.getenv('DASHSCOPE_API_KEY', ''))
        
        if not api_key:
            return jsonify({'error': '未提供API Key'}), 400
        
        if not description:
            return jsonify({'error': '未提供图表描述'}), 400

        # 更详细的提示词
        prompt = f"""请将以下描述转换为正确、完整、可执行的Mermaid图表代码。

要求：
1. 只返回纯Mermaid代码，不要任何解释、注释或markdown标记
2. 代码必须完整且语法正确
3. 根据描述自动选择合适的图表类型：
   - 流程、步骤 → graph TD 或 flowchart TD
   - 交互、顺序 → sequenceDiagram
   - 比例、百分比 → pie
   - 状态变化 → stateDiagram
   - 类关系 → classDiagram
4. 使用中文标签
5. 确保所有节点都有明确的标签
6. 如果是流程图，使用 graph TD 或 flowchart TD

描述：{description}

请直接返回Mermaid代码："""

        # 调用DashScope API
        response = requests.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': model,
                'input': {
                    'messages': [
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ]
                },
                'parameters': {
                    'max_tokens': 1500,
                    'temperature': 0.1
                }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            error_msg = response.json().get('message', 'API调用失败')
            return jsonify({'error': f'DashScope API错误: {error_msg}'}), 500
        
        result = response.json()
        
        if 'output' not in result or 'text' not in result['output']:
            return jsonify({'error': 'API返回格式错误'}), 500
        
        # 获取生成的代码
        generated_text = result['output']['text']
        
        # 验证和修复代码
        fixed_code = validate_and_fix_mermaid_code(generated_text)
        
        return jsonify({
            'code': fixed_code,
            'original': generated_text,
            'fixed': fixed_code != generated_text
        })
        
    except requests.exceptions.Timeout:
        return jsonify({'error': '请求超时，请重试'}), 500
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({'status': 'ok', 'message': '后端服务运行正常'})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')