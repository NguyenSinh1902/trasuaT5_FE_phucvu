import axiosClient from './axiosClient';

const authApi = {
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
  verifyRegister: (data) => {
    return axiosClient.post('/auth/verify-register', data);
  }
};

export default authApi;
