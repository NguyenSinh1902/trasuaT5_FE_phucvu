import axiosClient from './axiosClient';

const promotionApi = {
  getAll: () => {
    return axiosClient.get('/khuyen-mai');
  },
  getActive: () => {
    return axiosClient.get('/khuyen-mai/dang-hoat-dong');
  },
};

export default promotionApi;
