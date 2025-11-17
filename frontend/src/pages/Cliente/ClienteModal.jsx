// C:\dev\sgc\frontend\src\pages\Cliente\ClienteModal.jsx
import React from "react";
import { X, FileText, Calendar, User } from "lucide-react";
import api from "../../services/api";
import "./Cliente.css";

export default function ClienteModal({
  open,
  onClose,
  onSave,
  editMode,
  etapa,
  setEtapa,
  formData,
  setFormData,
}) {
  if (!open) return null;

  // ======== FORMATADORES ========
  const formatarCNPJ = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 14);
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  const formatarCEP = (valor) =>
    valor.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

  const formatarData = (str) => {
    if (!str) return "—";
    const data = new Date(str);
    return data.toLocaleDateString("pt-BR");
  };

  // ======== HANDLERS ========
  const handleChange = (field, value) =>
    setFormData((d) => ({ ...d, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Salva cliente primeiro
      const result = await onSave();
      const clienteId = result?.id_cliente || formData?.id_cliente;

      // 2️⃣ Envia arquivo PDF (se houver)
      if (formData.contrato && clienteId) {
        const formDataUpload = new FormData();
        formDataUpload.append("id_cliente", clienteId);
        formDataUpload.append("arquivo", formData.contrato);

        const response = await api.post("/contratos", formDataUpload);

        if (response.data?.status === "success") {
          const contrato = response.data.data;

          alert("Contrato enviado com sucesso!");

          setFormData((d) => ({
            ...d,
            url_arquivo: contrato.url_arquivo,
            data_upload: contrato.data_upload,
            usuario_upload: contrato.usuario_upload,
          }));
        } else {
          alert("Falha ao enviar contrato.");
        }
      }

      onClose();
    } catch (err) {
      console.error("❌ Erro ao salvar cliente/contrato:", err);
      alert("Erro ao salvar cliente ou contrato. Verifique o console.");
    }
  };

  // ======== RENDER ========
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <h4>{editMode ? "Editar Cliente" : "Adicionar Cliente"}</h4>
        <p className="modal-etapa">Etapa {etapa} de 2</p>

        <form onSubmit={handleSubmit} className="modal-form">
          {etapa === 1 && (
            <>
              <label>
                Razão Social
                <input
                  type="text"
                  maxLength={60}
                  value={formData.razao_social}
                  onChange={(e) =>
                    handleChange("razao_social", e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Nome Fantasia
                <input
                  type="text"
                  maxLength={60}
                  value={formData.nome_fantasia}
                  onChange={(e) =>
                    handleChange("nome_fantasia", e.target.value)
                  }
                />
              </label>

              <label>
                CNPJ / CPF
                <input
                  type="text"
                  value={formData.cnpj_cpf}
                  onChange={(e) =>
                    handleChange("cnpj_cpf", formatarCNPJ(e.target.value))
                  }
                  required
                />
              </label>

              <div className="row">
                <label className="w-50">
                  Nome do Responsável
                  <input
                    type="text"
                    maxLength={60}
                    value={formData.nome_responsavel}
                    onChange={(e) =>
                      handleChange("nome_responsavel", e.target.value)
                    }
                  />
                </label>

                <label className="w-50">
                  Telefone Celular
                  <input
                    type="text"
                    value={formData.telefone_celular}
                    onChange={(e) =>
                      handleChange("telefone_celular", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="row">
                <label className="w-50">
                  E-mail Comercial
                  <input
                    type="email"
                    maxLength={60}
                    value={formData.email_comercial}
                    onChange={(e) =>
                      handleChange("email_comercial", e.target.value)
                    }
                  />
                </label>

                <label className="w-50">
                  Telefone Fixo
                  <input
                    type="text"
                    value={formData.telefone_fixo}
                    onChange={(e) =>
                      handleChange("telefone_fixo", e.target.value)
                    }
                  />
                </label>
              </div>

              {/* =========================
                 BLOCO DE CONTRATO
              ========================== */}
              <label>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  <FileText size={16} /> Contrato (PDF)
                </span>

                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {!formData.url_arquivo ? (
                    <>
                      <p style={{ color: "#777", fontSize: "0.9rem" }}>
                        Nenhum contrato vinculado.
                      </p>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleChange("contrato", e.target.files[0] || null)
                        }
                        className="input-file"
                      />
                    </>
                  ) : (
                    <>
                      <a
                        href={`${
                          process.env.REACT_APP_API_BASE_URL ||
                          "http://127.0.0.1:8000/api"
                        }/../storage/${formData.url_arquivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          textDecoration: "none",
                          color: "#0066cc",
                          fontWeight: 500,
                        }}
                      >
                        📎 {formData.url_arquivo.split("/").pop()}
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                          }}
                        >
                          (clique para visualizar)
                        </span>
                      </a>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "0.85rem",
                          color: "#555",
                        }}
                      >
                        {formData.usuario_upload && (
                          <span>
                            <User size={13} /> {formData.usuario_upload}
                          </span>
                        )}
                        {formData.data_upload && (
                          <span>
                            <Calendar size={13} />{" "}
                            {formatarData(formData.data_upload)}
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          handleChange("contrato", e.target.files[0] || null)
                        }
                        className="input-file"
                      />
                    </>
                  )}
                </div>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setEtapa(2)}
                >
                  Próximo →
                </button>
              </div>
            </>
          )}

          {etapa === 2 && (
            <>
              <label>
                Endereço
                <input
                  type="text"
                  maxLength={60}
                  value={formData.endereco}
                  onChange={(e) =>
                    handleChange("endereco", e.target.value)
                  }
                  required
                />
              </label>

              <div className="row">
                <label className="w-70">
                  Bairro
                  <input
                    type="text"
                    maxLength={60}
                    value={formData.bairro}
                    onChange={(e) =>
                      handleChange("bairro", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="w-30">
                  Número
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.numero}
                    onChange={(e) =>
                      handleChange("numero", e.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <div className="row">
                <label className="w-70">
                  Cidade
                  <input
                    type="text"
                    maxLength={60}
                    value={formData.cidade}
                    onChange={(e) =>
                      handleChange("cidade", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="w-30">
                  UF
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) =>
                      handleChange(
                        "estado",
                        e.target.value.toUpperCase()
                      )
                    }
                    required
                  />
                </label>
              </div>

              <div className="row">
                <label className="w-50">
                  CEP
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) =>
                      handleChange("cep", formatarCEP(e.target.value))
                    }
                  />
                </label>

                <label className="w-50">
                  Dias de Funcionamento
                  <input
                    type="text"
                    maxLength={60}
                    value={formData.dias_funcionamento}
                    onChange={(e) =>
                      handleChange(
                        "dias_funcionamento",
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>

              <label>
                Observações
                <input
                  type="text"
                  maxLength={60}
                  value={formData.observacoes}
                  onChange={(e) =>
                    handleChange("observacoes", e.target.value)
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleChange("status", e.target.value)
                  }
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setEtapa(1)}
                >
                  ← Voltar
                </button>
                <button type="submit" className="btn primary">
                  Salvar
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
