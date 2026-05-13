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
  }
};

export default staffApi;
