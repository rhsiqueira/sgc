// C:\dev\sgc\frontend\src\pages\Coleta\Certificado.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import "./Certificado.css";

import logoGodzilla from "./logo-auth.png";
import logoTangara from "./tangara.png";

export default function Certificado({ coleta, cliente, produtos = [] }) {

  // ===============================================================
  // 🔥 RECEBENDO ASSINATURA DO GerarCertificado via useLocation()
  // ===============================================================
  const { state } = useLocation();
  const assinaturaBase64 = state?.assinaturaBase64 || null;

  const numeroCertificado = String(coleta?.id_coleta ?? "").padStart(4, "0");

  const formatarData = (data) => {
    if (!data) return "";
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (v) =>
    `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

  const dataColeta = formatarData(coleta?.data_coleta);

  const enderecoCompleto = cliente
    ? `${cliente.endereco || "—"}, ${cliente.numero || "S/N"} - ${
        cliente.bairro || "—"
      } - ${cliente.cidade || "—"}/${cliente.estado || "—"}`
    : "—";

  const telefone =
    cliente?.telefone_celular || cliente?.telefone_fixo || "—";

  const quantidadeTotal =
    coleta?.quantidade_total != null ? `${coleta.quantidade_total}` : "—";

  const compensacoes = coleta?.compensacoes || [];
  const produtosColeta = coleta?.produtos || [];

  const compPix = compensacoes.find((c) => c.id_tipo === 1);
  const compCredito = compensacoes.find((c) => c.id_tipo === 2);
  const compProduto = compensacoes.find((c) => c.id_tipo === 3);

  const totalPix =
    compPix ? compPix.quantidade * compPix.valor_unitario : null;

  const totalCredito =
    compCredito ? compCredito.quantidade * compCredito.valor_unitario : null;

  const checkbox = (marcado) => (marcado ? "☑" : "☐");

  // Mapa produtos usados
  const mapaUsados = {};
  produtosColeta.forEach((p) => {
    mapaUsados[p.produto?.id_produto] = p.quantidade;
  });

  // Divide colunas
  const meio = Math.ceil(produtos.length / 2);
  const colA = produtos.slice(0, meio);
  const colB = produtos.slice(meio);

  return (
    <div id="certificado-root" className="cert-root">
      <div className="cert-frame">

        {/* HEADER */}
        <header className="cert-header">

          <div className="cert-header-left">
            <div className="cert-logos">
              <img src={logoTangara} alt="Tangará" className="cert-logo-tangara" />
              <img src={logoGodzilla} alt="Godzilla" className="cert-logo-godzilla" />
            </div>

            <div className="cert-company-info">
              <p>TANGARÁ ALIMENTOS LTDA</p>
              <p>CNPJ: 07.886.479/0004-05</p>
              <p>Cetesb - 208.100019-0</p>
              <p>Rodovia Candido Portinari, S/N</p>
              <p>KM 350 Sul Zona Rural</p>
              <p>CEP 14300-000 - Batatais SP</p>
            </div>
          </div>

          <div className="cert-header-right">
            <div className="cert-number-box">
              <span className="cert-number-label">Nº</span>
              <span className="cert-number-value">{numeroCertificado}</span>
            </div>

            <div className="cert-contact">
              <p className="cert-contact-title">Solicitar Coleta</p>
              <p>(11) 95758-2806</p>
              <p>(11) 94644-7239</p>
              <p>contato@godzillacoletadeoleo.com</p>
            </div>
          </div>
        </header>

        {/* BODY */}
        <section className="cert-body">
          <div className="cert-title-block">
            <h1>Certificado de destino final de resíduos</h1>
            <p className="cert-paragraph">
              Certificamos para os devidos fins, que o resíduo de óleo de fritura queimado fornecido pelo estabelecimento abaixo esteve armazenado corretamente e foi integralmente destinado ao processo de reciclagem.
            </p>
          </div>

          {/* EMPRESA */}
          <div className="cert-field-row white-block">
            <span className="cert-field-label">Empresa / Fornecedor</span>
            <span className="cert-field-value black-text">
              {cliente?.razao_social || cliente?.nome_fantasia || "—"}
            </span>
          </div>

          {/* ENDEREÇO */}
          <div className="cert-field-row white-block">
            <span className="cert-field-label">Endereço</span>
            <span className="cert-field-value black-text">{enderecoCompleto}</span>
          </div>

          {/* CNPJ + TELEFONE */}
          <div className="cert-field-row-dupla">
            <div className="cert-field-row white-block half-block">
              <span className="cert-field-label">CNPJ</span>
              <span className="cert-field-value black-text">
                {cliente?.cnpj_cpf || "—"}
              </span>
            </div>

            <div className="cert-field-row white-block half-block">
              <span className="cert-field-label">Telefone</span>
              <span className="cert-field-value black-text">{telefone}</span>
            </div>
          </div>

          {/* QUANTIDADE + COMPENSAÇÕES */}
          <div className="cert-quantidade-bloco white-block">

            <div className="cert-quantidade-linha">
              <span className="cert-quantidade-texto black-text">
                Quantidade de óleo usado coletado
              </span>

              <span className="cert-quantidade-valor destaque-oil black-text">
                {quantidadeTotal}
              </span>

              <span className="cert-quantidade-unidade black-text">Kgs/Lts</span>
            </div>

            <div className="cert-comp-row-group black-text">

              {/* PIX */}
              <div className="cert-comp-row">
                <span className="cert-check">{checkbox(!!compPix)}</span>
                <span className="cert-comp-label">Pagamento</span>
                {compPix && (
                  <span className="underline comp-total">
                    {formatarMoeda(totalPix)}
                  </span>
                )}
              </div>

              {/* CRÉDITO */}
              <div className="cert-comp-row">
                <span className="cert-check">{checkbox(!!compCredito)}</span>
                <span className="cert-comp-label">Crédito</span>
                {compCredito && (
                  <span className="underline comp-total">
                    {formatarMoeda(totalCredito)}
                  </span>
                )}
              </div>

              {/* PRODUTO */}
              <div className="cert-comp-row">
                <span className="cert-check">{checkbox(!!compProduto)}</span>
                <span className="cert-comp-label">Troca por Produto</span>
              </div>
            </div>

            {/* PRODUTOS */}
            <div className="cert-produtos-container">
              <div className="cert-produtos-col">
                {colA.map((p) => (
                  <div key={p.id_produto} className="cert-produto-item black-text">
                    <span>{p.nome_produto}</span>
                    <span className="underline">{mapaUsados[p.id_produto] || ""}</span>
                  </div>
                ))}
              </div>

              <div className="cert-produtos-col">
                {colB.map((p) => (
                  <div key={p.id_produto} className="cert-produto-item black-text">
                    <span>{p.nome_produto}</span>
                    <span className="underline">{mapaUsados[p.id_produto] || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="cert-footer">
          <div className="cert-data-linha black-text">
            São Paulo - SP, {dataColeta || "____/____/______"}
          </div>

          <div className="cert-assinaturas">

            {/* ASSINATURA GODZILLA */}
            <div className="cert-assinatura-col">
              <div className="cert-assinatura-area white-block">
                {assinaturaBase64 && (
                  <img
                    src={assinaturaBase64}
                    alt="Assinatura"
                    className="cert-assinatura-imagem"
                  />
                )}
              </div>
              <div className="cert-assinatura-linha" />
              <span className="cert-assinatura-label black-text">
                Coleta Godzilla
              </span>
            </div>

            {/* ASSINATURA CLIENTE */}
            <div className="cert-assinatura-col">
              <div className="cert-assinatura-area white-block" />
              <div className="cert-assinatura-linha" />
              <span className="cert-assinatura-label black-text">
                {cliente?.razao_social || cliente?.nome_fantasia}
              </span>
            </div>
          </div>

          <div className="cert-footer-brand black-text">
            <strong>COLETA GODZILLA</strong> — www.godzillacoletadeoleo.com
          </div>
        </footer>

      </div>
    </div>
  );
}
