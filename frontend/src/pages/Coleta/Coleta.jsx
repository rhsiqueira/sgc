import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Coleta.css";
import { ChevronLeft, Edit3, Trash2, PlusCircle } from "lucide-react";
import ColetaModal from "./ColetaModal";

export default function Coleta() {
  const navigate = useNavigate();

  const [coletas, setColetas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState(""); // ✅ novo filtro
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [coletaSelecionada, setColetaSelecionada] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const POR_PAGINA = 3;

  // === 🧭 Buscar coletas e clientes ===
  const fetchColetas = async () => {
    try {
      setCarregando(true);
      const { data } = await api.get("/coletas");
      const lista = Array.isArray(data)
        ? data
        : data.data || data.coletas || [];
      setColetas(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar as coletas.");
    } finally {
      setTimeout(() => setCarregando(false), 600);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data } = await api.get("/clientes");
      const lista = Array.isArray(data)
        ? data
        : data.data || data.clientes || [];
      setClientes(lista);
    } catch (e) {
      console.error("Erro ao carregar clientes:", e);
    }
  };

  useEffect(() => {
    fetchColetas();
    fetchClientes();
  }, []);

  // === 🔍 Filtro e ordenação ===
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let base = [...coletas].sort(
      (a, b) => new Date(b.data_coleta) - new Date(a.data_coleta)
    );

    if (termo) {
      base = base.filter(
        (c) =>
          c.status?.toLowerCase().includes(termo) ||
          c.observacao?.toLowerCase().includes(termo) ||
          c.id_coleta?.toString().includes(termo)
      );
    }

    // ✅ aplica o filtro de status
    if (filtroStatus) {
      base = base.filter(
        (c) => c.status?.toUpperCase() === filtroStatus.toUpperCase()
      );
    }

    return base;
  }, [coletas, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtradas.slice(inicio, inicio + POR_PAGINA);

  // === 🧩 Modal ===
  const abrirModal = (coleta = null) => {
    setEditMode(!!coleta);
    setColetaSelecionada(coleta);
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setColetaSelecionada(null);
  };

  // === 💾 Salvar Coleta ===
  const salvarColeta = async (dados) => {
    try {
      if (editMode && dados.id_coleta) {
        const { data } = await api.put(`/coletas/${dados.id_coleta}`, dados);
        const atualizada = data?.data || dados;
        setColetas((prev) =>
          prev.map((c) =>
            c.id_coleta === dados.id_coleta ? atualizada : c
          )
        );
      } else {
        const { data } = await api.post("/coletas", dados);
        const nova =
          data?.data || (Array.isArray(data) ? data[0] : data) || dados;
        setColetas((prev) => [...prev, nova]);
      }

      fecharModal();
    } catch (e) {
      console.error("Erro ao salvar coleta:", e);
      alert("Não foi possível salvar a coleta.");
    }
  };

  // === ❌ Excluir ===
  const excluirColeta = async (c) => {
    const ok = window.confirm(`Excluir coleta #${c.id_coleta}?`);
    if (!ok) return;
    try {
      await api.delete(`/coletas/${c.id_coleta}`);
      setColetas((prev) => prev.filter((x) => x.id_coleta !== c.id_coleta));
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir coleta.");
    }
  };

  // === 🧮 Utilidades ===
  const formatarData = (data) => {
    if (!data) return "—";
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  };

  const nomeCliente = (id) =>
    clientes.find((c) => c.id_cliente === id)?.nome_fantasia ||
    clientes.find((c) => c.id_cliente === id)?.razao_social ||
    "—";

  // === 🧱 Render ===
  return (
    <div className="coleta-page enter-down">
      {/* Header */}
      <header className="coleta-header">
        <div className="coleta-header-top">
          <button className="back-btn" onClick={() => navigate("/home")}>
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="breadcrumb">
          <span className="crumb" onClick={() => navigate("/home")}>
            Home
          </span>
          <span className="sep">›</span>
          <span className="crumb active">Coletas</span>
        </nav>

        <div className="coleta-search">
          <input
            type="text"
            placeholder="Buscar por status, observação ou ID…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="coleta-actions">
          {/* ✅ Novo filtro de status */}
          <select
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">📋 Todas</option>
            <option value="EM ANDAMENTO">🟡 Em Andamento</option>
            <option value="CONCLUIDA">🟢 Concluídas</option>
            <option value="PENDENTE">🟠 Pendentes</option>
            <option value="INATIVA">🔴 Inativas</option>
          </select>

          <button onClick={() => abrirModal(null)}>
            <PlusCircle size={16} style={{ marginRight: 6 }} />
            Nova Coleta
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="coleta-content">
        {carregando && (
          <div className="coleta-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="coleta-card skeleton">
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
          <p className="hint">Nenhuma coleta encontrada.</p>
        )}

        {!carregando && !erro && (
          <>
            <div className="coleta-grid">
              {paginaAtual.map((c) => {
                const cliente = clientes.find(
                  (cli) => cli.id_cliente === c.id_cliente
                );
                const isExpandido = expandido === c.id_coleta;

                return (
                  <article
                    key={c.id_coleta}
                    className={`coleta-card fade-in ${
                      isExpandido ? "expandido" : ""
                    }`}
                    onClick={() =>
                      setExpandido(isExpandido ? null : c.id_coleta)
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
                          excluirColeta(c);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="coleta-id">Coleta #{c.id_coleta}</h3>
                    <h4 className="coleta-nome">
                      {cliente?.nome_fantasia || "—"}
                    </h4>

                    <p className="coleta-line">
                      <strong>Data:</strong> {formatarData(c.data_coleta)}
                    </p>
                    <p className="coleta-line">
                      <strong>Qtd Total:</strong> {c.quantidade_total ?? "—"}
                    </p>

                    {isExpandido && (
                      <div className="coleta-detalhes fade-in">
                        <p>{cliente?.nome_responsavel || "—"}</p>
                        <p>{cliente?.endereco || "—"}</p>
                        <p>{cliente?.dias_funcionamento || "—"}</p>
                      </div>
                    )}

                    <p
                      className={`status ${
                        c.status === "CONCLUIDA"
                          ? "ok"
                          : c.status === "CANCELADA" || c.status === "INATIVA"
                          ? "off"
                          : ""
                      }`}
                    >
                      {c.status}
                    </p>
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

      <ColetaModal
        open={openModal}
        onClose={fecharModal}
        onSave={salvarColeta}
        coletaEdit={coletaSelecionada}
      />
    </div>
  );
}
