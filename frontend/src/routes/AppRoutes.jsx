import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
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
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
