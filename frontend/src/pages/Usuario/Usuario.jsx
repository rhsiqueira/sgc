import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Usuario.css";
import {
  ChevronLeft,
  Edit3,
  Trash2,
  X,
  PlusCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// 🔥 Toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Usuario() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ATIVO");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const [formData, setFormData] = useState({
    id_usuario: null,
    nome_completo: "",
    email: "",
    cpf: "",
    senha: "",
    id_perfil: "",
    status: "ATIVO",
    resetarSenha: false,
    novaSenha: "",
    confirmarSenha: "",
  });

  const POR_PAGINA = 3;

  // ===========================
  // FETCH + useCallback
  // ===========================
  const fetchUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const { data } = await api.get("/usuarios");

      let lista = Array.isArray(data)
        ? data
        : data.data || data.usuarios || [];

      setUsuarios(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os usuários.");
      toast.error("Não foi possível carregar os usuários.");
    } finally {
      setTimeout(() => setCarregando(false), 500);
    }
  }, []);

  const fetchPerfis = useCallback(async () => {
    try {
      const { data } = await api.get("/perfis");
      let lista = Array.isArray(data)
        ? data
        : data.data || data.perfis || [];
      setPerfis(lista);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis();
  }, [fetchUsuarios, fetchPerfis]);

  // ===========================
  // CPF
  // ===========================
  const formatarCpf = (valor) => {
    if (!valor) return "";
    const num = valor.toString().replace(/\D/g, "").slice(0, 11);
    return num
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleCpfChange = (e) => {
    setFormData((d) => ({
      ...d,
      cpf: formatarCpf(e.target.value),
    }));
  };

  // ===========================
  // FILTRO + ORDENAR
  // ===========================
  const filtrados = useMemo(() => {
    let lista = [...usuarios];

    if (filtroStatus) {
      lista = lista.filter(
        (u) => u.status?.toUpperCase() === filtroStatus.toUpperCase()
      );
    }

    const termo = busca.trim().toLowerCase();
    if (termo) {
      lista = lista.filter(
        (u) =>
          u.nome_completo?.toLowerCase().includes(termo) ||
          u.email?.toLowerCase().includes(termo) ||
          u.cpf?.includes(termo)
      );
    }

    lista.sort(
      (a, b) =>
        new Date(b.data_criacao || 0) - new Date(a.data_criacao || 0)
    );

    return lista;
  }, [usuarios, busca, filtroStatus]);

  // ===========================
  // Paginação
  // ===========================
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtrados.slice(inicio, inicio + POR_PAGINA);

  // ===========================
  // Modal
  // ===========================
  const abrirModal = (usuario = null) => {
    if (usuario) {
      setEditMode(true);
      setFormData({
        id_usuario: usuario.id_usuario,
        nome_completo: usuario.nome_completo || "",
        email: usuario.email || "",
        cpf: formatarCpf(usuario.cpf),
        senha: "",
        id_perfil: usuario.id_perfil || "",
        status: usuario.status || "ATIVO",
        resetarSenha: false,
        novaSenha: "",
        confirmarSenha: "",
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
        resetarSenha: false,
        novaSenha: "",
        confirmarSenha: "",
      });
    }

    setShowPassword(false);
    setShowNovaSenha(false);
    setShowConfirmarSenha(false);

    setOpenModal(true);
  };

  const fecharModal = () => setOpenModal(false);

  // ===========================
  // Salvar
  // ===========================
  const salvarUsuario = async (e) => {
    e.preventDefault();

    // 🔥 VALIDAÇÃO DE CPF (somente o necessário)
    const rawCpf = formData.cpf.replace(/\D/g, "");
    if (rawCpf.length !== 11) {
      toast.error("CPF inválido. Insira um CPF com 11 dígitos.");
      return;
    }

    try {
      const payload = {
        ...formData,
        cpf: rawCpf,
      };

      // RESET DE SENHA
      if (editMode && formData.resetarSenha) {
        if (formData.novaSenha !== formData.confirmarSenha) {
          toast.error("As senhas não coincidem.");
          return;
        }

        await api.patch(
          `/usuarios/${formData.id_usuario}/redefinir-senha`,
          { nova_senha: formData.novaSenha }
        );

        toast.success("Senha redefinida com sucesso.");
      }

      let retorno;

      if (editMode) {
        const { data } = await api.put(
          `/usuarios/${formData.id_usuario}`,
          payload
        );
        retorno = data?.data || payload;

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id_usuario === retorno.id_usuario ? retorno : u
          )
        );

        toast.success("Usuário atualizado com sucesso.");
      } else {
        const { data } = await api.post("/usuarios", payload);
        retorno = data?.data || payload;

        if (!retorno.data_criacao) {
          retorno.data_criacao = new Date().toISOString();
        }

        setUsuarios((prev) => [retorno, ...prev]);
        setPagina(1);

        toast.success("Usuário criado com sucesso.");
      }

      fecharModal();
    } catch (e) {
      console.error(e);

      // mensagem de erro refinada
      let msg = "Não foi possível salvar o usuário.";

      if (e.response?.data?.errors) {
        const erros = e.response.data.errors;

        if (erros.cpf) msg = "CPF já está cadastrado.";
        else if (erros.email) msg = "Email já está cadastrado.";
        else {
          const campo = Object.keys(erros)[0];
          msg = erros[campo][0] || msg;
        }
      }

      toast.error(msg);
    }
  };

  // ===========================
  // Excluir
  // ===========================
  const excluirUsuario = async (u) => {
    if (!window.confirm(`Excluir o usuário "${u.nome_completo}"?`)) return;

    try {
      await api.delete(`/usuarios/${u.id_usuario}`);
      setUsuarios((prev) =>
        prev.filter((x) => x.id_usuario !== u.id_usuario)
      );

      toast.success("Usuário excluído.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir usuário.");
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="usuario-page enter-down">
      <header className="usuario-header">
        <div className="usuario-header-top">
          <button className="back-btn" onClick={() => navigate("/home")}>
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
            placeholder="Buscar por nome, email ou CPF…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="usuario-actions">
          <select
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPagina(1);
            }}
          >
            <option value="ATIVO">🟢 Ativos</option>
            <option value="INATIVO">🔴 Inativos</option>
            <option value="">📋 Todos</option>
          </select>

          <button onClick={() => abrirModal(null)}>
            <PlusCircle size={16} style={{ marginRight: 6 }} />
            Adicionar Usuário
          </button>
        </div>
      </header>

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
                    <button className="icon-btn" onClick={() => abrirModal(u)}>
                      <Edit3 size={18} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => excluirUsuario(u)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="usuario-name">{u.nome_completo}</h3>

                  <p className="usuario-line">
                    <strong>Email:</strong> {u.email}
                  </p>
                  <p className="usuario-line">
                    <strong>CPF:</strong> {formatarCpf(u.cpf)}
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

            {totalPaginas > 1 && (
              <div className="paginacao">
                <button
                  className="page-btn"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>

                <span className="page-info">
                  {pagina} / {totalPaginas}
                </span>

                <button
                  className="page-btn"
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* COMPONENTE DE TOAST */}
      <ToastContainer position="top-right" autoClose={2500} />

      {/* MODAL */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>
              <X size={18} />
            </button>

            <h4>{editMode ? "Editar Usuário" : "Adicionar Usuário"}</h4>

            <form className="modal-form" onSubmit={salvarUsuario}>
              <label>
                Nome completo
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      nome_completo: e.target.value,
                    }))
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
                    setFormData((d) => ({
                      ...d,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                CPF
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  required
                />
              </label>

              {!editMode && (
                <label className="senha-field">
                  Senha
                  <div className="senha-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          senha: e.target.value,
                        }))
                      }
                      required
                    />
                    <button
                      type="button"
                      className="senha-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              )}

              {editMode && (
                <>
                  <label className="checkbox-reset">
                    <input
                      type="checkbox"
                      checked={formData.resetarSenha}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          resetarSenha: e.target.checked,
                        }))
                      }
                    />
                    Redefinir senha
                  </label>

                  {formData.resetarSenha && (
                    <>
                      <label className="senha-field">
                        Nova senha
                        <div className="senha-wrapper">
                          <input
                            type={showNovaSenha ? "text" : "password"}
                            value={formData.novaSenha}
                            onChange={(e) =>
                              setFormData((d) => ({
                                ...d,
                                novaSenha: e.target.value,
                              }))
                            }
                            required
                          />
                          <button
                            type="button"
                            className="senha-toggle"
                            onClick={() => setShowNovaSenha((s) => !s)}
                          >
                            {showNovaSenha ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </label>

                      <label className="senha-field">
                        Confirmar senha
                        <div className="senha-wrapper">
                          <input
                            type={showConfirmarSenha ? "text" : "password"}
                            value={formData.confirmarSenha}
                            onChange={(e) =>
                              setFormData((d) => ({
                                ...d,
                                confirmarSenha: e.target.value,
                              }))
                            }
                            required
                          />
                          <button
                            type="button"
                            className="senha-toggle"
                            onClick={() =>
                              setShowConfirmarSenha((s) => !s)
                            }
                          >
                            {showConfirmarSenha ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </label>
                    </>
                  )}
                </>
              )}

              <div className="perfil-status-container">
                <label>
                  Perfil
                  <select
                    value={formData.id_perfil}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        id_perfil: Number(e.target.value),
                      }))
                    }
                    required
                  >
                    <option value="">Selecione</option>
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
                      setFormData((d) => ({
                        ...d,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={fecharModal}
                >
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
