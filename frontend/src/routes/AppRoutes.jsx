import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Usuario from "../pages/Usuario";
import Perfil from "../pages/Perfil"; // ✅ import novo
import { AuthContext } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { authenticated, user } = useContext(AuthContext);

  if (authenticated && user) {
    return children;
  }

  // se não está autenticado, volta pro login
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* rota pública */}
      <Route path="/login" element={<Login />} />

      {/* rotas privadas */}
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

      {/* ✅ nova rota protegida de Perfis */}
      <Route
        path="/perfis"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />

      {/* fallback padrão */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
