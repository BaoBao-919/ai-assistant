<template>
  <div class="chat-container">
    <!-- 消息列表区域 -->
    <div class="message-list" ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="content" v-html="formattedContent(msg.content)"></div>
      </div>
      <!-- AI 思考中的加载状态 -->
      <div v-if="isLoading" class="message assistant">
        <div class="avatar">🤖</div>
        <div class="content thinking">思考中...</div>
      </div>
    </div>

    <!-- 用户输入区域 -->
    <div class="input-area">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="输入你的问题，按 Enter 发送..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import axios from 'axios'
import { marked } from 'marked'

// 定义消息类型
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([
  { role: 'assistant', content: '你好！我是你的 AI 助手，有什么前端问题我可以帮你吗？' }
])
const userInput = ref('')
const isLoading = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

// 格式化 Markdown 内容
const formattedContent = (content: string) => {
  return marked.parse(content, { async: false }) as string
}

// 自动滚动到最新消息
const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 发送消息的核心函数
const sendMessage = async () => {
  const content = userInput.value.trim()
  if (!content || isLoading.value) return

  // 1. 将用户消息添加到列表，并清空输入框
  messages.value.push({ role: 'user', content })
  userInput.value = ''
  await scrollToBottom()

  // 2. 开启加载状态，准备调用后端 API
  isLoading.value = true

  try {
    // 3. 向后端 /api/chat 接口发送 POST 请求
    const response = await axios.post('/api/chat', {
      message: content
    })

    // 4. 获取 AI 的回复，并添加到消息列表
    const assistantReply = response.data.reply
    messages.value.push({ role: 'assistant', content: assistantReply })
  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value.push({ role: 'assistant', content: '抱歉，服务出了点问题，请稍后再试。' })
  } finally {
    // 5. 无论成功或失败，关闭加载状态
    isLoading.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 80vh;
  background-color: #f9f9f9;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 85%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message.user .avatar {
  background-color: #007aff;
  color: white;
}

.content {
  background-color: white;
  padding: 10px 15px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  line-height: 1.5;
}

.message.user .content {
  background-color: #007aff;
  color: white;
}

.thinking {
  color: #888;
  font-style: italic;
}

.input-area {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
  display: flex;
  gap: 12px;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.input-area input:focus {
  border-color: #007aff;
}

.input-area button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.input-area button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>