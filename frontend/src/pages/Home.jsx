import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";
import {
  UserX,
  Users,
  UserCog,
  Building2,
  Package,
  Truck,
  FileBarChart2
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const modules = [
    { name: "Usuários", icon: <Users size={26} />, path: "/usuarios" },
    { name: "Perfis", icon: <UserCog size={26} />, path: "/perfis" },
    { name: "Clientes", icon: <Building2 size={26} />, path: "/clientes" },
    { name: "Produtos", icon: <Package size={26} />, path: "/produtos" },
    { name: "Coletas", icon: <Truck size={26} />, path: "/coletas" },
    { name: "Relatórios", icon: <FileBarChart2 size={26} />, path: "/relatorios" },
  ];

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
    </main>
  );
}

export default Home;
