# backend/backend.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, os, re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # ✅ 允许前端跨域访问

def validate_and_fix_mermaid_code(code):
    if not code:
        return code
    code = re.sub(r'```mermaid\s*', '', code.strip())
    code = re.sub(r'```\s*', '', code)
    valid_starts = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'pie', 'gantt', 'gitGraph']
    if not any(code.startswith(start) for start in valid_starts):
        code = 'graph TD\n' + code
    return code

@app.route('/api/generate-chart', methods=['POST'])
def generate_chart():
    data = request.json
    description = data.get('description', '')
    model = data.get('model', 'qwen-max')
    api_key = data.get('apiKey', os.getenv('DASHSCOPE_API_KEY', ''))
    if not api_key:
        return jsonify({'error': '未提供API Key'}), 400
    if not description:
        return jsonify({'error': '描述不能为空'}), 400

    prompt = f"""请将以下描述转换为可执行的 Mermaid 图表代码，仅返回代码，不要注释。
描述：{description}"""

    response = requests.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        },
        json={
            'model': model,
            'input': {'messages': [{'role': 'user', 'content': prompt}]},
            'parameters': {'max_tokens': 1500, 'temperature': 0.2}
        },
        timeout=30
    )

    result = response.json()
    text = result.get('output', {}).get('text', '')
    fixed = validate_and_fix_mermaid_code(text)
    return jsonify({'code': fixed})

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
