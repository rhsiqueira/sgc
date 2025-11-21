// C:\dev\sgc\frontend\src\pages\Cliente\Cliente.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Cliente.css";
import {
  ChevronLeft,
  Edit3,
  Trash2,
  PlusCircle,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import ClienteModal from "./ClienteModal";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cliente() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ATIVO");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(null);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [etapa, setEtapa] = useState(1);

  const [formData, setFormData] = useState({
    id_cliente: null,
    razao_social: "",
    nome_fantasia: "",
    cnpj_cpf: "",
    nome_responsavel: "",
    email_comercial: "",
    telefone_celular: "",
    telefone_fixo: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    dias_funcionamento: "",
    observacoes: "",
    status: "ATIVO",
    contrato: null,
    url_arquivo: null,
    data_upload: null,
    usuario_upload: null,
  });

  const POR_PAGINA = 3;
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

  // ============================
  // FETCH CLIENTES
  // ============================
  const fetchClientes = async () => {
    try {
      setCarregando(true);

      const { data } = await api.get("/clientes", {
        params: {
          status: filtroStatus || "",
          busca: busca || "",
        },
      });

      const lista = Array.isArray(data.data) ? data.data : [];
      setClientes(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os clientes.");
      toast.error("Erro ao carregar clientes.");
    } finally {
      setTimeout(() => setCarregando(false), 500);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [filtroStatus, busca]);

  // quando trocar de página/filtro/busca, tira expansão
  useEffect(() => {
    setExpandido(null);
  }, [pagina, filtroStatus, busca]);

  // ============================
  // PAGINAÇÃO
  // ============================
  const totalPaginas = Math.max(1, Math.ceil(clientes.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = clientes.slice(inicio, inicio + POR_PAGINA);

  // ============================
  // MODAL
  // ============================
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setEditMode(true);
      setFormData({
        ...cliente,
        contrato: null,
        url_arquivo: cliente.contrato?.url_arquivo || null,
        data_upload: cliente.contrato?.data_upload || null,
        usuario_upload: cliente.contrato?.usuario_upload || null,
      });
    } else {
      setEditMode(false);
      setFormData({
        id_cliente: null,
        razao_social: "",
        nome_fantasia: "",
        cnpj_cpf: "",
        nome_responsavel: "",
        email_comercial: "",
        telefone_celular: "",
        telefone_fixo: "",
        endereco: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        dias_funcionamento: "",
        observacoes: "",
        status: "ATIVO",
        contrato: null,
        url_arquivo: null,
        data_upload: null,
        usuario_upload: null,
      });
    }

    setEtapa(1);
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setEtapa(1);
  };

  const salvarCliente = async () => {
    try {
      if (editMode) {
        const response = await api.put(
          `/clientes/${formData.id_cliente}`,
          formData
        );

        const data = response.data;

        if (data?.status === "success") {
          toast.success("Cliente atualizado com sucesso!");

          setClientes((prev) =>
            prev.map((c) =>
              c.id_cliente === formData.id_cliente ? { ...c, ...data.data } : c
            )
          );

          return data.data;
        }

        // erro de validação
        if (data?.errors) {
          const campo = Object.keys(data.errors)[0];
          toast.error(data.errors[campo][0]);
          return null;
        }

        toast.error(data?.message || "Erro ao atualizar cliente.");
        return null;
      }

      // === CRIAÇÃO ===
      const response = await api.post("/clientes", formData);
      const data = response.data;

      if (data?.status === "success") {
        toast.success("Cliente criado com sucesso!");

        const novo = data.data;

        if (!novo.data_criacao) {
          novo.data_criacao = new Date().toISOString();
        }

        setClientes((prev) => [novo, ...prev]);
        setPagina(1);

        return novo;
      }

      if (data?.errors) {
        const campo = Object.keys(data.errors)[0];
        toast.error(data.errors[campo][0]);
        return null;
      }

      toast.error(data?.message || "Erro ao criar cliente.");
      return null;
    } catch (e) {
      console.error(e);

      // validação 422
      if (e.response?.status === 422) {
        const erros = e.response.data.errors;
        const campo = Object.keys(erros)[0];
        toast.error(erros[campo][0]);
      } else {
        toast.error("Erro ao salvar cliente.");
      }

      return null;
    }
  };

  const excluirCliente = async (c) => {
    const ok = window.confirm(`Excluir o cliente "${c.razao_social}"?`);
    if (!ok) return;

    try {
      const response = await api.delete(`/clientes/${c.id_cliente}`);

      if (response.data?.status === "success") {
        toast.success("Cliente excluído com sucesso!");
        setClientes((prev) => prev.filter((x) => x.id_cliente !== c.id_cliente));
      } else {
        toast.error(response.data?.message || "Erro ao excluir cliente.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir cliente.");
    }
  };

  const formatarData = (str) => {
    if (!str) return null;
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("pt-BR");
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="cliente-page enter-down">
      <ToastContainer position="top-right" autoClose={2500} />

      <header className="cliente-header">
        <div className="cliente-header-top">
          <button className="back-btn" onClick={() => navigate("/home")}>
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="breadcrumb">
          <span className="crumb" onClick={() => navigate("/home")}>
            Home
          </span>
          <span className="sep">›</span>
          <span className="crumb active">Clientes</span>
        </nav>

        {/* 🔍 Busca */}
        <div className="cliente-search">
          <input
            type="text"
            placeholder="Buscar por nome, razão social ou CNPJ…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        {/* 🔽 Filtro + Adicionar */}
        <div className="cliente-actions" style={{ gap: 8 }}>
          <select
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPagina(1);
            }}
            style={{
              width: "40%",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "10px 8px",
              background: "#fff",
            }}
          >
            <option value="ATIVO">🟢 Ativos</option>
            <option value="INATIVO">🔴 Inativos</option>
            <option value="">📋 Todos</option>
          </select>

          <button
            className="btd-add-cliente"
            style={{ width: "60%" }}
            onClick={() => abrirModal(null)}
          >
            <PlusCircle size={16} style={{ marginRight: 6 }} />
            Adicionar Cliente
          </button>
        </div>
      </header>

      <main className="cliente-content">
        {carregando && (
          <div className="cliente-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cliente-card skeleton">
                <div className="skeleton-bar w-60"></div>
                <div className="skeleton-bar w-50"></div>
                <div className="skeleton-bar w-40"></div>
              </div>
            ))}
          </div>
        )}

        {!carregando && erro && <p className="error">{erro}</p>}
        {!carregando && !erro && paginaAtual.length === 0 && (
          <p className="hint">Nenhum cliente encontrado.</p>
        )}

        {!carregando && !erro && paginaAtual.length > 0 && (
          <>
            <div className="cliente-grid">
              {paginaAtual.map((c) => {
                const isExpandido = expandido === c.id_cliente;

                // se algum está expandido, só mostra ele
                if (expandido && !isExpandido) return null;

                return (
                  <article
                    key={c.id_cliente}
                    className={
                      isExpandido
                        ? "cliente-card cliente-card-expandido fade-in"
                        : "cliente-card fade-in"
                    }
                    onClick={() =>
                      setExpandido(isExpandido ? null : c.id_cliente)
                    }
                  >
                    <div className="card-actions">
                      <button
                        className="icon-btn"
                        title="Editar"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirModal(c);
                        }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Excluir"
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirCliente(c);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="cliente-name">
                      {c.nome_fantasia || "—"}
                    </h3>
                    <p className="cliente-line">{c.razao_social || "—"}</p>
                    <p className="cliente-line">{c.cnpj_cpf || "—"}</p>
                    <p className="cliente-line">
                      {c.dias_funcionamento || "—"}
                    </p>

                    <p
                      className={`status ${
                        c.status === "ATIVO" ? "ok" : "off"
                      }`}
                    >
                      {c.status}
                    </p>

                    {/* EXPANDIDO */}
                    {isExpandido && (
                      <div className="cliente-detalhes">
                        {/* Contatos */}
                        <div className="det-bloco">
                          <h4>Contatos</h4>
                          <p>
                            <strong>Responsável:</strong>{" "}
                            {c.nome_responsavel || "—"}
                          </p>
                          <p>
                            <strong>Celular:</strong>{" "}
                            {c.telefone_celular || "—"}
                          </p>
                          <p>
                            <strong>E-mail:</strong>{" "}
                            {c.email_comercial || "—"}
                          </p>
                          <p>
                            <strong>Fixo:</strong>{" "}
                            {c.telefone_fixo || "—"}
                          </p>
                        </div>

                        {/* Endereço */}
                        <div className="det-bloco">
                          <h4>Endereço</h4>
                          <p>
                            <strong>Endereço:</strong>{" "}
                            {c.endereco || "—"}, {c.numero || "S/N"}
                          </p>
                          <p>
                            <strong>Bairro:</strong> {c.bairro || "—"}
                          </p>
                          <p>
                            <strong>Cidade/UF:</strong>{" "}
                            {c.cidade || "—"} / {c.estado || "—"}
                          </p>
                          <p>
                            <strong>CEP:</strong> {c.cep || "—"}
                          </p>
                        </div>

                        {/* Funcionamento */}
                        <div className="det-bloco">
                          <h4>Funcionamento</h4>
                          <p>
                            <strong>Dias:</strong>{" "}
                            {c.dias_funcionamento || "—"}
                          </p>
                          <p>
                            <strong>Observações:</strong>{" "}
                            {c.observacoes || "—"}
                          </p>
                        </div>

                        {/* Contrato */}
                        <div className="det-bloco">
                          <h4>Contrato</h4>

                          {!c.contrato || !c.contrato.url_arquivo ? (
                            <p>Nenhum contrato vinculado.</p>
                          ) : (
                            <>
                              <a
                                href={`${API_BASE}/../storage/${c.contrato.url_arquivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-contrato"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText size={16} />
                                <span>
                                  {c.contrato.url_arquivo
                                    .split("/")
                                    .pop()}
                                </span>
                              </a>

                              <div className="contrato-meta">
                                {c.contrato.usuario_upload && (
                                  <span>
                                    <User size={13} />{" "}
                                    {c.contrato.usuario_upload}
                                  </span>
                                )}
                                {c.contrato.data_upload && (
                                  <span>
                                    <Calendar size={13} />{" "}
                                    {formatarData(
                                      c.contrato.data_upload
                                    ) || "—"}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {!expandido && totalPaginas > 1 && (
              <div className="paginacao">
                <button
                  className="page-btn"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span className="page-info">
                  {pagina} / {totalPaginas}
                </span>
                <button
                  className="page-btn"
                  disabled={pagina === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL */}
      <ClienteModal
        open={openModal}
        onClose={fecharModal}
        onSave={salvarCliente}
        editMode={editMode}
        etapa={etapa}
        setEtapa={setEtapa}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
