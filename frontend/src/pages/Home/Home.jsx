import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // ✅ caminho corrigido
import api from "../../services/api"; // ✅ caminho corrigido
import "./Home.css";
import {
  UserX,
  Users,
  UserCog,
  Building2,
  Package,
  Truck,
  FileBarChart2,
  Eye,
  EyeOff,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user, logout, forcePasswordReset, setForcePasswordReset } =
    useContext(AuthContext);

  // 🔐 Controle do modal
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha1, setShowSenha1] = useState(false);
  const [showSenha2, setShowSenha2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const modules = [
    { name: "Usuários", icon: <Users size={26} />, path: "/usuarios" },
    { name: "Perfis", icon: <UserCog size={26} />, path: "/perfis" },
    { name: "Clientes", icon: <Building2 size={26} />, path: "/clientes" },
    { name: "Produtos", icon: <Package size={26} />, path: "/produtos" },
    { name: "Coletas", icon: <Truck size={26} />, path: "/coletas" },
    { name: "Relatórios", icon: <FileBarChart2 size={26} />, path: "/relatorios" },
  ];

  // === 🧩 SUBMISSÃO DE NOVA SENHA ===
  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (novaSenha.trim().length < 6) {
      setMensagem("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.patch(
        `/usuarios/${user.id_usuario}/redefinir-senha`,
        { nova_senha: novaSenha }
      );

      if (data.status === "success") {
        setMensagem("Senha redefinida com sucesso!");
        setForcePasswordReset(false);
        setNovaSenha("");
        setConfirmarSenha("");
        setTimeout(() => {
          alert("Senha redefinida. Faça login novamente com sua nova senha.");
          logout();
        }, 800);
      } else {
        setMensagem(data.message || "Erro ao redefinir senha.");
      }
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-container">
      {/* HEADER */}
      <header className="home-header slide-down">
        <div className="logout-wrapper" onClick={logout}>
          <UserX className="logout-icon" size={26} strokeWidth={2.5} />
        </div>
      </header>

      {/* SAUDAÇÃO */}
      <section className="home-welcome fade-in">
        <h2>Olá, {user?.nome_completo?.split(" ")[0] || "Usuário"}</h2>
        <p>Bem-vindo ao Painel de Controle</p>
      </section>

      {/* MÓDULOS */}
      <section className="home-modules fade-in">
        {modules.map((mod, index) => (
          <div
            key={index}
            className="module-card"
            onClick={() => navigate(mod.path)}
          >
            <div className="module-icon">{mod.icon}</div>
            <h3>{mod.name}</h3>
          </div>
        ))}
      </section>

      {/* 🔐 MODAL DE REDEFINIÇÃO DE SENHA */}
      {forcePasswordReset && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Redefinição Obrigatória de Senha</h4>
            <p className="modal-subtext">
              Sua senha foi redefinida por um administrador.
              <br />
              Para continuar, defina uma nova senha de acesso.
            </p>

            <form onSubmit={handleRedefinirSenha} className="modal-form">
              <label>Nova Senha</label>
              <div className="senha-wrapper">
                <input
                  type={showSenha1 ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  className="senha-toggle"
                  onClick={() => setShowSenha1((prev) => !prev)}
                  aria-label={showSenha1 ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showSenha1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label>Confirmar Senha</label>
              <div className="senha-wrapper">
                <input
                  type={showSenha2 ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                />
                <button
                  type="button"
                  className="senha-toggle"
                  onClick={() => setShowSenha2((prev) => !prev)}
                  aria-label={showSenha2 ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showSenha2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mensagem && (
                <p
                  className={`mensagem ${
                    mensagem.toLowerCase().includes("sucesso")
                      ? "success"
                      : "error"
                  }`}
                >
                  {mensagem}
                </p>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn primary" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Nova Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
