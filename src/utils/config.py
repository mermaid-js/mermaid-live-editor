import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """配置类"""
    # 从环境变量获取API Key，如果没有则使用空字符串
    DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY', '')
    
    # 要测试的模型列表
    MODELS_TO_TEST = [
        'qwen-max',
        'qwen-plus', 
        'qwen-turbo',
        'qwen-7b-chat',
        'qwen-14b-chat'
    ]
    
    @classmethod
    def validate_config(cls):
        """验证配置是否有效"""
        if not cls.DASHSCOPE_API_KEY:
            print("❌ 未找到DASHSCOPE_API_KEY环境变量")
            print("💡 请创建 .env 文件并设置: DASHSCOPE_API_KEY=你的API密钥")
            return False
        return True