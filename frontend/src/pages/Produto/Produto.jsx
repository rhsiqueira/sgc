import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Produto.css";
import { ChevronLeft, Edit3, Trash2, X, PlusCircle } from "lucide-react";

// 🔥 Toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Produto() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroEstoque, setFiltroEstoque] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id_produto: null,
    nome_produto: "",
    unidade: "",
    quantidade_atual: "",
    quantidade_minima: "",
    valor_custo: "",
    valor_venda: "",
    status: "ATIVO",
  });

  const POR_PAGINA = 3;

  // === Carregar produtos ===
  const fetchProdutos = async () => {
    try {
      setCarregando(true);
      setErro("");

      const { data } = await api.get("/produtos");
      const lista = Array.isArray(data.data) ? data.data : [];

      setProdutos(lista);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os produtos.");
      toast.error("Não foi possível carregar os produtos.");
    } finally {
      setTimeout(() => setCarregando(false), 800);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // === Filtro e paginação ===
  const filtrados = useMemo(() => {
    let lista = produtos;

    const termo = busca.trim().toLowerCase();
    if (termo) {
      lista = lista.filter(
        (p) =>
          p.nome_produto?.toLowerCase().includes(termo) ||
          p.unidade?.toLowerCase().includes(termo)
      );
    }

    if (filtroEstoque === "baixo") {
      lista = lista.filter((p) => p.quantidade_atual < p.quantidade_minima);
    } else if (filtroEstoque === "limite") {
      lista = lista.filter((p) => p.quantidade_atual === p.quantidade_minima);
    } else if (filtroEstoque === "acima") {
      lista = lista.filter((p) => p.quantidade_atual > p.quantidade_minima);
    }

    return lista;
  }, [produtos, busca, filtroEstoque]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = filtrados.slice(inicio, inicio + POR_PAGINA);

  // === Modal ===
  const abrirModal = (produto = null) => {
    if (produto) {
      setEditMode(true);
      setFormData({
        id_produto: produto.id_produto,
        nome_produto: produto.nome_produto || "",
        unidade: produto.unidade || "",
        quantidade_atual:
          produto.quantidade_atual === null ? "" : String(produto.quantidade_atual),
        quantidade_minima:
          produto.quantidade_minima === null ? "" : String(produto.quantidade_minima),
        valor_custo: produto.valor_custo === null ? "" : String(produto.valor_custo),
        valor_venda: produto.valor_venda === null ? "" : String(produto.valor_venda),
        status: produto.status || "ATIVO",
      });
    } else {
      setEditMode(false);
      setFormData({
        id_produto: null,
        nome_produto: "",
        unidade: "",
        quantidade_atual: "",
        quantidade_minima: "",
        valor_custo: "",
        valor_venda: "",
        status: "ATIVO",
      });
    }

    setOpenModal(true);
  };

  const fecharModal = () => setOpenModal(false);

  // === CRUD ===
  const salvarProduto = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        quantidade_atual: Number(formData.quantidade_atual) || 0,
        quantidade_minima: Number(formData.quantidade_minima) || 0,
        valor_custo: Number(formData.valor_custo) || 0,
        valor_venda: Number(formData.valor_venda) || 0,
      };

      if (editMode) {
        const { data } = await api.put(`/produtos/${formData.id_produto}`, payload);

        setProdutos((prev) =>
          prev.map((p) =>
            p.id_produto === formData.id_produto ? { ...p, ...data.data } : p
          )
        );

        toast.success("Produto atualizado com sucesso.");
      } else {
        const { data } = await api.post("/produtos", payload);

        setProdutos((prev) => [...prev, data.data]);
        toast.success("Produto criado com sucesso.");
        setPagina(1);
      }

      fecharModal();
    } catch (err) {
      console.error(err);

      // Erros de validação (422)
      if (err.response?.data?.errors) {
        const erros = err.response.data.errors;
        const campo = Object.keys(erros)[0];
        toast.error(erros[campo][0]);
        return;
      }

      toast.error("Erro ao salvar o produto. Verifique os campos.");
    }
  };

  const excluirProduto = async (produto) => {
    const ok = window.confirm(`Excluir o produto "${produto.nome_produto}"?`);
    if (!ok) return;

    try {
      await api.delete(`/produtos/${produto.id_produto}`);

      setProdutos((prev) =>
        prev.filter((p) => p.id_produto !== produto.id_produto)
      );

      toast.success("Produto excluído com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir o produto.");
    }
  };

  const formatarValor = (valor) =>
    `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;

  const calcularPercentual = (p) => {
    if (!p.quantidade_minima) return 0;
    return Math.min(100, Math.round((p.quantidade_atual / p.quantidade_minima) * 100));
  };

  return (
    <div className="produto-page enter-down">
      {/* Header */}
      <header className="produto-header">
        <div className="produto-header-top">
          <button className="back-btn" onClick={() => navigate("/home")}>
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="breadcrumb">
          <span className="crumb" onClick={() => navigate("/home")}>
            Home
          </span>
          <span className="sep">›</span>
          <span className="crumb active">Produtos</span>
        </nav>

        <div className="produto-search">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="produto-actions">
          <select
            className="filtro-select"
            value={filtroEstoque}
            onChange={(e) => setFiltroEstoque(e.target.value)}
          >
            <option value="">🧮 Todos</option>
            <option value="baixo">🔴 Abaixo do mínimo</option>
            <option value="limite">🟡 No limite</option>
            <option value="acima">🟢 Acima do mínimo</option>
          </select>

          <button onClick={() => abrirModal(null)}>
            <PlusCircle size={16} style={{ marginRight: 6 }} />
            Adicionar Produto
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="produto-content">
        {carregando && (
          <div className="produto-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="produto-card skeleton">
                <div className="skeleton-bar w-60"></div>
                <div className="skeleton-bar w-40"></div>
                <div className="skeleton-bar w-50"></div>
              </div>
            ))}
          </div>
        )}

        {!carregando && erro && <p className="error">{erro}</p>}
        {!carregando && !erro && paginaAtual.length === 0 && (
          <p className="hint">Nenhum produto encontrado.</p>
        )}

        {!carregando && !erro && (
          <>
            <div className="produto-grid">
              {paginaAtual.map((p) => {
                const perc = calcularPercentual(p);
                const estoqueBaixo = p.quantidade_atual < p.quantidade_minima;

                return (
                  <article
                    key={p.id_produto}
                    className={`produto-card fade-in ${
                      estoqueBaixo ? "low-stock" : "ok-stock"
                    }`}
                  >
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
                        onClick={() => excluirProduto(p)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="produto-name">{p.nome_produto}</h3>

                    <p className="produto-line">
                      <strong>Unidade:</strong> {p.unidade || "—"}
                    </p>

                    <p className="produto-line">
                      <strong>Qtd:</strong> {p.quantidade_atual} / {p.quantidade_minima}
                    </p>

                    <div className="stock-bar">
                      <div
                        className={`stock-fill ${estoqueBaixo ? "low" : ""}`}
                        style={{ width: `${perc}%` }}
                      ></div>
                    </div>

                    <p className="produto-line valor">
                      <strong>Venda:</strong> {formatarValor(p.valor_venda)}
                    </p>

                    <p className={`status ${p.status === "ATIVO" ? "ok" : "off"}`}>
                      {p.status}
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
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 🔥 Toasts */}
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Modal */}
      {openModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>
              <X size={18} />
            </button>

            <h4>{editMode ? "Editar Produto" : "Adicionar Produto"}</h4>

            <form onSubmit={salvarProduto} className="modal-form">
              <label>
                Nome do Produto
                <input
                  type="text"
                  value={formData.nome_produto}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      nome_produto: e.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Unidade
                <select
                  value={formData.unidade}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, unidade: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione</option>
                  <option value="LITROS">LITROS</option>
                  <option value="UNIDADE">UNIDADE</option>
                  <option value="CAIXA">CAIXA</option>
                  <option value="PACOTE">PACOTE</option>
                </select>
              </label>

              <div className="row">
                <label>
                  Quantidade Atual
                  <input
                    type="number"
                    value={formData.quantidade_atual}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        quantidade_atual:
                          e.target.value === "" ? "" : e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Quantidade Mínima
                  <input
                    type="number"
                    value={formData.quantidade_minima}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        quantidade_minima:
                          e.target.value === "" ? "" : e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="row">
                <label>
                  Valor de Custo
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_custo}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        valor_custo:
                          e.target.value === "" ? "" : e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Valor de Venda
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_venda}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        valor_venda:
                          e.target.value === "" ? "" : e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

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
