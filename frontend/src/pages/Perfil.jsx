import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Perfil.css";
import { ChevronLeft, Edit3, Trash2, X, PlusCircle } from "lucide-react";

export default function Perfil() {
  const navigate = useNavigate();

  const [perfis, setPerfis] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id_perfil: null,
    nome_perfil: "",
    descricao: "",
    permissoes: [],
    status: "ATIVO", // ✅ novo campo
  });

  const POR_PAGINA = 3;

  const fetchPerfis = async () => {
    try {
      setCarregando(true);
      const { data } = await api.get("/perfis");
      const lista = Array.isArray(data.data) ? data.data : [];
      setPerfis(lista);
    } catch (e) {
      setErro("Não foi possível carregar os perfis.");
      console.error(e);
    } finally {
      setTimeout(() => setCarregando(false), 800);
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

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return perfis;
    return perfis.filter(
      (p) =>
        p.nome_perfil?.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo)
    );
  }, [perfis, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtrados.slice(inicio, inicio + POR_PAGINA);

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
    setPagina(1);
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

  const salvarPerfil = async (e) => {
    e.preventDefault();

    const incompletos = Object.entries(permissoesPorModulo).filter(
      ([, lista]) =>
        !lista.some((perm) => formData.permissoes.includes(perm.id_permissao))
    );

    if (incompletos.length > 0) {
      alert(
        `Você precisa selecionar ao menos uma permissão em todos os módulos antes de salvar.\n\nMódulos pendentes:\n- ${incompletos
          .map(([mod]) => mod)
          .join("\n- ")}`
      );
      return;
    }

    try {
      if (editMode) {
        await api.put(`/perfis/${formData.id_perfil}`, formData);
      } else {
        await api.post("/perfis", formData);
      }
      fecharModal();
      fetchPerfis();
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar o perfil.");
    }
  };

  const excluirPerfil = async (p) => {
    const ok = window.confirm(`Excluir o perfil "${p.nome_perfil}"?`);
    if (!ok) return;
    try {
      await api.delete(`/perfis/${p.id_perfil}`);
      fetchPerfis();
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir o perfil.");
    }
  };

  // ✅ preservado — usado dentro do modal
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

  const permissoesPorModulo = useMemo(() => {
    const grupos = {};
    permissoes.forEach((p) => {
      if (!grupos[p.nome_modulo]) grupos[p.nome_modulo] = [];
      grupos[p.nome_modulo].push(p);
    });
    return grupos;
  }, [permissoes]);

  // ✅ preservados e usados
  const totalModulos = Object.entries(permissoesPorModulo).length;
  const moduloAtual = Object.entries(permissoesPorModulo).slice(
    pagina - 1,
    pagina
  );

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
              setPagina(1);
            }}
          />
        </div>

        {/* ✅ botão padronizado com Usuário */}
        <div className="perfil-actions">
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

                {/* ✅ status igual ao módulo Usuário */}
                <p className={`status ${p.status === "ATIVO" ? "ok" : "off"}`}>
                  {p.status || "ATIVO"}
                </p>
              </article>
            ))}
          </div>
        )}

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

              {/* ✅ Campo status */}
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

              {/* 🔹 Permissões (mantidas completas e funcionais) */}
              <div className="permissoes-grid">
                <h5>Permissões</h5>

                {moduloAtual.map(([modulo, lista]) => {
                  const preenchido = lista.some((perm) =>
                    formData.permissoes.includes(perm.id_permissao)
                  );
                  return (
                    <div
                      key={modulo}
                      className="perm-bloco"
                      style={{
                        borderLeft: `4px solid ${
                          preenchido ? "#4caf50" : "#ccc"
                        }`,
                        paddingLeft: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "1rem" }}>{modulo}</strong>
                      <div
                        className="perm-linha"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginTop: "8px",
                        }}
                      >
                        {["I", "A", "E", "C"].map((acao) => {
                          const perm = lista.find((p) => p.acao === acao);
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
                  );
                })}

                {totalModulos > 1 && (
                  <div className="perm-paginacao">
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={pagina === 1}
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    >
                      ← Anterior
                    </button>
                    <span style={{ fontSize: "0.9rem", color: "#444" }}>
                      {pagina} / {totalModulos}
                    </span>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={pagina === totalModulos}
                      onClick={() =>
                        setPagina((p) => Math.min(totalModulos, p + 1))
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
    </div>
  );
}
