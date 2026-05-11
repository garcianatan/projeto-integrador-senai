import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001"
});

function getToken() {
  return sessionStorage.getItem("token");
}

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const mensagem = error?.response?.data?.erro;
    const token = getToken();

    if (status === 401 && token) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");

      toast.error(mensagem || "Sessão expirada. Faça login novamente.");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);

      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error(mensagem || "Você não tem permissão para esta ação");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;