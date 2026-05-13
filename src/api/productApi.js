import axiosClient from './axiosClient';

const productApi = {
  getAll: () => {
    return axiosClient.get('/san-pham');
  },
  getHome: () => {
    return axiosClient.get('/san-pham/home');
  },
  getByCategory: (categoryId) => {
    return axiosClient.get(`/san-pham/danh-muc/${categoryId}`);
  },
  getToppings: () => {
    return axiosClient.get('/san-pham/toppings');
  },
  getMenu: () => {
    return axiosClient.get('/san-pham/menu');
  },
  getById: (id) => {
    return axiosClient.get(`/san-pham/${id}`);
  },
  getSuggestions: (id) => {
    return axiosClient.get(`/goi-y/instant/${id}`);
  },
};

export default productApi;
