import axios from "axios";

export const axiosClient = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : "/api/v1",
    withCredentials: true,
});

export default axiosClient;