import axiosClient from './axiosClient';

const categoryApi = {
  getAll: () => {
    return axiosClient.get('/danh-muc');
  },
};

export default categoryApi;
