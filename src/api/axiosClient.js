import axios from 'axios';
import safeAsyncStorage from '../utils/storage';

const axiosClient = axios.create({
  baseURL: 'http://10.0.2.2:8080/api',
  timeout: 50000, // Tăng timeout lên 50s vì gửi email có thể chậm
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for professional handling
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await safeAsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Trích xuất message chi tiết nhất có thể từ API
    let message = 'Đã có lỗi xảy ra';

    if (error.response && error.response.data) {
      const data = error.response.data;
      // Ưu tiên lấy message chi tiết, sau đó đến error, title hoặc detail
      message = data.message || data.detail || data.error || data.title || (typeof data === 'string' ? data : message);
    } else {
      message = error.message || message;
    }

    // Log error for debugging but don't use console.error which might trigger UI overlays
    console.log('API Error:', message);

    // Trả về một object lỗi chứa message để UI có thể hiển thị bằng Alert
    return Promise.reject({ ...error, message });
  }
);

export default axiosClient;
