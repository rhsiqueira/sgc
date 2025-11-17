// C:\dev\sgc\frontend\src\services\api.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// 🔒 Intercepta TODAS as requisições para inserir o token e tratar o tipo de conteúdo dinamicamente
api.interceptors.request.use(
  (config) => {
    // 🔹 Adiciona o token do localStorage, se existir
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🧠 Ajusta dinamicamente o Content-Type
    // 👉 Se o corpo for FormData (upload de arquivo), NÃO define manualmente o Content-Type
    // O navegador cria o boundary automaticamente.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      // Para as demais requisições (JSON comum)
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
