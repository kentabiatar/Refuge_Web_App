import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "https://refuge-backend.vercel.app/api/v1",
    withCredentials: true,
});

export default axiosClient;