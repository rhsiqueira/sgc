// C:\dev\sgc\frontend\src\pages\Coleta\GerarCertificado.jsx

import React, { useRef } from "react";
import "./GerarCertificado.css";
import { X, FileSignature } from "lucide-react";
import AssinaturaPad from "./AssinaturaPad";

export default function GerarCertificado({ open, onClose, onConfirm, coleta }) {
  const assinaturaRef = useRef(null);

  if (!open) return null;

  const handleConfirm = () => {
    let assinaturaBase64 = null;

    if (assinaturaRef.current && typeof assinaturaRef.current.getImage === "function") {
      assinaturaBase64 = assinaturaRef.current.getImage();
    }

    // Mantém o contrato atual: coleta é o primeiro parâmetro
    // e assinaturabase64 vai como segundo parâmetro
    onConfirm(coleta, assinaturaBase64);
  };

  const handleClear = () => {
    if (assinaturaRef.current && typeof assinaturaRef.current.clear === "function") {
      assinaturaRef.current.clear();
    }
  };

  return (
    <div className="gerarcert-overlay" onClick={onClose}>
      <div
        className="gerarcert-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button className="gerarcert-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Título */}
        <h3 className="gerarcert-title">
          <FileSignature size={20} style={{ marginRight: 8 }} />
          Gerar Certificado
        </h3>

        {/* Texto principal */}
        <p className="gerarcert-text">
          Deseja gerar o certificado da coleta{" "}
          <strong>#{coleta?.id_coleta}</strong>?
        </p>

        {/* Área de assinatura */}
        <div className="gerarcert-signature-block">
          <p className="gerarcert-signature-label">
            Assine abaixo para validar o certificado:
          </p>

          <AssinaturaPad
            ref={assinaturaRef}
            width={280}
            height={100}
          />

          <button
            type="button"
            className="btn ghost gerarcert-clear-signature"
            onClick={handleClear}
          >
            Limpar assinatura
          </button>
        </div>

        {/* Ações */}
        <div className="gerarcert-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn primary"
            onClick={handleConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
