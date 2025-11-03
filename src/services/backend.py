from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# 你的 API Key
DASHSCOPE_API_KEY = "sk-ceedc33d580445b991bc563f998491e0"

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
    
    return code

def call_dashscope_api(description):
    """
    调用DashScope API
    """
    try:
        # 方法1：使用新的API端点（兼容OpenAI格式）
        url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {DASHSCOPE_API_KEY}"
        }
        
        prompt = f"""请将以下描述转换为正确、完整、可执行的Mermaid图表代码。

要求：
1. 只返回纯Mermaid代码，不要任何解释、注释或markdown标记
2. 代码必须完整且语法正确
3. 根据描述自动选择合适的图表类型
4. 使用中文标签

描述：{description}

Mermaid代码："""

        data = {
            "model": "qwen-turbo",  # 使用qwen-turbo模型
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 2000
        }
        
        print(f"调用DashScope API，描述: {description}")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"API响应状态: {response.status_code}")
        
        if response.status_code != 200:
            print(f"API错误响应: {response.text}")
            return None
        
        result = response.json()
        print(f"API返回: {result}")
        
        # 解析响应
        if 'choices' in result and len(result['choices']) > 0:
            generated_text = result['choices'][0]['message']['content']
            return generated_text.strip()
        else:
            print("无法解析API响应")
            return None
            
    except Exception as e:
        print(f"API调用异常: {str(e)}")
        return None

def generate_fallback_code(description):
    """
    API失败时的备选方案
    """
    desc_lower = description.lower()
    
    if any(word in desc_lower for word in ['流程', '步骤', '过程', 'flow']):
        return f"""graph TD
    A[开始] --> B["{description}"]
    B --> C[处理中]
    C --> D[完成]
    
    style A fill:#4CAF50
    style D fill:#2196F3"""

    elif any(word in desc_lower for word in ['序列', '时序', '顺序', 'sequence']):
        return """sequenceDiagram
    participant 用户
    participant 系统
    用户->>系统: 请求
    系统->>用户: 响应"""

    else:
        return f"""graph LR
    A[输入] --> B["{description}"]
    B --> C[输出]"""

@app.route('/api/generate-chart', methods=['POST'])
def generate_chart():
    """
    生成图表接口
    """
    try:
        data = request.json
        description = data.get('description', '').strip()
        
        print(f"收到生成请求: {description}")
        
        if not description:
            return jsonify({'error': '描述不能为空'}), 400

        # 首先尝试调用DashScope API
        generated_text = call_dashscope_api(description)
        
        if generated_text:
            # 验证和修复代码
            fixed_code = validate_and_fix_mermaid_code(generated_text)
            print(f"API生成成功: {fixed_code}")
            
            return jsonify({
                'code': fixed_code,
                'success': True,
                'message': 'AI生成成功',
                'source': 'dashscope'
            })
        else:
            # API调用失败，使用备选方案
            print("API调用失败，使用备选方案")
            fallback_code = generate_fallback_code(description)
            
            return jsonify({
                'code': fallback_code,
                'success': True,
                'message': '使用本地生成（API不可用）',
                'source': 'fallback'
            })
        
    except Exception as e:
        error_msg = f'服务器错误: {str(e)}'
        print(f"生成失败: {error_msg}")
        return jsonify({
            'error': error_msg,
            'success': False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'Mermaid AI Backend',
        'api_key_set': bool(DASHSCOPE_API_KEY)
    })

@app.route('/test-api', methods=['GET'])
def test_api():
    """
    测试API连接
    """
    try:
        test_result = call_dashscope_api("测试流程图")
        return jsonify({
            'api_available': bool(test_result),
            'test_result': test_result
        })
    except Exception as e:
        return jsonify({
            'api_available': False,
            'error': str(e)
        })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Mermaid AI 后端服务启动")
    print(f"🔑 API Key: {'已设置' if DASHSCOPE_API_KEY else '未设置'}")
    print("📍 访问地址: http://localhost:5000")
    print("🧪 测试接口: http://localhost:5000/test-api")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)