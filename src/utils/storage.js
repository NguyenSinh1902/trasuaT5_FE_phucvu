import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback đơn giản nếu module native chưa được link
const safeAsyncStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Chế độ fallback âm thầm cho đến khi app được build lại
      return global.memStorage?.[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      if (!global.memStorage) global.memStorage = {};
      global.memStorage[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      if (global.memStorage) delete global.memStorage[key];
    }
  }
};

export default safeAsyncStorage;
