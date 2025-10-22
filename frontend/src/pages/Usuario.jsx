import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Usuario.css";
import { ChevronLeft, Edit3, Trash2, X, PlusCircle } from "lucide-react";

export default function Usuario() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Modal e form
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id_usuario: null,
    nome_completo: "",
    email: "",
    cpf: "",
    senha: "",
    id_perfil: "",
    status: "ATIVO",
  });

  const POR_PAGINA = 3;

  // === 🧭 Carregar usuários e perfis ===
  const fetchUsuarios = async () => {
    try {
      setCarregando(true);
      setErro("");
      const { data } = await api.get("/usuarios");
      const lista = Array.isArray(data) ? data : data.data || data.usuarios || [];
      setUsuarios(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setTimeout(() => setCarregando(false), 800);
    }
  };

  const fetchPerfis = async () => {
    try {
      const { data } = await api.get("/perfis");
      const lista = Array.isArray(data) ? data : data.data || data.perfis || [];
      setPerfis(lista);
    } catch (e) {
      console.error("Erro ao carregar perfis:", e);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis();
  }, []);

  // === 🔍 Filtro e ordenação ===
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const base = [...usuarios].sort((a, b) =>
      (a.nome_completo || "").localeCompare(b.nome_completo || "", "pt-BR")
    );
    if (!termo) return base;
    return base.filter(
      (u) =>
        u.nome_completo?.toLowerCase().includes(termo) ||
        u.email?.toLowerCase().includes(termo) ||
        u.cpf?.includes(termo)
    );
  }, [usuarios, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtrados.slice(inicio, inicio + POR_PAGINA);

  // === 🧩 Modal ===
  const abrirModal = (usuario = null) => {
    if (usuario) {
      setEditMode(true);
      setFormData({
        id_usuario: usuario.id_usuario,
        nome_completo: usuario.nome_completo || "",
        email: usuario.email || "",
        cpf: usuario.cpf || "",
        senha: "",
        id_perfil: usuario.id_perfil || "",
        status: usuario.status || "ATIVO",
      });
    } else {
      setEditMode(false);
      setFormData({
        id_usuario: null,
        nome_completo: "",
        email: "",
        cpf: "",
        senha: "",
        id_perfil: "",
        status: "ATIVO",
      });
    }
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
  };

  // === 💾 Salvar (criar ou editar) ===
  const salvarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/usuarios/${formData.id_usuario}`, formData);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id_usuario === formData.id_usuario ? { ...u, ...formData } : u
          )
        );
      } else {
        const { data } = await api.post("/usuarios", {
          nome_completo: formData.nome_completo,
          email: formData.email,
          cpf: formData.cpf,
          senha: formData.senha, // ✅ campo correto
          id_perfil: formData.id_perfil,
          status: formData.status,
        });
        setUsuarios((prev) => [...prev, data]);
      }
      fecharModal();
    } catch (e) {
      console.error(e);
      alert("Não foi possível salvar o usuário. Verifique os campos obrigatórios.");
    }
  };

  // === ❌ Excluir ===
  const excluirUsuario = async (u) => {
    const ok = window.confirm(`Excluir o usuário "${u.nome_completo}"?`);
    if (!ok) return;
    try {
      await api.delete(`/usuarios/${u.id_usuario}`);
      setUsuarios((prev) => prev.filter((x) => x.id_usuario !== u.id_usuario));
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir o usuário.");
    }
  };

  return (
    <div className="usuario-page enter-down">
      {/* Header */}
      <header className="usuario-header">
        <div className="usuario-header-top">
          <button
            className="back-btn"
            onClick={() => navigate("/home")}
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="breadcrumb">
          <span className="crumb" onClick={() => navigate("/home")}>
            Home
          </span>
          <span className="sep">›</span>
          <span className="crumb active">Usuários</span>
        </nav>

        <div className="usuario-search">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="usuario-actions">
          <button onClick={() => abrirModal(null)}>
            <PlusCircle size={16} style={{ marginRight: 6 }} />
            Adicionar Usuário
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="usuario-content">
        {carregando && (
          <div className="usuario-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="usuario-card skeleton">
                <div className="skeleton-bar w-60"></div>
                <div className="skeleton-bar w-50"></div>
                <div className="skeleton-bar w-40"></div>
                <div className="skeleton-pill"></div>
              </div>
            ))}
          </div>
        )}

        {!carregando && erro && <p className="error">{erro}</p>}

        {!carregando && !erro && paginaAtual.length === 0 && (
          <p className="hint">Nenhum usuário encontrado.</p>
        )}

        {!carregando && !erro && (
          <>
            <div className="usuario-grid">
              {paginaAtual.map((u) => (
                <article key={u.id_usuario} className="usuario-card fade-in">
                  <div className="card-actions">
                    <button
                      className="icon-btn"
                      title="Editar"
                      onClick={() => abrirModal(u)}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Excluir"
                      onClick={() => excluirUsuario(u)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="usuario-name">{u.nome_completo}</h3>
                  <p className="usuario-line">
                    <strong>E-mail:</strong> {u.email}
                  </p>
                  <p className="usuario-line">
                    <strong>CPF:</strong> {u.cpf}
                  </p>
                  <p className="usuario-line">
                    <strong>Perfil:</strong> {u.perfil?.nome_perfil || "—"}
                  </p>
                  <p className={`status ${u.status === "ATIVO" ? "ok" : "off"}`}>
                    {u.status}
                  </p>
                </article>
              ))}
            </div>

            {/* Paginação */}
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

      {/* Modal */}
      {openModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>
              <X size={18} />
            </button>
            <h4>{editMode ? "Editar Usuário" : "Adicionar Usuário"}</h4>

            <form onSubmit={salvarUsuario} className="modal-form">
              <label>
                Nome completo
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, nome_completo: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, email: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                CPF
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, cpf: e.target.value.replace(/\D/g, "") }))
                  }
                  maxLength={11}
                  required
                />
              </label>

              {!editMode && (
                <label>
                  Senha
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, senha: e.target.value }))
                    }
                    required
                  />
                </label>
              )}

              <div className="row">
                <label>
                  Perfil
                  <select
                    value={formData.id_perfil}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, id_perfil: Number(e.target.value) }))
                    }
                    required
                  >
                    <option value="">Selecione um perfil</option>
                    {perfis.map((p) => (
                      <option key={p.id_perfil} value={p.id_perfil}>
                        {p.nome_perfil}
                      </option>
                    ))}
                  </select>
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
