// C:\dev\sgc\frontend\src\pages\Cliente\Cliente.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Cliente.css";
import { ChevronLeft, Edit3, Trash2, PlusCircle } from "lucide-react";
import ClienteModal from "./ClienteModal"; // mantém exatamente o que já existe

export default function Cliente() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ATIVO");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(null);

  // ===== 🔹 Controle do Modal =====
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

  // =====================================================
  // 🔹 FETCH — agora com filtros iguais ao módulo Usuário
  // =====================================================
  const fetchClientes = async () => {
    try {
      setCarregando(true);

      const { data } = await api.get("/clientes", {
        params: {
          status: filtroStatus || "",
          busca: busca || ""
        }
      });

      const lista = Array.isArray(data.data) ? data.data : [];
      setClientes(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os clientes.");
    } finally {
      setTimeout(() => setCarregando(false), 600);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [filtroStatus, busca]);

  // =====================================================
  // 🔹 Paginação — igualzinho ao módulo Usuário
  // =====================================================
  const totalPaginas = Math.max(1, Math.ceil(clientes.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = clientes.slice(inicio, inicio + POR_PAGINA);

  // =====================================================
  // 🔹 Modal
  // =====================================================
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

  // =====================================================
  // 🔹 Salvar / Atualizar — mantém tudo igual
  // =====================================================
  const salvarCliente = async () => {
    try {
      if (editMode) {
        const { data } = await api.put(`/clientes/${formData.id_cliente}`, formData);
        if (data?.data) {
          setClientes((prev) =>
            prev.map((c) =>
              c.id_cliente === formData.id_cliente ? { ...c, ...data.data } : c
            )
          );
          fecharModal();
          return data.data;
        }
      } else {
        const { data } = await api.post("/clientes", formData);
        if (data?.data) {
          const novo = data.data;

          if (!novo.data_criacao) {
            novo.data_criacao = new Date().toISOString();
          }

          setClientes((prev) => [novo, ...prev]);
          setPagina(1);

          fecharModal();
          return novo;
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o cliente. Verifique os campos obrigatórios.");
      return null;
    }
  };

  // =====================================================
  // 🔹 Excluir
  // =====================================================
  const excluirCliente = async (c) => {
    const ok = window.confirm(`Excluir o cliente "${c.razao_social}"?`);
    if (!ok) return;
    try {
      await api.delete(`/clientes/${c.id_cliente}`);
      setClientes((prev) => prev.filter((x) => x.id_cliente !== c.id_cliente));
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir o cliente.");
    }
  };

  // =====================================================
  // 🔹 RENDER
  // =====================================================
  return (
    <div className="cliente-page enter-down">
      <header className="cliente-header">
        <div className="cliente-header-top">
          <button className="back-btn" onClick={() => navigate("/home")}>
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="breadcrumb">
          <span className="crumb" onClick={() => navigate("/home")}>Home</span>
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

          <button style={{ width: "60%" }} onClick={() => abrirModal(null)}>
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

        {!carregando && !erro && (
          <>
            <div className="cliente-grid">
              {paginaAtual.map((c, index) => {
                const isPrimeiro = index === 0;
                const isTerceiro = index === 2;
                const isExpandido = expandido === c.id_cliente;

                let classes = "cliente-card fade-in";

                if (isExpandido) {
                  classes += " expandido";
                  if (isTerceiro) classes += " invertido";
                } else if (expandido) {
                  if (
                    (expandido === paginaAtual[0]?.id_cliente ||
                      expandido === paginaAtual[1]?.id_cliente) &&
                    isTerceiro
                  ) {
                    classes += " oculto";
                  }
                  if (expandido === paginaAtual[2]?.id_cliente && isPrimeiro) {
                    classes += " oculto";
                  }
                }

                return (
                  <article
                    key={c.id_cliente}
                    className={classes}
                    onClick={() =>
                      setExpandido(expandido === c.id_cliente ? null : c.id_cliente)
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

                    <h3 className="cliente-name">{c.nome_fantasia || "—"}</h3>
                    <p className="cliente-line">{c.razao_social || "—"}</p>
                    <p className="cliente-line">{c.cnpj_cpf || "—"}</p>
                    <p className="cliente-line">{c.dias_funcionamento || "—"}</p>

                    <p className={`status ${c.status === "ATIVO" ? "ok" : "off"}`}>
                      {c.status}
                    </p>

                    {expandido === c.id_cliente && (
                      <div className="cliente-detalhes">
                        <p><strong>Responsável:</strong> {c.nome_responsavel || "—"}</p>
                        <p><strong>Celular:</strong> {c.telefone_celular || "—"}</p>
                        <p><strong>E-mail:</strong> {c.email_comercial || "—"}</p>
                        <p><strong>Fixo:</strong> {c.telefone_fixo || "—"}</p>
                        <p><strong>Endereço:</strong> {c.endereco || "—"}, {c.numero || ""}</p>
                        <p><strong>Cidade/UF:</strong> {c.cidade || "—"} / {c.estado || "—"}</p>
                        <p><strong>CEP:</strong> {c.cep || "—"}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {totalPaginas > 1 && (
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
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 🔵 ClienteModal controlado */}
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
