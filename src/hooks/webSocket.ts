import { ref, onMounted, onUnmounted } from 'vue';

const text = ref('');
let ws: WebSocket | null = null;

const connectWebSocket = () => {
  //   ws = new WebSocket(import.meta.env.VITE_APP_WEBSOCKET_HOST + '/Api/Gpt/GetGptWebSocket');
  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsUrl = wsProtocol + 'localhost:44381/Api/Gpt/GetGptWebSocket';
  const ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    console.log('WebSocket 连接成功');
    ws?.send('你好，AI！'); // 发送消息给后端
  };

  ws.onmessage = (event) => {
    text.value += event.data; // 逐步更新回复内容
  };

  ws.onclose = () => {
    console.log('WebSocket 连接关闭');
  };

  ws.onerror = (error) => {
    console.error('WebSocket 发生错误:', error);
  };
};

onMounted(connectWebSocket);
onUnmounted(() => {
  (ws as any)?.close();
});
