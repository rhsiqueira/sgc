// C:\dev\sgc\frontend\src\context\AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Valida a sessão com o backend (/auth/me)
  const validateSession = async (token) => {
    try {
      const response = await api.get("/auth/me");
      if (response.data?.status === "success" && response.data?.data) {
        setUser(response.data.data);
        setAuthenticated(true);
        return true;
      }
      logout();
      return false;
    } catch (error) {
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Ao iniciar o app, reaplica o token salvo (se existir) e valida
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      validateSession(token);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login com tratamento correto de erros (401/403/422)
  const login = async (cpf, senha) => {
    try {
      const cpfLimpo = String(cpf).replace(/\D/g, "");
      const senhaLimpa = String(senha).trim();

      if (!cpfLimpo || !senhaLimpa) {
        return { success: false, message: "CPF e senha são obrigatórios." };
      }

      const response = await api.post("/auth/login", {
        cpf: cpfLimpo,
        senha: senhaLimpa,
      });

      // Sucesso com token
      if (response.data?.status === "success" && response.data?.token) {
        const { token, usuario } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const ok = await validateSession(token);
        return { success: ok, message: "Autenticado com sucesso." };
      }

      // Sucesso sem token explícito (não deve acontecer aqui, mas por segurança)
      return {
        success: false,
        message: response.data?.message || "Erro ao autenticar usuário.",
      };
    } catch (error) {
      // Axios lança exceção para 4xx/5xx: tratamos aqui
      const status = error?.response?.status;
      const data = error?.response?.data;

      // Validação Laravel (422)
      if (status === 422) {
        const msg422 =
          data?.errors?.cpf?.[0] ||
          data?.errors?.senha?.[0] ||
          data?.message ||
          "Preencha todos os campos corretamente.";
        return { success: false, message: msg422 };
      }

      // 401 / 403: mensagens do backend
      if (status === 401 || status === 403) {
        const msg = (data?.message || "").toLowerCase();

        if (msg.includes("usuário não encontrado")) {
          return {
            success: false,
            message: "Usuário não encontrado. Verifique o CPF informado.",
          };
        }
        if (msg.includes("senha incorreta")) {
          // preserva o contador "Tentativa X de 3"
          return { success: false, message: data?.message || "Senha incorreta." };
        }
        if (msg.includes("bloquead")) {
          return {
            success: false,
            message: "Conta bloqueada. Contate o suporte.",
          };
        }
        if (msg.includes("credenciais inválidas")) {
          return {
            success: false,
            message: "Credenciais inválidas. Verifique CPF e senha.",
          };
        }

        // fallback coerente para 401/403
        return {
          success: false,
          message: data?.message || "Não autorizado.",
        };
      }

      // Outros erros (rede/500/etc)
      return { success: false, message: "Erro de conexão com o servidor." };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setAuthenticated(false);
    window.location.href = "/login";
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
