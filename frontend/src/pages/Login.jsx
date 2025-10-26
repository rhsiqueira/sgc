import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";
import logoAuth from "../assets/logo-auth.png";

function Login() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔹 Ativa o fundo animado apenas nesta página
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  // 🔹 Máscara dinâmica do CPF (000.000.000-00)
  const handleCpfChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // remove tudo que não for número
    if (valor.length > 11) valor = valor.slice(0, 11); // limita a 11 dígitos
    valor = valor
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(valor);
  };

  // 🔹 Remove pontuação antes de enviar
  const limparCpf = (valor) => valor.replace(/\D/g, "");

  // 🔹 Função principal de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    try {
      const result = await login(limparCpf(cpf), senha);
      console.log("🔑 Resultado do login:", result);

      if (result.success) {
        navigate("/home");
      } else {
        const msg = result.message?.toLowerCase() || "";
        if (msg.includes("usuário não encontrado")) {
          setMensagem("Usuário não encontrado. Verifique o CPF informado.");
        } else if (msg.includes("bloqueada") || msg.includes("bloqueado")) {
          setMensagem("Conta bloqueada. Contate o suporte.");
        } else if (msg.includes("senha incorreta")) {
          setMensagem(result.message);
        } else {
          setMensagem("CPF ou senha inválidos.");
        }
      }
    } catch (error) {
      console.error("Erro ao tentar login:", error);
      setMensagem("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={logoAuth} alt="Logo SGC" className="login-logo" />

      <form onSubmit={handleLogin} className="login-form">
        <label className="login-label">CPF</label>
        <input
          type="text"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={handleCpfChange}
          className="login-input"
          inputMode="numeric"
          maxLength={14}
          required
        />

        <label className="login-label">SENHA</label>
        <input
          type="password"
          placeholder="********"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="login-input"
          required
        />

        {mensagem && <p className="login-error">{mensagem}</p>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "ENTRANDO..." : "CONTINUAR"}
        </button>
      </form>
    </div>
  );
}

export default Login;
