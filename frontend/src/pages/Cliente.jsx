import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Cliente.css";
import { ChevronLeft, Edit3, Trash2, X, PlusCircle } from "lucide-react";

export default function Cliente() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(null);

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
  });

  const POR_PAGINA = 3;

  // ===== 🔹 Máscaras =====
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

  const formatarCEP = (valor) => {
    return valor.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  };

  // ===== 🔹 Fetch =====
  const fetchClientes = async () => {
    try {
      setCarregando(true);
      const { data } = await api.get("/clientes");
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
  }, []);

  // ===== 🔹 Filtro & Paginação =====
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(
      (c) =>
        c.razao_social?.toLowerCase().includes(termo) ||
        c.nome_fantasia?.toLowerCase().includes(termo) ||
        c.cnpj_cpf?.includes(termo)
    );
  }, [clientes, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtrados.slice(inicio, inicio + POR_PAGINA);

  // ===== 🔹 Modal =====
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setEditMode(true);
      setFormData({ ...cliente, status: cliente.status || "ATIVO" });
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
      });
    }
    setEtapa(1);
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setEtapa(1);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/clientes/${formData.id_cliente}`, formData);
        setClientes((prev) =>
          prev.map((c) =>
            c.id_cliente === formData.id_cliente ? { ...c, ...formData } : c
          )
        );
      } else {
        const { data } = await api.post("/clientes", formData);
        if (data.data) setClientes((prev) => [...prev, data.data]);
      }
      fecharModal();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o cliente. Verifique os campos obrigatórios.");
    }
  };

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

  return (
    <div className="cliente-page enter-down">
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

        <div className="cliente-actions">
          <button onClick={() => abrirModal(null)}>
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

      {/* ===== Modal Compacto ===== */}
      {openModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>
              <X size={18} />
            </button>
            <h4>{editMode ? "Editar Cliente" : "Adicionar Cliente"}</h4>
            <p className="modal-etapa">Etapa {etapa} de 2</p>

            <form onSubmit={salvarCliente} className="modal-form">
              {etapa === 1 && (
                <>
                  <label>Razão Social
                    <input
                      type="text"
                      value={formData.razao_social}
                      onChange={(e) => setFormData(d => ({ ...d, razao_social: e.target.value }))}
                      required
                    />
                  </label>

                  <label>Nome Fantasia
                    <input
                      type="text"
                      value={formData.nome_fantasia}
                      onChange={(e) => setFormData(d => ({ ...d, nome_fantasia: e.target.value }))}
                    />
                  </label>

                  <label>CNPJ / CPF
                    <input
                      type="text"
                      value={formData.cnpj_cpf}
                      onChange={(e) => setFormData(d => ({ ...d, cnpj_cpf: formatarCNPJ(e.target.value) }))}
                      required
                    />
                  </label>

                  <label>Nome do Responsável
                    <input
                      type="text"
                      value={formData.nome_responsavel}
                      onChange={(e) => setFormData(d => ({ ...d, nome_responsavel: e.target.value }))}
                    />
                  </label>

                  <label>E-mail Comercial
                    <input
                      type="email"
                      value={formData.email_comercial}
                      onChange={(e) => setFormData(d => ({ ...d, email_comercial: e.target.value }))}
                    />
                  </label>

                  <label>Telefone Celular
                    <input
                      type="text"
                      value={formData.telefone_celular}
                      onChange={(e) => setFormData(d => ({ ...d, telefone_celular: e.target.value }))}
                    />
                  </label>

                  <label>Telefone Fixo
                    <input
                      type="text"
                      value={formData.telefone_fixo}
                      onChange={(e) => setFormData(d => ({ ...d, telefone_fixo: e.target.value }))}
                    />
                  </label>

                  <div className="modal-actions">
                    <button type="button" className="btn primary" onClick={() => setEtapa(2)}>
                      Próximo →
                    </button>
                  </div>
                </>
              )}

              {etapa === 2 && (
                <>
                  <label>Endereço
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => setFormData(d => ({ ...d, endereco: e.target.value }))}
                      required
                    />
                  </label>

                  <label>Número
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData(d => ({ ...d, numero: e.target.value }))}
                      required
                    />
                  </label>

                  <label>Bairro
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData(d => ({ ...d, bairro: e.target.value }))}
                      required
                    />
                  </label>

                  <label>Cidade
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData(d => ({ ...d, cidade: e.target.value }))}
                      required
                    />
                  </label>

                  <label>UF
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.estado}
                      onChange={(e) => setFormData(d => ({ ...d, estado: e.target.value.toUpperCase() }))}
                      required
                    />
                  </label>

                  <label>CEP
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData(d => ({ ...d, cep: formatarCEP(e.target.value) }))}
                    />
                  </label>

                  <label>Dias de Funcionamento
                    <input
                      type="text"
                      value={formData.dias_funcionamento}
                      onChange={(e) => setFormData(d => ({ ...d, dias_funcionamento: e.target.value }))}
                    />
                  </label>

                  <label>Observações
                    <input
                      type="text"
                      value={formData.observacoes}
                      onChange={(e) => setFormData(d => ({ ...d, observacoes: e.target.value }))}
                    />
                  </label>

                  <label>Status
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(d => ({ ...d, status: e.target.value }))}
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
      )}
    </div>
  );
}
