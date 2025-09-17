import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // ✅ must include /api
});

// Automatically attach JWT if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
