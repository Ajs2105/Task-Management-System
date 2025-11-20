import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api", // ✅ must include /api
});

// Automatically attach JWT if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    console.log("[Axios] JWT from localStorage:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[Axios] Authorization header set:", config.headers.Authorization);
    } else {
      console.log("[Axios] No JWT found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// Global 401 handler: log out and reload on unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("jwt");
      window.location.reload(); // or redirect to login page if using react-router
    }
    return Promise.reject(error);
  }
);
