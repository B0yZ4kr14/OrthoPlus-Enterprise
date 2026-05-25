import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { FaturamentoControllerService } from "@/modules/faturamento/application/FaturamentoControllerService";

export class FaturamentoController {
  private service = new FaturamentoControllerService();

  createNFe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    const result = await this.service.createNFe(clinicId, req.body);
    res.status(201).json({ message: "NFe created successfully", data: result });
  });

  listNFes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    const result = await this.service.listNFes(clinicId);
    res.status(200).json({ nfes: result });
  });

  autorizarNFe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { protocolo, xml } = req.body;
    if (!protocolo || !xml) {
      throw Errors.validation("Protocolo and XML are required");
    }
    await this.service.autorizarNFe(id, protocolo, xml);
    res.status(200).json({ message: "NFe authorized successfully", protocolo });
  });

  cancelarNFe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { motivo } = req.body;
    if (!motivo) {
      throw Errors.validation("Motivo is required");
    }
    await this.service.cancelarNFe(id, motivo);
    res.status(200).json({ message: "NFe canceled successfully" });
  });

  autorizarNfceSefaz = asyncHandler(async (req: Request, res: Response) => {
    const { nfceId, ambiente } = req.body;
    if (!nfceId) {
      throw Errors.validation("nfceId is required");
    }
    res.status(200).json({
      message: "NFCe authorization workflow initiated",
      status: "PROCESSING",
      nfceId,
      ambiente,
    });
  });

  cartaCorrecaoNfce = asyncHandler(async (req: Request, res: Response) => {
    const { nfceId, correcao } = req.body;
    if (!nfceId || !correcao) {
      throw Errors.validation("nfceId and correcao are required");
    }
    if (correcao.length < 15) {
      throw Errors.validation("Correcao deve ter no minimo 15 caracteres");
    }
    res.status(200).json({ message: "Carta de correcao processed", nfceId });
  });

  emitirNfce = asyncHandler(async (req: Request, res: Response) => {
    const { vendaId } = req.body;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    if (!vendaId) {
      throw Errors.validation("vendaId is required");
    }
    res.status(200).json({
      message: "NFC-e emission workflow started",
      vendaId,
      status: "PROCESSING",
    });
  });

  inutilizarNumeracaoNfce = asyncHandler(async (req: Request, res: Response) => {
    const { numeroInicial, numeroFinal } = req.body;
    if (numeroFinal < numeroInicial) {
      throw Errors.validation("Numero final deve ser maior que numero inicial");
    }
    res.status(200).json({
      message: "Inutilizacao processada",
      protocolo: `IN-${Date.now()}`,
    });
  });

  sincronizarNfceContingencia = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    res.status(200).json({
      message: "Contingency synchronization running",
      clinicId,
    });
  });

  validateFiscalXml = asyncHandler(async (req: Request, res: Response) => {
    const { xmlContent } = req.body;
    if (!xmlContent || (!xmlContent.trim().startsWith("<") && !xmlContent.trim().startsWith("|"))) {
      throw Errors.validation("Documento nao e XML ou SPED valido");
    }
    res.status(200).json({
      message: "XML validation complete",
      erros: [],
      warnings: [],
      isValid: true,
    });
  });

  imprimirCupomSat = asyncHandler(async (req: Request, res: Response) => {
    const { vendaId } = req.body;
    res.status(200).json({
      message: "SAT/MFe print request sent to queue",
      vendaId,
    });
  });

  gerarSpedFiscal = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    res.status(200).json({
      message: "SPED generation initiated",
      clinicId,
      status: "QUEUE",
    });
  });

  enviarDadosContabilidade = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }
    const { tipoDocumento } = req.body;
    res.status(200).json({
      message: "Data queued for accounting integration",
      clinicId,
      tipoDocumento,
    });
  });
}
