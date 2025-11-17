// C:\dev\sgc\frontend\src\routes\AppRoutes.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 📄 Páginas
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Usuario from "../pages/Usuario/Usuario";
import Perfil from "../pages/Perfil/Perfil";
import Cliente from "../pages/Cliente/Cliente";
import Produto from "../pages/Produto/Produto";
import Coleta from "../pages/Coleta/Coleta"; // ✅ Novo módulo adicionado

// 🔐 Contexto global de autenticação
import { AuthContext } from "../context/AuthContext";

/**
 * 🔒 PrivateRoute
 * Garante que apenas usuários autenticados acessem determinadas rotas.
 */
function PrivateRoute({ children }) {
  const { authenticated, user } = useContext(AuthContext);
  return authenticated && user ? children : <Navigate to="/login" replace />;
}

/**
 * 🌐 Estrutura principal de rotas
 */
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

      {/* ✅ NOVA ROTA: COLETA */}
      <Route
        path="/coletas"
        element={
          <PrivateRoute>
            <Coleta />
          </PrivateRoute>
        }
      />

      {/* === ROTA PADRÃO === */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
