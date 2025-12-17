import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Ajout automatique du token JWT si présent
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // ✅
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.request.use((config) => {
  console.log("➡️ REQUEST:", config.method?.toUpperCase(), (config.baseURL || "") + config.url);
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (username, password) =>
  API.post(
    "/auth/login",
    new URLSearchParams({ username, password }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

export const register = (payload) => API.post("/auth/register", payload);

export const analyzeMe = () => API.get("/analyze/me");
export const recommendMe = () => API.get("/recommend/me");
export const getMyData = () => API.get("/data/me");
export const addMyData = (payload) => API.post("/data", payload);

export default API;
