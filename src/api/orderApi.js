import axiosClient from './axiosClient';

const orderApi = {
  createOrder: (data) => {
    return axiosClient.post('/hoa-don/tao-moi', data);
  },

  getAll: () => {
    return axiosClient.get('/hoa-don');
  },
  getById: (id) => {
    return axiosClient.get(`/hoa-don/${id}`);
  },
  getOrdersByType: (loai) => {
    return axiosClient.get(`/hoa-don/loc-theo-loai?loai=${loai}`);
  },
  addItemsToInvoice: (invoiceId, items) => axiosClient.put(`/hoa-don/${invoiceId}/them-mon`, items),
  editItemInInvoice: (invoiceId, itemId, payload) => axiosClient.patch(`/hoa-don/${invoiceId}/sua-mon/${itemId}`, payload),
  cancelOrder: (idHoaDon) => {
    return axiosClient.delete(`/hoa-don/${idHoaDon}/huy`);
  },
  deleteItemFromInvoice: (idHoaDon, idChiTiet) => {
    return axiosClient.delete(`/hoa-don/${idHoaDon}/xoa-mon/${idChiTiet}`);
  },
  requestPayment: (idHoaDon) => {
    return axiosClient.patch(`/hoa-don/${idHoaDon}/yeu-cau-thanh-toan`);
  },
};

export default orderApi;
