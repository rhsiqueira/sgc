// C:\dev\sgc\frontend\src\pages\Coleta\Coleta.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Coleta.css";


// Ícones
import {
  ChevronLeft,
  Edit3,
  Trash2,
  PlusCircle,
  FileSignature,
} from "lucide-react";

// Modais
import ColetaModal from "./ColetaModal";
import GerarCertificado from "./GerarCertificado";


// Toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Coleta() {
  const navigate = useNavigate();

  const [coletas, setColetas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [coletaSelecionada, setColetaSelecionada] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [showConfirmCert, setShowConfirmCert] = useState(false);


  const POR_PAGINA = 3;

  // =============================
  // Fetch Coletas
  // =============================
  const fetchColetas = async () => {
    try {
      setCarregando(true);
      const { data } = await api.get("/coletas");
      const lista = Array.isArray(data) ? data : data.data || [];
      setColetas(lista);
    } catch (e) {
      setErro("Não foi possível carregar as coletas.");
      toast.error("Erro ao carregar coletas.");
    } finally {
      setTimeout(() => setCarregando(false), 500);
    }
  };

  // Fetch Clientes
  const fetchClientes = async () => {
    try {
      const { data } = await api.get("/clientes");
      const lista = Array.isArray(data.data) ? data.data : [];
      setClientes(lista.filter((c) => c.status === "ATIVO"));
    } catch (e) {
      console.error("Erro ao carregar clientes:", e);
      toast.error("Erro ao carregar clientes.");
    }
  };


  useEffect(() => {
    fetchColetas();
    fetchClientes();
  }, []);

  // =============================
  // Filtragem & Ordenação
  // =============================
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let base = [...coletas];

    base.sort((a, b) => new Date(b.data_coleta) - new Date(a.data_coleta));

    if (termo) {
      base = base.filter((c) => {
        const cli = clientes.find((x) => x.id_cliente === c.id_cliente);
        const nome = cli?.nome_fantasia?.toLowerCase() || "";
        const razao = cli?.razao_social?.toLowerCase() || "";
        const cnpj = cli?.cnpj_cpf || "";

        return (
          nome.includes(termo) ||
          razao.includes(termo) ||
          cnpj.includes(termo) ||
          c.status?.toLowerCase().includes(termo) ||
          c.observacao?.toLowerCase().includes(termo) ||
          c.id_coleta?.toString().includes(termo)
        );
      });
    }

    if (filtroStatus)
      base = base.filter(
        (c) => c.status?.toUpperCase() === filtroStatus.toUpperCase()
      );

    return base;
  }, [coletas, clientes, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtradas.slice(inicio, inicio + POR_PAGINA);

  // =============================
  // Helpers
  // =============================
  const clientePorId = (id) => clientes.find((c) => c.id_cliente === id);

  const formatarData = (data) =>
    data ? new Date(data).toLocaleDateString("pt-BR") : "—";

  // =============================
  // Modal de Coleta (CRUD)
  // =============================
  const abrirModal = (c = null) => {
    setEditMode(!!c);
    setColetaSelecionada(c);
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setColetaSelecionada(null);
  };

  const salvarColeta = async (dados) => {
    try {
      if (editMode) {
        const { data } = await api.put(`/coletas/${dados.id_coleta}`, dados);

        setColetas((prev) =>
          prev.map((c) =>
            c.id_coleta === dados.id_coleta ? data?.data || dados : c
          )
        );

        toast.success("Coleta atualizada com sucesso.");
      } else {
        const { data } = await api.post("/coletas", dados);
        setColetas((prev) => [data?.data || data, ...prev]);

        toast.success("Coleta criada com sucesso.");
        setPagina(1);
      }

      fecharModal();
    } catch (e) {
      console.error(e);

      if (e.response?.status === 422 && e.response?.data?.errors) {
        const campo = Object.keys(e.response.data.errors)[0];
        toast.error(e.response.data.errors[campo][0]);
        return;
      }

      toast.error("Erro ao salvar coleta.");
    }
  };

  const excluirColeta = async (c) => {
    if (!window.confirm(`Excluir coleta #${c.id_coleta}?`)) return;

    try {
      await api.delete(`/coletas/${c.id_coleta}`);
      setColetas((prev) => prev.filter((x) => x.id_coleta !== c.id_coleta));
      toast.success("Coleta excluída com sucesso.");
    } catch {
      toast.error("Erro ao excluir coleta.");
    }
  };


  // =============================
  // RENDER
  // =============================
  return (
    <div className="coleta-page enter-down">
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
            placeholder="Buscar por cliente, status, observação ou ID…"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="coleta-actions" style={{ gap: 8 }}>
          <select
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">📋 Todas</option>
            <option value="EM_ANDAMENTO">🟡 Em Andamento</option>
            <option value="CONCLUIDA">🟢 Concluídas</option>
            <option value="PENDENTE">🟠 Pendentes</option>
            <option value="INATIVA">🔴 Inativas</option>
            <option value="CANCELADA">⛔ Canceladas</option>
          </select>

          <button style={{ width: "60%" }} onClick={() => abrirModal(null)}>
            <PlusCircle size={16} />
            Nova Coleta
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="coleta-content">
        {carregando && (
          <div className="coleta-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="coleta-card skeleton">
                <div className="skeleton-bar w-60"></div>
                <div className="skeleton-bar w-50"></div>
                <div className="skeleton-bar w-40"></div>
              </div>
            ))}
          </div>
        )}

        {!carregando && erro && <p>{erro}</p>}

        {!carregando && !erro && (
          <div className="coleta-grid">
            {paginaAtual.map((c) => {
              const cli = clientePorId(c.id_cliente);
              const isExpandido = expandido === c.id_coleta;

              let cardCls = "coleta-card fade-in";
              if (isExpandido) cardCls += " expandido";
              if (expandido && !isExpandido) cardCls += " oculto";

              return (
                <article
                  key={c.id_coleta}
                  className={cardCls}
                  onClick={() =>
                    setExpandido(isExpandido ? null : c.id_coleta)
                  }
                >
                  <div className="card-actions">
                    {/* 🔵 Botão de certificado (à esquerda de Editar) */}
                    <button
                      className="icon-btn"
                      title="Gerar certificado"
                      onClick={(e) => {
                        e.stopPropagation();

                        setColetaSelecionada(c);   // guarda coleta
                        setShowConfirmCert(true);  // abre modal de confirmação
                      }}
                    >
                      <FileSignature size={18} />
                    </button>

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
                    {cli?.nome_fantasia || cli?.razao_social || "—"}
                  </h4>

                  <p className="coleta-line">
                    <strong>Data:</strong> {formatarData(c.data_coleta)}
                  </p>

                  <p className="coleta-line">
                    <strong>Total:</strong>{" "}
                    {c.quantidade_total ? `${c.quantidade_total} L` : "—"}
                  </p>

                  <p
                    className={`status ${c.status === "CONCLUIDA" ? "ok" : ""
                      }`}
                  >
                    {c.status}
                  </p>

                  {/* EXPANDIDO */}
                  {isExpandido && (
                    <div className="coleta-detalhes fade-in">
                      {/* BLOCO CLIENTE */}
                      <div className="coleta-bloco">
                        <h4 className="coleta-bloco-titulo">Cliente</h4>

                        <p className="coleta-bloco-item">
                          <strong>Responsável:</strong>{" "}
                          {cli?.nome_responsavel || "—"}
                        </p>

                        <p className="coleta-bloco-item">
                          <strong>Telefone:</strong>{" "}
                          {cli?.telefone_celular ||
                            cli?.telefone_fixo ||
                            "—"}
                        </p>

                        <p className="coleta-bloco-item">
                          <strong>Endereço:</strong>{" "}
                          {cli
                            ? `${cli.endereco || "—"}, ${cli.numero || ""
                            } - ${cli.bairro || ""} - ${cli.cidade || ""
                            } / ${cli.estado || ""}`
                            : "—"}
                        </p>

                        <p className="coleta-bloco-item">
                          <strong>Funcionamento:</strong>{" "}
                          {cli?.dias_funcionamento || "—"}
                        </p>
                      </div>

                      {/* BLOCO COLETA */}
                      <div className="coleta-bloco">
                        <h4 className="coleta-bloco-titulo">
                          Detalhes da Coleta
                        </h4>

                        {c.observacao && (
                          <p className="coleta-bloco-item">
                            <strong>Observação:</strong> {c.observacao}
                          </p>
                        )}

                        {(!c.compensacoes || !c.compensacoes.length) &&
                          (!c.produtos || !c.produtos.length) && (
                            <p className="coleta-bloco-item">
                              Nenhuma compensação registrada.
                            </p>
                          )}

                        {c.compensacoes?.map((cp) => (
                          <p
                            key={cp.id_coleta_compensacao}
                            className="coleta-bloco-item"
                          >
                            <strong>
                              {cp.id_tipo === 1
                                ? "Pagamento Imediato (PIX)"
                                : cp.id_tipo === 2
                                  ? "Crédito em Loja"
                                  : "Troca por Produto"}
                              :
                            </strong>{" "}
                            {cp.quantidade} L
                          </p>
                        ))}

                        {c.produtos?.map((p) => (
                          <p
                            key={p.id_coleta_produto}
                            className="coleta-bloco-item"
                          >
                            <strong>{p.produto?.nome_produto}</strong>:{" "}
                            {p.quantidade} un
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!expandido && totalPaginas > 1 && !carregando && (
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
      </main>


      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Modal principal de Coleta */}
      <ColetaModal
        open={openModal}
        onClose={fecharModal}
        onSave={salvarColeta}
        coletaEdit={coletaSelecionada}
      />
      <GerarCertificado
        open={showConfirmCert}
        coleta={coletaSelecionada}
        onClose={() => setShowConfirmCert(false)}
        onConfirm={(col, assinaturaBase64) => {
          setShowConfirmCert(false);

          navigate(`/coletas/certificado/${col.id_coleta}`, {
            state: { assinaturaBase64 },
          });
        }}
      />
    </div>
  );
}
