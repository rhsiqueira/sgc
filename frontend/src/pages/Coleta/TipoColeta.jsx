// C:\dev\sgc\frontend\src\pages\Coleta\TipoColeta.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./TipoColeta.css";
import "../Produto/Produto.css";
import { ChevronLeft } from "lucide-react";
import api from "../../services/api";

export default function TipoColeta({
  tipo,
  initialData,
  onClose,
  onSave,
}) {
  const [etapa, setEtapa] = useState("principal");
  const [quantidade, setQuantidade] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");

  const [quantidadeOleo, setQuantidadeOleo] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erroProdutos, setErroProdutos] = useState("");

  const [showQtdModal, setShowQtdModal] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState("");

  const POR_PAGINA = 3;

  // carregar dados iniciais
  useEffect(() => {
    if (!initialData) return;

    if (tipo === "pix" || tipo === "credito") {
      setQuantidade(initialData.quantidade != null ? String(initialData.quantidade) : "");
      setValorUnitario(initialData.valor_unitario != null ? String(initialData.valor_unitario) : "");
    }

    if (tipo === "produto") {
      setQuantidadeOleo(initialData.quantidade_oleo != null ? String(initialData.quantidade_oleo) : "");
      setProdutosSelecionados(initialData.produtos || []);
    }
  }, [initialData, tipo]);

  // carregar produtos
  const fetchProdutos = async () => {
    try {
      setCarregandoProdutos(true);
      setErroProdutos("");
      const { data } = await api.get("/produtos");
      const lista = Array.isArray(data.data) ? data.data : [];
      setProdutos(lista);
    } catch (err) {
      setErroProdutos("Não foi possível carregar os produtos.");
    } finally {
      setCarregandoProdutos(false);
    }
  };

  useEffect(() => {
    if (tipo === "produto" && etapa === "selecionar_produto") {
      fetchProdutos();
    }
  }, [tipo, etapa]);

  const produtosFiltrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => p.nome_produto?.toLowerCase().includes(termo));
  }, [produtos, busca]);

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginaAtual = produtosFiltrados.slice(inicio, inicio + POR_PAGINA);

  const formatarValor = (valor) => `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;

  const calcularPercentual = (p) => {
    if (!p.quantidade_minima) return 0;
    return Math.min(100, Math.round((p.quantidade_atual / p.quantidade_minima) * 100));
  };

  const salvarPixOuCredito = () => {
    if (!quantidade || !valorUnitario) {
      alert("Informe quantidade e valor por litro.");
      return;
    }

    onSave({
      tipo,
      quantidade: Number(quantidade),
      valor_unitario: Number(valorUnitario),
    });
  };

  const abrirSelecaoProduto = () => setEtapa("selecionar_produto");

  const abrirModalQuantidade = (produto) => {
    setProdutoAtual(produto);
    const existente = produtosSelecionados.find((p) => p.id_produto === produto.id_produto);
    setQuantidadeProduto(existente ? String(existente.quantidade) : "");
    setShowQtdModal(true);
  };

  const confirmarQuantidadeProduto = () => {
    const qtdNum = Number(quantidadeProduto);
    if (!qtdNum || qtdNum <= 0) {
      alert("Informe uma quantidade válida em litros.");
      return;
    }

    setProdutosSelecionados((prev) => {
      const semEste = prev.filter((p) => p.id_produto !== produtoAtual.id_produto);
      return [
        ...semEste,
        {
          id_produto: produtoAtual.id_produto,
          nome_produto: produtoAtual.nome_produto,
          unidade: produtoAtual.unidade,
          quantidade: qtdNum,
        },
      ];
    });

    setShowQtdModal(false);
    setProdutoAtual(null);
    setQuantidadeProduto("");
    setEtapa("principal");
  };

  const removerProdutoSelecionado = (id_produto) => {
    setProdutosSelecionados((prev) => prev.filter((p) => p.id_produto !== id_produto));
  };

  const salvarProduto = () => {
    if (!quantidadeOleo) {
      alert("Informe a quantidade total de óleo coletado.");
      return;
    }

    if (produtosSelecionados.length === 0) {
      alert("Adicione ao menos um produto.");
      return;
    }

    onSave({
      tipo: "produto",
      quantidade_oleo: Number(quantidadeOleo),
      produtos: produtosSelecionados,
    });
  };

  // título
  const tituloBreadcrumbPrincipal =
    tipo === "pix"
      ? "Pagamento Imediato"
      : tipo === "credito"
      ? "Crédito em Loja"
      : "Troca por Produto";

  // HEADER PADRONIZADO
  const renderHeader = (breadcrumbs, onBack) => (
    <header className="tipo-header">
      {/* linha superior - só o botão voltar */}
      <div className="tipo-header-top">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* breadcrumb centralizado */}
      <nav className="breadcrumb">
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="sep">›</span>}
            <span className={`crumb ${b.active ? "active" : ""}`} onClick={b.onClick}>
              {b.label}
            </span>
          </React.Fragment>
        ))}
      </nav>
    </header>
  );

  // ==========================
  // TELA PRINCIPAL
  // ==========================
  if (etapa === "principal") {
    return (
      <div className="tipo-fullscreen">
        {renderHeader(
          [
            { label: "Coleta", onClick: onClose },
            { label: tituloBreadcrumbPrincipal, active: true },
          ],
          onClose
        )}

        {(tipo === "pix" || tipo === "credito") && (
          <div className="tipo-form">
            <label>
              Quantidade de Óleo coletada em litros:
              <input
                type="number"
                step="0.01"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </label>

            <label>
              Valor por Litro (R$)
              <input
                type="number"
                step="0.01"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
              />
            </label>

            <button className="tipo-salvar-btn" onClick={salvarPixOuCredito}>
              Salvar Tipo
            </button>
          </div>
        )}

        {tipo === "produto" && (
          <div className="tipo-form">
            <label>
              Quantidade de Óleo coletada em litros:
              <input
                type="number"
                step="0.01"
                value={quantidadeOleo}
                onChange={(e) => setQuantidadeOleo(e.target.value)}
              />
            </label>

            <button type="button" className="tipo-add-produto" onClick={abrirSelecaoProduto}>
              + Adicionar Produto
            </button>

            <div className="tipo-produtos-bloco">
              <div className="tipo-produtos-header">
                <span>Produtos utilizados nesta coleta</span>
              </div>

              <div className="tipo-produtos-lista">
                {produtosSelecionados.map((p) => (
                  <div className="tipo-produto-item" key={p.id_produto}>
                    <div className="tipo-produto-info">
                      <strong>{p.nome_produto}</strong>
                      <span>
                        {p.quantidade} L {p.unidade ? `• ${p.unidade}` : ""}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="tipo-produto-remove"
                      onClick={() => removerProdutoSelecionado(p.id_produto)}
                    >
                      Remover
                    </button>
                  </div>
                ))}

                {produtosSelecionados.length === 0 && (
                  <p className="tipo-produto-vazio">Nenhum produto adicionado ainda.</p>
                )}
              </div>
            </div>

            <button className="tipo-salvar-btn" onClick={salvarProduto}>
              Salvar Tipo
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================
  // TELA DE SELEÇÃO DE PRODUTO
  // ==========================
  if (etapa === "selecionar_produto") {
    return (
      <div className="tipo-fullscreen">
        {renderHeader(
          [
            { label: "Coleta", onClick: onClose },
            { label: "Coleta com Produto", onClick: () => setEtapa("principal") },
            { label: "Selecionar Produto", active: true },
          ],
          () => setEtapa("principal")
        )}

        <div className="tipo-search">
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

        <main className="tipo-produto-content">
          {carregandoProdutos && (
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

          {!carregandoProdutos && erroProdutos && <p className="error">{erroProdutos}</p>}

          {!carregandoProdutos && !erroProdutos && paginaAtual.length === 0 && (
            <p className="hint">Nenhum produto encontrado.</p>
          )}

          {!carregandoProdutos && !erroProdutos && (
            <>
              <div className="produto-grid">
                {paginaAtual.map((p) => {
                  const perc = calcularPercentual(p);
                  const estoqueBaixo = p.quantidade_atual < p.quantidade_minima;

                  return (
                    <article
                      key={p.id_produto}
                      className={`produto-card fade-in ${estoqueBaixo ? "low-stock" : "ok-stock"}`}
                      onClick={() => abrirModalQuantidade(p)}
                    >
                      <h3 className="produto-name">{p.nome_produto}</h3>

                      <p className="produto-line">
                        <strong>Unidade:</strong> {p.unidade || "—"}
                      </p>
                      <p className="produto-line">
                        <strong>Qtd:</strong> {p.quantidade_atual ?? 0} / {p.quantidade_minima ?? 0}
                      </p>

                      <div className="stock-bar">
                        <div
                          className={`stock-fill ${estoqueBaixo ? "low" : ""}`}
                          style={{ width: `${perc}%` }}
                        />
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

        {/* modal quantidade */}
        {showQtdModal && (
          <div className="tipo-modal-overlay">
            <div className="tipo-modal">
              <h4>Informe a quantidade em litros</h4>

              {produtoAtual && (
                <p className="tipo-modal-produto">
                  {produtoAtual.nome_produto} {produtoAtual.unidade ? `• ${produtoAtual.unidade}` : ""}
                </p>
              )}

              <input
                type="number"
                step="0.01"
                value={quantidadeProduto}
                onChange={(e) => setQuantidadeProduto(e.target.value)}
              />

              <div className="tipo-modal-actions">
                <button
                  className="btn ghost"
                  onClick={() => {
                    setShowQtdModal(false);
                    setProdutoAtual(null);
                    setQuantidadeProduto("");
                  }}
                >
                  Cancelar
                </button>

                <button className="btn primary" onClick={confirmarQuantidadeProduto}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
