// C:\dev\sgc\frontend\src\pages\Coleta\ColetaModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./ColetaModal.css";
import { ChevronLeft } from "lucide-react";
import api from "../../services/api";
import TipoColeta from "./TipoColeta";

export default function ColetaModal({ open, onClose, onSave, coletaEdit }) {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState("");
    const [pagina, setPagina] = useState(1);

    // Onde armazenamos PIX / CRÉDITO / PRODUTO
    const [tiposSelecionados, setTiposSelecionados] = useState([]);

    // Dados do tipo ao abrir a tela de edição
    const [tipoInicial, setTipoInicial] = useState(null);

    // Formulário principal
    const [formData, setFormData] = useState({
        id_coleta: null,
        id_cliente: null,
        nome_cliente: "",
        data_coleta: "",
        status: "PENDENTE",
        observacao: "",
    });

    // controle de telas do modal
    const [etapa, setEtapa] = useState("formulario");

    const POR_PAGINA = 3;

    // =========================
    // NORMALIZAÇÃO DE DATA
    // =========================
    const formatarData = (dataISO) => {
        if (!dataISO) return "";
        return dataISO.split("T")[0]; // yyyy-mm-dd
    };

    // ===========================================================
    // 🔄 QUANDO ABRE PARA EDITAR: preencher cliente + tipos
    // ===========================================================
    useEffect(() => {
        if (!coletaEdit) {
            // nova coleta – limpar tudo
            setFormData({
                id_coleta: null,
                id_cliente: null,
                nome_cliente: "",
                data_coleta: "",
                status: "PENDENTE",
                observacao: "",
            });
            setTiposSelecionados([]);
            return;
        }

        // =========================
        // MONTAR TIPOS A PARTIR DO BACKEND
        // =========================
        const montarTipos = () => {
            const lista = [];

            // --------- PIX / CRÉDITO ---------
            coletaEdit.compensacoes?.forEach((c) => {
                if (c.id_tipo === 1) {
                    lista.push({
                        tipo: "pix",
                        quantidade: Number(c.quantidade),
                        valor_unitario: Number(c.valor_unitario),
                    });
                }

                if (c.id_tipo === 2) {
                    lista.push({
                        tipo: "credito",
                        quantidade: Number(c.quantidade),
                        valor_unitario: Number(c.valor_unitario),
                    });
                }
            });

            // --------- PRODUTO (compensação + produtos entregues) ---------
            if (
                coletaEdit.compensacoes?.some((c) => c.id_tipo === 3) ||
                coletaEdit.produtos?.length > 0
            ) {
                lista.push({
                    tipo: "produto",
                    quantidade_oleo:
                        Number(
                            coletaEdit.compensacoes?.find((c) => c.id_tipo === 3)?.quantidade
                        ) || 0,
                    produtos:
                        coletaEdit.produtos?.map((p) => ({
                            id_produto: p.id_produto,
                            nome_produto: p.produto?.nome_produto,
                            quantidade: Number(p.quantidade),
                        })) || [],
                });
            }

            return lista;
        };

        // preencher o formulário principal
        setFormData({
            id_coleta: coletaEdit.id_coleta,
            id_cliente: coletaEdit.id_cliente,
            nome_cliente: coletaEdit.cliente?.razao_social || "",
            data_coleta: formatarData(coletaEdit.data_coleta),
            status: coletaEdit.status,
            observacao: coletaEdit.observacao || "",
        });

        // carregar os tipos
        setTiposSelecionados(montarTipos());
    }, [coletaEdit]);

    // =========================
    // CARREGAR CLIENTES
    // =========================
const fetchClientes = async () => {
    try {
        const { data } = await api.get("/clientes");

        const lista = Array.isArray(data.data) ? data.data : [];

        // 🔥 Ajuste correto:
        // 1) Filtra somente clientes ATIVOS
        // 2) Ordena pelo mais recente (id_cliente desc)
        const filtrados = lista
            .filter(c => c.status === "ATIVO")
            .sort((a, b) => b.id_cliente - a.id_cliente);

        setClientes(filtrados);
    } catch (e) {
        console.error("Erro ao carregar clientes", e);
    }
};

    useEffect(() => {
        if (open) fetchClientes();
    }, [open]);

    // =========================
    // FILTRO DE CLIENTES
    // =========================
    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return clientes;

        return clientes.filter(
            (c) =>
                c.razao_social?.toLowerCase().includes(termo) ||
                c.nome_fantasia?.toLowerCase().includes(termo) ||
                c.cnpj_cpf?.includes(termo)
        );
    }, [clientes, busca]);

    const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / POR_PAGINA));
    const inicio = (pagina - 1) * POR_PAGINA;
    const paginaAtual = clientesFiltrados.slice(inicio, inicio + POR_PAGINA);

    // =========================
    // ABRIR TIPOS
    // =========================
    const abrirTipo = (tipo) => {
        const existente = tiposSelecionados.find((t) => t.tipo === tipo) || null;
        setTipoInicial(existente);
        setEtapa(`tipo_${tipo}`);
    };

    // SALVAR UM TIPO INDIVIDUAL (PIX/CRÉDITO/PRODUTO)
    const salvarTipo = (dadosTipo) => {
        setTiposSelecionados((prev) => {
            const idx = prev.findIndex((t) => t.tipo === dadosTipo.tipo);
            if (idx !== -1) {
                return prev.map((t) => (t.tipo === dadosTipo.tipo ? dadosTipo : t));
            }
            return [...prev, dadosTipo];
        });

        setEtapa("formulario");
        setTipoInicial(null);
    };

    const removerTipo = (tipo) => {
        setTiposSelecionados((prev) => prev.filter((t) => t.tipo !== tipo));
    };

    // =========================
    // SALVAR COLETA COMPLETA
    // =========================
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.id_cliente) {
            alert("Selecione um cliente antes de salvar.");
            return;
        }

        const payload = {
            ...formData,
            tipos: tiposSelecionados,
        };

        onSave(payload);
    };

    if (!open) return null;

    // =========================
    // RESUMO VISUAL DOS TIPOS
    // =========================
    const resumoTipo = (t) => {
        if (t.tipo === "pix" || t.tipo === "credito") {
            const total = (Number(t.quantidade) || 0) * (Number(t.valor_unitario) || 0);
            const label = t.tipo === "pix" ? "PIX" : "CRÉDITO";

            return `${label} — ${t.quantidade} L — R$ ${Number(
                t.valor_unitario
            ).toFixed(2)} /L = R$ ${total.toFixed(2)}`;
        }

        if (t.tipo === "produto") {
            const litros = Number(t.quantidade_oleo || 0);
            const descProdutos = (t.produtos || [])
                .map((p) => `${p.nome_produto} ${p.quantidade}un`)
                .join(", ");

            return `PRODUTO — ${litros} L — ${descProdutos}`;
        }

        return "";
    };

    // =========================
    // RENDERIZAÇÃO
    // =========================
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal ${
                    etapa.startsWith("tipo_") || etapa === "selecaoCliente"
                        ? "fullscreen"
                        : ""
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ======================================================
                   FORM PRINCIPAL
                ====================================================== */}
                {etapa === "formulario" && (
                    <form className="modal-form" onSubmit={handleSubmit}>
                        {/* CLIENTE */}
                        <label>
                            Cliente
                            <input
                                type="text"
                                readOnly
                                value={formData.nome_cliente}
                                placeholder="Selecione um cliente"
                                onClick={() => setEtapa("selecaoCliente")}
                            />
                        </label>

                        {/* DATA */}
                        <label>
                            Data da Coleta
                            <input
                                type="date"
                                value={formData.data_coleta}
                                onChange={(e) =>
                                    setFormData((d) => ({
                                        ...d,
                                        data_coleta: e.target.value,
                                    }))
                                }
                                required
                            />
                        </label>

                        {/* ========================= TIPOS ========================= */}
                        <div className="tipo-bloco">
                            <h4 className="tipo-titulo">Compensação da Coleta</h4>

                            <div className="tipo-opcoes">
                                {/* PIX */}
                                <label className="tipo-checkbox tipo-col">
                                    <input
                                        type="checkbox"
                                        className="cb-big"
                                        checked={!!tiposSelecionados.find((t) => t.tipo === "pix")}
                                        onChange={() => abrirTipo("pix")}
                                    />
                                    <span className="tipo-text">
                                        Pagamento<br />Imediato
                                    </span>
                                </label>

                                {/* PRODUTO */}
                                <label className="tipo-checkbox tipo-col">
                                    <input
                                        type="checkbox"
                                        className="cb-big"
                                        checked={!!tiposSelecionados.find((t) => t.tipo === "produto")}
                                        onChange={() => abrirTipo("produto")}
                                    />
                                    <span className="tipo-text">
                                        Troca por<br />Produto
                                    </span>
                                </label>

                                {/* CRÉDITO */}
                                <label className="tipo-checkbox tipo-col">
                                    <input
                                        type="checkbox"
                                        className="cb-big"
                                        checked={!!tiposSelecionados.find((t) => t.tipo === "credito")}
                                        onChange={() => abrirTipo("credito")}
                                    />
                                    <span className="tipo-text">
                                        Crédito em<br />Loja
                                    </span>
                                </label>
                            </div>

                            {/* LISTA DOS TIPOS JÁ ADICIONADOS */}
                            <div className="tipo-lista">
                                {tiposSelecionados.map((t) => (
                                    <div key={t.tipo} className="tipo-item">
                                        <span className="tipo-info">{resumoTipo(t)}</span>

                                        <div className="tipo-botoes">
                                            <button
                                                type="button"
                                                className="tipo-edit"
                                                onClick={() => abrirTipo(t.tipo)}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="tipo-remove"
                                                onClick={() => removerTipo(t.tipo)}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STATUS */}
                        <label>
                            Status
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData((d) => ({ ...d, status: e.target.value }))
                                }
                            >
                                <option value="PENDENTE">PENDENTE</option>
                                <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                                <option value="CONCLUIDA">CONCLUÍDA</option>
                                <option value="CANCELADA">CANCELADA</option>
                            </select>
                        </label>

                        {/* OBSERVAÇÃO */}
                        <label>
                            Observação
                            <textarea
                                rows="3"
                                value={formData.observacao}
                                onChange={(e) =>
                                    setFormData((d) => ({
                                        ...d,
                                        observacao: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        {/* BOTÕES */}
                        <div className="modal-actions">
                            <button type="button" className="btn ghost" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn primary">
                                Salvar
                            </button>
                        </div>
                    </form>
                )}

                {/* ======================================================
                   SELEÇÃO DE CLIENTE
                ====================================================== */}
                {etapa === "selecaoCliente" && (
                    <div className="cliente-page">
                        <div className="cliente-header">
                            <button
                                className="back-btn"
                                onClick={() => setEtapa("formulario")}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <h4>Selecione um cliente</h4>

                            <div className="cliente-search">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, razão social ou CNPJ..."
                                    value={busca}
                                    onChange={(e) => {
                                        setBusca(e.target.value);
                                        setPagina(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="cliente-content">
                            <div className="cliente-grid">
                                {paginaAtual.map((c) => (
                                    <article
                                        key={c.id_cliente}
                                        className="cliente-card fade-in"
                                        onClick={() => {
                                            setFormData((d) => ({
                                                ...d,
                                                id_cliente: c.id_cliente,
                                                nome_cliente: c.razao_social,
                                            }));
                                            setEtapa("formulario");
                                        }}
                                    >
                                        <h3 className="cliente-name">
                                            {c.nome_fantasia || "—"}
                                        </h3>

                                        <p className="cliente-line">{c.razao_social || "—"}</p>
                                        <p className="cliente-line">{c.cnpj_cpf || "—"}</p>
                                        <p className="cliente-line">
                                            {c.dias_funcionamento || "—"}
                                        </p>

                                        <p
                                            className={`status ${
                                                c.status === "ATIVO" ? "ok" : "off"
                                            }`}
                                        >
                                            {c.status}
                                        </p>
                                    </article>
                                ))}
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
                        </div>
                    </div>
                )}

                {/* ======================================================
                   TELAS DOS TIPOS
                ====================================================== */}
                {etapa === "tipo_pix" && (
                    <TipoColeta
                        tipo="pix"
                        initialData={tipoInicial}
                        onClose={() => setEtapa("formulario")}
                        onSave={salvarTipo}
                    />
                )}

                {etapa === "tipo_credito" && (
                    <TipoColeta
                        tipo="credito"
                        initialData={tipoInicial}
                        onClose={() => setEtapa("formulario")}
                        onSave={salvarTipo}
                    />
                )}

                {etapa === "tipo_produto" && (
                    <TipoColeta
                        tipo="produto"
                        initialData={tipoInicial}
                        onClose={() => setEtapa("formulario")}
                        onSave={salvarTipo}
                    />
                )}
            </div>
        </div>
    );
}
