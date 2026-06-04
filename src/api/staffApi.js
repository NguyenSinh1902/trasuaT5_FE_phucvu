import axiosClient from './axiosClient';

const staffApi = {
  getProfile: (id) => {
    return axiosClient.get(`/nhan-vien/${id}`);
  },
  updateProfile: (id, data) => {
    return axiosClient.put(`/nhan-vien/${id}`, data);
  },
  updateProfileWithAvatar: (id, formData) => {
    return axiosClient.put(`/nhan-vien/${id}/profile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // --- Online Bookings ---
  getPendingBookings: () => {
    return axiosClient.get('/phieu-dat-ban/dang-cho-xac-nhan');
  },
  assignTableForBooking: (idPhieu, idBan) => {
    return axiosClient.put(`/phieu-dat-ban/${idPhieu}/xep-ban?idBan=${idBan}`);
  }
};

export default staffApi;
