/**
 * Firebase Realtime Database Listener
 * Sử dụng polling REST API thay vì SSE streaming,
 * vì React Native Android (New Architecture / Fabric) không hỗ trợ
 * response.body.getReader() cho long-lived streaming connections.
 *
 * Firebase URL: https://matchatea01-7cf29-default-rtdb.asia-southeast1.firebasedatabase.app/
 */

const FIREBASE_DB_URL = 'https://matchatea01-7cf29-default-rtdb.asia-southeast1.firebasedatabase.app';

// Khoảng thời gian poll (ms) — 3 giây là đủ nhanh mà không quá tốn tài nguyên
const POLL_INTERVAL_MS = 3000;

/**
 * Lắng nghe thay đổi trên một node Firebase bằng polling.
 * @param {string} path  - e.g. 'tables' hoặc 'orders'
 * @param {function} onData  - callback(parsedData) mỗi khi có thay đổi
 * @returns {{ stop: function }} - gọi stop() để ngừng lắng nghe
 */
export function listenToFirebase(path, onData) {
  let stopped = false;
  let lastDataStr = null;
  let timeoutId = null;

  const poll = async () => {
    if (stopped) return;

    try {
      const url = `${FIREBASE_DB_URL}/${path}.json`;
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        console.log(`[Firebase] Poll error on ${path}: HTTP ${response.status}`);
      } else {
        const text = await response.text();
        // Chỉ gọi onData khi có thay đổi thực sự
        if (text !== lastDataStr) {
          lastDataStr = text;
          try {
            const data = JSON.parse(text);
            if (data !== null && data !== undefined) {
              onData(data);
            }
          } catch (e) {
            console.log(`[Firebase] JSON parse error on ${path}:`, e?.message);
          }
        }
      }
    } catch (err) {
      if (!stopped) {
        console.log(`[Firebase] Fetch error on ${path}:`, err?.message);
      }
    }

    if (!stopped) {
      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    }
  };

  // Bắt đầu ngay lập tức
  poll();

  return {
    stop: () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
    },
  };
}
