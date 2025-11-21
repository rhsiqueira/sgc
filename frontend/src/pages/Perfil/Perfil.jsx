import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Perfil.css";
import { ChevronLeft, Edit3, Trash2, X, PlusCircle } from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Perfil() {
  const navigate = useNavigate();

  const [perfis, setPerfis] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ATIVO");
  const [paginaPerfis, setPaginaPerfis] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [paginaPermissoes, setPaginaPermissoes] = useState(1);

  const [formData, setFormData] = useState({
    id_perfil: null,
    nome_perfil: "",
    descricao: "",
    permissoes: [],
    status: "ATIVO",
  });

  const POR_PAGINA = 3;

  // === 🔹 Buscar dados iniciais ===
  const fetchPerfis = async () => {
    try {
      setCarregando(true);
      setErro("");
      const { data } = await api.get("/perfis");
      const lista = Array.isArray(data) ? data : data.data || data.perfis || [];
      setPerfis(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os perfis.");
    } finally {
      setCarregando(false);
    }
  };

  const fetchPermissoes = async () => {
    try {
      const { data } = await api.get("/permissoes");
      setPermissoes(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      console.error("Erro ao buscar permissões:", e);
    }
  };

  useEffect(() => {
    fetchPerfis();
    fetchPermissoes();
  }, []);

  // === 🔍 Filtro + Ordenação ===
  const filtrados = useMemo(() => {
    let lista = [...perfis];

    if (filtroStatus) {
      lista = lista.filter(
        (p) => p.status?.toUpperCase() === filtroStatus.toUpperCase()
      );
    }

    const termo = busca.trim().toLowerCase();
    if (termo) {
      lista = lista.filter(
        (p) =>
          p.nome_perfil?.toLowerCase().includes(termo) ||
          p.descricao?.toLowerCase().includes(termo)
      );
    }

    lista.sort(
      (a, b) => new Date(b.data_criacao || 0) - new Date(a.data_criacao || 0)
    );

    return lista;
  }, [perfis, busca, filtroStatus]);

  const totalPaginasPerfis = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );
  const inicio = (paginaPerfis - 1) * POR_PAGINA;
  const paginaAtual = filtrados.slice(inicio, inicio + POR_PAGINA);

  // === 🧩 Modal ===
  const abrirModal = (perfil = null) => {
    if (perfil) {
      setEditMode(true);
      setFormData({
        id_perfil: perfil.id_perfil,
        nome_perfil: perfil.nome_perfil || "",
        descricao: perfil.descricao || "",
        permissoes: perfil.permissoes?.map((p) => p.id_permissao) || [],
        status: perfil.status || "ATIVO",
      });
    } else {
      setEditMode(false);
      setFormData({
        id_perfil: null,
        nome_perfil: "",
        descricao: "",
        permissoes: [],
        status: "ATIVO",
      });
    }
    setPaginaPermissoes(1);
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setFormData({
      id_perfil: null,
      nome_perfil: "",
      descricao: "",
      permissoes: [],
      status: "ATIVO",
    });
  };

  // === 💾 Salvar (criação + edição) ===
  const salvarPerfil = async (e) => {
    e.preventDefault();
    try {
      let response;

      if (editMode) {
        response = await api.put(`/perfis/${formData.id_perfil}`, formData);
        const perfilAtualizado = response.data?.data || formData;

        setPerfis((prev) =>
          prev.map((p) =>
            p.id_perfil === formData.id_perfil ? perfilAtualizado : p
          )
        );

        toast.success("Perfil atualizado com sucesso!");
      } else {
        response = await api.post("/perfis", formData);
        const novoPerfil = response.data?.data || formData;

        if (!novoPerfil.data_criacao) {
          novoPerfil.data_criacao = new Date().toISOString();
        }

        setPerfis((prev) => [novoPerfil, ...prev]);
        setPaginaPerfis(1);

        toast.success("Perfil criado com sucesso!");
      }

      fecharModal();
    } catch (e) {
      console.error(e);

      let msg = "Não foi possível salvar o perfil.";

      if (e.response?.data?.errors) {
        const erros = e.response.data.errors;

        if (erros.nome_perfil)
          msg = "Já existe um perfil com esse nome.";
        else {
          const campo = Object.keys(erros)[0];
          msg = erros[campo][0] || msg;
        }
      }

      toast.error(msg);
    }
  };

  // === ❌ Excluir perfil ===
  const excluirPerfil = async (p) => {
    const ok = window.confirm(`Excluir o perfil "${p.nome_perfil}"?`);
    if (!ok) return;

    try {
      await api.delete(`/perfis/${p.id_perfil}`);
      setPerfis((prev) => prev.filter((x) => x.id_perfil !== p.id_perfil));

      toast.success("Perfil excluído com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível excluir o perfil.");
    }
  };

  // === 🔄 Permissões ===
  const togglePermissao = (idPermissao) => {
    setFormData((prev) => {
      const jaTem = prev.permissoes.includes(idPermissao);
      return {
        ...prev,
        permissoes: jaTem
          ? prev.permissoes.filter((id) => id !== idPermissao)
          : [...prev.permissoes, idPermissao],
      };
    });
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return "—";
    const data = new Date(dataStr);
    return data.toLocaleDateString("pt-BR");
  };

  // === 🧮 Agrupar permissões por módulo ===
  const permissoesPorModulo = useMemo(() => {
    const grupos = {};
    permissoes.forEach((p) => {
      if (!grupos[p.nome_modulo]) grupos[p.nome_modulo] = [];
      grupos[p.nome_modulo].push(p);
    });
    return grupos;
  }, [permissoes]);

  const modulos = Object.entries(permissoesPorModulo);
  const totalModulos = modulos.length;
  const moduloAtual = modulos[paginaPermissoes - 1];

  // === 🧱 Render ===
  return (
    <div className="perfil-page enter-down">
      <header className="perfil-header">
        <div className="perfil-header-top">
          <button className="back-btn" onClick={() => navigate("/home")}>
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="breadcrumb">
          <span className="crumb" onClick={() => navigate("/home")}>
            Home
          </span>
          <span className="sep">›</span>
          <span className="crumb active">Perfis</span>
        </nav>

        <div className="perfil-search">
          <input
            type="text"
            placeholder="Buscar por nome ou descrição…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaPerfis(1);
            }}
          />
        </div>

        <div className="perfil-actions">
          <select
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPaginaPerfis(1);
            }}
          >
            <option value="ATIVO">🟢 Ativos</option>
            <option value="INATIVO">🔴 Inativos</option>
            <option value="">📋 Todos</option>
          </select>

          <button onClick={() => abrirModal(null)}>
            <PlusCircle size={16} style={{ marginRight: 6 }} />
            Adicionar Perfil
          </button>
        </div>
      </header>

      <main className="perfil-content">
        {carregando && (
          <div className="perfil-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="perfil-card skeleton">
                <div className="skeleton-bar w-60"></div>
                <div className="skeleton-bar w-50"></div>
                <div className="skeleton-bar w-40"></div>
              </div>
            ))}
          </div>
        )}

        {!carregando && erro && <p className="error">{erro}</p>}
        {!carregando && !erro && paginaAtual.length === 0 && (
          <p className="hint">Nenhum perfil encontrado.</p>
        )}

        {!carregando && !erro && (
          <div className="perfil-grid">
            {paginaAtual.map((p) => (
              <article key={p.id_perfil} className="perfil-card fade-in">
                <div className="card-actions">
                  <button
                    className="icon-btn"
                    title="Editar"
                    onClick={() => abrirModal(p)}
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    className="icon-btn danger"
                    title="Excluir"
                    onClick={() => excluirPerfil(p)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="perfil-name">{p.nome_perfil}</h3>
                <p className="perfil-line">
                  <strong>Descrição:</strong> {p.descricao || "—"}
                </p>
                <p className="perfil-line">
                  <strong>Criado em:</strong> {formatarData(p.data_criacao)}
                </p>

                <p className={`status ${p.status === "ATIVO" ? "ok" : "off"}`}>
                  {p.status || "ATIVO"}
                </p>
              </article>
            ))}
          </div>
        )}

        {totalPaginasPerfis > 1 && (
          <div className="paginacao">
            <button
              className="page-btn"
              disabled={paginaPerfis === 1}
              onClick={() => setPaginaPerfis((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span className="page-info">
              {paginaPerfis} / {totalPaginasPerfis}
            </span>
            <button
              className="page-btn"
              disabled={paginaPerfis === totalPaginasPerfis}
              onClick={() =>
                setPaginaPerfis((p) => Math.min(totalPaginasPerfis, p + 1))
              }
            >
              Próxima
            </button>
          </div>
        )}
      </main>

      {openModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>
              <X size={18} />
            </button>
            <h4>{editMode ? "Editar Perfil" : "Adicionar Perfil"}</h4>

            <form onSubmit={salvarPerfil} className="modal-form">
              <label>
                Nome do Perfil
                <input
                  type="text"
                  value={formData.nome_perfil}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, nome_perfil: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, descricao: e.target.value }))
                  }
                  rows={3}
                ></textarea>
              </label>

              <label>
                Status
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, status: e.target.value }))
                  }
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </label>

              <div className="permissoes-grid">
                <h5>Permissões</h5>

                {moduloAtual ? (
                  <div
                    key={moduloAtual[0]}
                    className="perm-bloco"
                    style={{
                      borderLeft: `4px solid ${
                        moduloAtual[1].some((perm) =>
                          formData.permissoes.includes(perm.id_permissao)
                        )
                          ? "#4caf50"
                          : "#ccc"
                      }`,
                      paddingLeft: "10px",
                    }}
                  >
                    <strong style={{ fontSize: "1rem" }}>
                      {moduloAtual[0]}
                    </strong>

                    <div className="perm-linha">
                      {["I", "A", "E", "C"].map((acao) => {
                        const perm = moduloAtual[1].find(
                          (p) => p.acao === acao
                        );
                        return (
                          <label
                            key={acao}
                            className="perm-item"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.9rem",
                              background: "#fafafa",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              cursor: "pointer",
                            }}
                          >
                            {perm ? (
                              <>
                                <input
                                  type="checkbox"
                                  checked={formData.permissoes.includes(
                                    perm.id_permissao
                                  )}
                                  onChange={() =>
                                    togglePermissao(perm.id_permissao)
                                  }
                                />
                                {perm.acao === "I" && "Incluir"}
                                {perm.acao === "A" && "Alterar"}
                                {perm.acao === "E" && "Excluir"}
                                {perm.acao === "C" && "Consultar"}
                              </>
                            ) : (
                              "-"
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    Nenhum módulo de permissão disponível.
                  </p>
                )}

                {/* Paginação interna dos módulos */}
                {totalModulos > 1 && (
                  <div
                    className="perm-paginacao"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "14px",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={paginaPermissoes === 1}
                      onClick={() =>
                        setPaginaPermissoes((p) => Math.max(1, p - 1))
                      }
                    >
                      ← Anterior
                    </button>
                    <span style={{ fontSize: "0.9rem", color: "#444" }}>
                      {paginaPermissoes} / {totalModulos}
                    </span>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={paginaPermissoes === totalModulos}
                      onClick={() =>
                        setPaginaPermissoes((p) =>
                          Math.min(totalModulos, p + 1)
                        )
                      }
                    >
                      Próximo →
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
