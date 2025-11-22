// C:\dev\sgc\frontend\src\pages\Coleta\CertificadoPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Certificado from "./Certificado";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./CertificadoPage.css"; // opcional para estilizar o container

export default function CertificadoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coleta, setColeta] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // CARREGAR COLETA
  // =============================
  const fetchColeta = async () => {
    try {
      const { data } = await api.get(`/coletas/${id}`);
      setColeta(data.data);
    } catch (err) {
      console.error("Erro ao carregar coleta:", err);
      alert("Erro ao carregar certificado.");
      navigate("/coletas");
    }
  };

  // =============================
  // CARREGAR LISTA DE PRODUTOS COMPLETA
  // =============================
  const fetchProdutos = async () => {
    try {
      const { data } = await api.get("/produtos");
      const lista = Array.isArray(data.data) ? data.data : data;
      setProdutos(lista);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  // =============================
  // CHAMAR AS DUAS FUNÇÕES
  // =============================
  useEffect(() => {
    async function loadAll() {
      await Promise.all([fetchColeta(), fetchProdutos()]);
      setTimeout(() => setLoading(false), 300); // small delay para DOM montar
    }
    loadAll();
  }, []);

  // =============================
  // GERAR PDF AUTOMATICAMENTE
  // =============================
  useEffect(() => {
    if (loading || !coleta) return;

    setTimeout(() => {
      const node = document.getElementById("certificado-root");

      if (!node) return;

      html2canvas(node, {
        scale: 2,
        useCORS: true,
        logging: false,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`certificado_${id}.pdf`);
      });
    }, 600); // delay para garantir que tudo carregou
  }, [loading, coleta]);

  // =============================
  // RENDER
  // =============================
  if (loading || !coleta) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Carregando certificado...
      </div>
    );
  }

  return (
    <div className="certificado-page-container">
      {/* BOTÃO VOLTAR */}
      <button className="btn-voltar" onClick={() => navigate("/coletas")}>
        Voltar
      </button>

      {/* COMPONENTE CERTIFICADO */}
      <Certificado
        coleta={coleta}
        cliente={coleta.cliente}
        produtos={produtos}
        assinaturaBase64={null} // se quiser puxar depois
      />
    </div>
  );
}
