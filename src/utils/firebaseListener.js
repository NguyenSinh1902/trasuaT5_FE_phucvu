/**
 * Firebase Realtime Database Listener
 * Sử dụng REST Streaming API (Server-Sent Events) thay vì Native SDK
 * để không cần rebuild app với google-services.json
 *
 * Firebase URL: https://matchatea01-7cf29-default-rtdb.asia-southeast1.firebasedatabase.app/
 */

const FIREBASE_DB_URL = 'https://matchatea01-7cf29-default-rtdb.asia-southeast1.firebasedatabase.app';

/**
 * Lắng nghe thay đổi trên một node Firebase bằng SSE streaming.
 * @param {string} path  - e.g. 'tables' hoặc 'orders'
 * @param {function} onData  - callback(parsedData) mỗi khi có thay đổi
 * @returns {{ stop: function }} - gọi stop() để ngừng lắng nghe
 */
export function listenToFirebase(path, onData) {
  let aborted = false;
  let controller = null;

  const connect = async () => {
    try {
      controller = new AbortController();
      const url = `${FIREBASE_DB_URL}/${path}.json`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok || !response.body) {
        console.log(`[Firebase] Cannot stream ${path}, falling back`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!aborted) {
        const { value, done } = await reader.read();
        if (done || aborted) break;

        buffer += decoder.decode(value, { stream: true });

        // Firebase SSE gửi "event: put\ndata: {...}\n\n"
        const parts = buffer.split('\n\n');
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          const dataLine = part.split('\n').find(l => l.startsWith('data:'));
          if (dataLine) {
            try {
              const payload = JSON.parse(dataLine.slice(5).trim());
              if (payload && payload.data !== null) {
                onData(payload.data);
              }
            } catch (_) {}
          }
        }
        buffer = parts[parts.length - 1];
      }
    } catch (err) {
      if (!aborted) {
        // Tự reconnect sau 5s nếu lỗi không phải do abort
        console.log(`[Firebase] Stream error on ${path}, reconnecting in 5s...`, err?.message);
        setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return {
    stop: () => {
      aborted = true;
      controller?.abort();
    },
  };
}
