// C:\dev\sgc\frontend\src\routes\AppRoutes.jsx

import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Usuario from "../pages/Usuario/Usuario";
import Perfil from "../pages/Perfil/Perfil";
import Cliente from "../pages/Cliente/Cliente";
import Produto from "../pages/Produto/Produto";
import Coleta from "../pages/Coleta/Coleta";

import CertificadoPage from "../pages/Coleta/CertificadoPage"; // <-- NOVO

import { AuthContext } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { authenticated, user } = useContext(AuthContext);
  return authenticated && user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* PÁGINAS PRIVADAS */}
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

      {/* COLETAS */}
      <Route
        path="/coletas"
        element={
          <PrivateRoute>
            <Coleta />
          </PrivateRoute>
        }
      />

      {/* NOVA ROTA DO CERTIFICADO — PAGE EXCLUSIVA */}
      <Route
        path="/coletas/certificado/:id"
        element={
          <PrivateRoute>
            <CertificadoPage />
          </PrivateRoute>
        }
      />

      {/* QUALQUER OUTRA COISA REDIRECIONA PARA HOME */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
