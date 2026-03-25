import axiosClient from './axiosClient';

const orderApi = {
  createOrder: (data) => {
    return axiosClient.post('/hoa-don/tao-moi', data);
  },
  updateOrder: (idHoaDon, items) => {
    return axiosClient.put(`/hoa-don/${idHoaDon}/cap-nhat-mon`, items);
  },
  getAll: () => {
    return axiosClient.get('/hoa-don');
  },
  getById: (id) => {
    return axiosClient.get(`/hoa-don/${id}`);
  }
};

export default orderApi;
