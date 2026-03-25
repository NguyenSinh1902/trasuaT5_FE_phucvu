import axiosClient from './axiosClient';

const reservationApi = {
  createReservation: (data) => {
    return axiosClient.post('/phieu-dat-ban/tao-moi', data);
  },
  getActiveReservations: () => {
    return axiosClient.get('/phieu-dat-ban/dang-hoat-dong');
  },
  mergeTables: (resId, tableIds) => {
    return axiosClient.put(`/phieu-dat-ban/${resId}/gop-them`, tableIds);
  },
  changeTable: (resId, oldId, newId) => {
    return axiosClient.put(`/phieu-dat-ban/${resId}/doi-ban?idBanCu=${oldId}&idBanMoi=${newId}`);
  },
  cancelReservation: (resId) => {
    return axiosClient.delete(`/phieu-dat-ban/${resId}/huy`);
  },
  checkIn: (resId) => {
    return axiosClient.post(`/phieu-dat-ban/${resId}/check-in`);
  },
};

export default reservationApi;
