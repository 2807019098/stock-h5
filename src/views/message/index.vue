<script lang="ts" setup>
import { GetGptText } from '@/api/gpt';
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
defineOptions({
  name: 'message'
});

const text = ref("");
let ws: WebSocket | null = null;

// const getGptText = async () => {
//   try {
//     const payload = {
//       businesS_PARAMETERS: {
//         message: "1111"
//       },
//       systeM_PARAMETERS: {
//         appid: '',
//         accesS_TOKEN: '',
//         timestamp: '',
//         sign: 'zhikaisoft'
//       }
//     };

//     text.value = ""; // 清空之前的内容

//     const url = import.meta.env.VITE_APP_API_HOST + 'api/gpt/getGptText';
//     const resp = await fetch(url, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     if (!resp.body) throw new Error('Response body is empty');

//     const reader = resp.body.getReader();
//     const decoder = new TextDecoder();

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       const chunk = decoder.decode(value, { stream: true });
//       text.value += chunk; // 逐步追加到页面
//     }
//   } catch (error) {
//     console.error('获取数据失败:', error);
//   }
// }

// 连接 WebSocket
const connectWebSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsUrl = wsProtocol + window.location.host + '/Api/Gpt/GetGptWebSocket';
  ws = new WebSocket(wsUrl); // 确保 ws 变量是全局的

  ws.onopen = () => {
    console.log('✅ WebSocket 连接成功');
  };

  ws.onmessage = (event) => {
    text.value += event.data; // 逐步更新回复内容
  };

  ws.onclose = () => {
    console.log('❌ WebSocket 连接关闭');
  };

  ws.onerror = (error) => {
    console.error('⚠ WebSocket 发生错误:', error);
  };
};

// 发送消息
const sendMessage = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send("你好，AI！");
  } else {
    console.error('WebSocket 未连接');
  }
};

// 组件挂载时连接 WebSocket
onMounted(connectWebSocket);

// 组件卸载时关闭 WebSocket
onUnmounted(() => {
  if (ws) {
    ws.close();
    ws = null;
  }
});
</script>
<template>
  <div class="container" style="font-size: 14px;">message</div>
  <!-- <div v-html="text" style="font-size: 14px;"></div>
  <button @click="getGptText" style="font-size: 14px;">获取GPT文本</button> -->
  <div class="container" style="font-size: 14px;">
    <h2>WebSocket AI 对话</h2>
    <button type="button" @click="sendMessage">发送消息</button>
    <div v-html="text"></div>
  </div>
</template>
<style lang="scss" scoped>
.container {
  color: #000;
}
</style>
