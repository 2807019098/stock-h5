const url = import.meta.env.VITE_APP_API_HOST;
console.log('API URL:', url);
async function getResponse(content: any) {
  console.log('content:', content.data);
  const resp = await fetch(url + 'api/gpt/getGptText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content.data)
  });
  const reader = resp.body ? resp.body.getReader() : null;
  const decoder = new TextDecoder();
  let result = '';
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const txt = decoder.decode(value, { stream: true });
      result += txt;
    }
  }
  return result;
}

export default getResponse;
