import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Produto.css";
import { ChevronLeft, Edit3, Trash2, X, PlusCircle } from "lucide-react";

export default function Produto() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id_produto: null,
    nome_produto: "",
    unidade: "",
    quantidade_atual: 0,
    quantidade_minima: 0,
    valor_custo: 0,
    valor_venda: 0,
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
    } finally {
      setTimeout(() => setCarregando(false), 800);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // === Filtro e paginação ===
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter(
      (p) =>
        p.nome_produto?.toLowerCase().includes(termo) ||
        p.unidade?.toLowerCase().includes(termo)
    );
  }, [produtos, busca]);

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
        quantidade_atual: produto.quantidade_atual || 0,
        quantidade_minima: produto.quantidade_minima || 0,
        valor_custo: produto.valor_custo || 0,
        valor_venda: produto.valor_venda || 0,
        status: produto.status || "ATIVO",
      });
    } else {
      setEditMode(false);
      setFormData({
        id_produto: null,
        nome_produto: "",
        unidade: "",
        quantidade_atual: 0,
        quantidade_minima: 0,
        valor_custo: 0,
        valor_venda: 0,
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
      if (editMode) {
        await api.put(`/produtos/${formData.id_produto}`, formData);
        setProdutos((prev) =>
          prev.map((p) =>
            p.id_produto === formData.id_produto ? { ...p, ...formData } : p
          )
        );
      } else {
        const { data } = await api.post("/produtos", formData);
        setProdutos((prev) => [...prev, data.data]);
      }
      fecharModal();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o produto. Verifique os campos obrigatórios.");
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
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o produto.");
    }
  };

  const formatarValor = (valor) =>
    `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;

  const calcularPercentual = (p) => {
    if (!p.quantidade_minima) return 0;
    return Math.min(
      100,
      Math.round((p.quantidade_atual / p.quantidade_minima) * 100)
    );
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
            placeholder="Buscar por nome ou unidade..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="produto-actions">
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
                      <strong>Qtd:</strong> {p.quantidade_atual} /{" "}
                      {p.quantidade_minima}
                    </p>

                    <div className="stock-bar">
                      <div
                        className={`stock-fill ${
                          estoqueBaixo ? "low" : ""
                        }`}
                        style={{ width: `${perc}%` }}
                      ></div>
                    </div>

                    <p className="produto-line valor">
                      <strong>Venda:</strong> {formatarValor(p.valor_venda)}
                    </p>

                    <p
                      className={`status ${
                        p.status === "ATIVO" ? "ok" : "off"
                      }`}
                    >
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
                        quantidade_atual: Number(e.target.value),
                      }))
                    }
                    required
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
                        quantidade_minima: Number(e.target.value),
                      }))
                    }
                    required
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
                        valor_custo: parseFloat(e.target.value),
                      }))
                    }
                    required
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
                        valor_venda: parseFloat(e.target.value),
                      }))
                    }
                    required
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
