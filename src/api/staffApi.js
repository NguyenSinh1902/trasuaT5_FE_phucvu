import axiosClient from './axiosClient';

const staffApi = {
  getProfile: (id) => {
    return axiosClient.get(`/nhan-vien/${id}`);
  },
  updateProfile: (id, data) => {
    return axiosClient.put(`/nhan-vien/${id}`, data);
  }
};

export default staffApi;
