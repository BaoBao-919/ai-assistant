// backend/index.js
require('dotenv').config();  // 读取 .env 文件中的密钥
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express(); // 创建 Express 应用
const PORT = 3000;    // 设置后端服务器端口

// 解决跨域问题，让前端能访问本后端
app.use(cors());
// 允许后端处理 JSON 格式的请求体
app.use(express.json());

// DeepSeek 官方 API 地址
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';


// 定义处理聊天请求的 API 端点，前端会发请求到这个地址
app.post('/api/chat', async (req, res) => {
  // 1. 从请求中获取用户输入的消息
  const { message } = req.body;

  // 2. 检查消息是否存在
  if (!message) {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  try {
    // 3. 调用 DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        // 指定使用的模型，最好使用官方文档最新推荐的稳定版本
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个有帮助的前端开发助手。' },
          { role: 'user', content: message }
        ],
        // 设为 false 表示一次性返回完整结果
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. 从 API 响应中提取 AI 的回复内容
    const reply = response.data.choices[0].message.content;

    // 5. 将 AI 回复以 JSON 格式返回给前端
    res.json({ reply });
  } catch (error) {
    // 6. 如果调用过程中出错，打印错误信息并返回错误响应
    console.error('DeepSeek API 调用失败:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI 服务暂时不可用，请稍后再试。' });
  }
});

// 启动后端服务器，监听 3000 端口
app.listen(PORT, () => {
  console.log(`后端服务已启动，监听 http://localhost:${PORT}`);
});