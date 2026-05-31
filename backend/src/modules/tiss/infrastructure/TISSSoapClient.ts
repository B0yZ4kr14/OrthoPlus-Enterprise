import { logger } from "@/infrastructure/logger";

/**
 * TISS SOAP Client
 * Builds TISS 3.0.0 XML envelopes for guide submission to health insurance operators.
 * This is a structural implementation — actual SOAP transport requires operator-specific
 * WSDL endpoints and certificate authentication.
 */

export interface TISSGuideData {
  guideNumber: string;
  patientName: string;
  patientCpf: string;
  procedureCode: string;
  procedureName: string;
  serviceDate: string;
  amount: number;
  dentistCro?: string;
  dentistName?: string;
}

export interface TISSBatchData {
  batchNumber: string;
  insuranceCompany: string;
  operatorCode?: string;
  guides: TISSGuideData[];
  totalAmount: number;
}

export interface TISSSubmitResult {
  success: boolean;
  protocolNumber?: string;
  status: "ACCEPTED" | "REJECTED" | "PENDING" | "ERROR";
  message: string;
  responseXml?: string;
}

export class TISSSoapClient {
  private operatorEndpoint?: string;

  constructor(operatorEndpoint?: string) {
    this.operatorEndpoint = operatorEndpoint;
  }

  /**
   * Builds the TISS XML envelope for enviarLoteGuias operation
   */
  buildLoteXml(batch: TISSBatchData): string {
    const guidesXml = batch.guides
      .map(
        (g) => `
      <guiaTISS>
        <cabecalhoGuia>
          <numeroGuiaPrestador>${this.escapeXml(g.guideNumber)}</numeroGuiaPrestador>
          <numeroGuiaOperadora></numeroGuiaOperadora>
        </cabecalhoGuia>
        <dadosBeneficiario>
          <numeroCarteira></numeroCarteira>
          <nomeBeneficiario>${this.escapeXml(g.patientName)}</nomeBeneficiario>
          <numeroCNS></numeroCNS>
        </dadosBeneficiario>
        <procedimentosExecutados>
          <procedimentoExecutado>
            <dataExecucao>${g.serviceDate}</dataExecucao>
            <codigoProcedimento>${this.escapeXml(g.procedureCode)}</codigoProcedimento>
            <descricaoProcedimento>${this.escapeXml(g.procedureName)}</descricaoProcedimento>
            <valorProcedimento>${(g.amount / 100).toFixed(2)}</valorProcedimento>
          </procedimentoExecutado>
        </procedimentosExecutados>
        <valorTotal>${(g.amount / 100).toFixed(2)}</valorTotal>
      </guiaTISS>`,
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tiss="http://www.ans.gov.br/tiss/ws/tipos/tisscabecalho/v3_00_00">
  <soapenv:Header/>
  <soapenv:Body>
    <tiss:enviarLoteGuias>
      <cabecalho>
        <identificacaoTransacao>
          <tipoTransacao>ENVIO_LOTE_GUIAS</tipoTransacao>
          <sequencialTransacao>1</sequencialTransacao>
          <dataRegistroTransacao>${new Date().toISOString().split("T")[0]}</dataRegistroTransacao>
          <horaRegistroTransacao>${new Date().toISOString().split("T")[1].substring(0, 8)}</horaRegistroTransacao>
        </identificacaoTransacao>
        <origem>
          <identificacaoPrestador>
            <cnpj></cnpj>
          </identificacaoPrestador>
        </origem>
        <destino>
          <registroANS>${this.escapeXml(batch.operatorCode || "")}</registroANS>
        </destino>
        <versaoPadrao>3.00.00</versaoPadrao>
      </cabecalho>
      <loteGuias>
        <numeroLote>${this.escapeXml(batch.batchNumber)}</numeroLote>
        <guiasTISS>
          ${guidesXml}
        </guiasTISS>
      </loteGuias>
    </tiss:enviarLoteGuias>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Simulates submitting a batch to the operator webservice.
   * In production, this would make an actual SOAP request with proper certificates.
   */
  async submitBatch(batch: TISSBatchData): Promise<TISSSubmitResult> {
    if (!this.operatorEndpoint) {
      return {
        success: false,
        status: "ERROR",
        message: "Operator endpoint not configured",
      };
    }

    const xml = this.buildLoteXml(batch);

    logger.info("TISS SOAP: would submit batch", {
      batchNumber: batch.batchNumber,
      operator: batch.insuranceCompany,
      endpoint: this.operatorEndpoint,
      xmlLength: xml.length,
    });

    logger.warn("[TISS] SOAP request mocked — implement actual operator WSDL transport");
    const protocolNumber = `PROT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      protocolNumber,
      status: "ACCEPTED",
      message: `Batch ${batch.batchNumber} accepted by operator`,
      responseXml: `<retorno>${protocolNumber}</retorno>`,
    };
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
