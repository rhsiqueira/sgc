// C:\dev\sgc\frontend\src\routes\AppRoutes.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 📄 Páginas
import Login from "../pages/Login";
import Home from "../pages/Home";
import Usuario from "../pages/Usuario";
import Perfil from "../pages/Perfil";
import Cliente from "../pages/Cliente";
import Produto from "../pages/Produto";

// 🔐 Contexto de autenticação
import { AuthContext } from "../context/AuthContext";

// ✅ Componente de rota privada
function PrivateRoute({ children }) {
  const { authenticated, user } = useContext(AuthContext);

  // Se está logado e possui usuário válido → acessa rota
  if (authenticated && user) {
    return children;
  }

  // Caso contrário → redireciona para login
  return <Navigate to="/login" replace />;
}

// ✅ Estrutura principal de rotas
export default function AppRoutes() {
  return (
    <Routes>
      {/* === ROTA PÚBLICA === */}
      <Route path="/login" element={<Login />} />

      {/* === ROTAS PRIVADAS === */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <Usuario />
          </PrivateRoute>
        }
      />

      <Route
        path="/perfis"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <Cliente />
          </PrivateRoute>
        }
      />

      <Route
        path="/produtos"
        element={
          <PrivateRoute>
            <Produto />
          </PrivateRoute>
        }
      />

      {/* === ROTA PADRÃO / FALLBACK === */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
