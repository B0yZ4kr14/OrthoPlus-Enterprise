import { IContratoRepository } from '../../domain/repositories/IContratoRepository';
import { ContratoDTO } from '../dto/ContratoDTO';

export interface GetContratosPorPacienteQuery {
  pacienteId: string;
  clinicId: string;
  onlyActive?: boolean;
}

export interface ContratosPorPacienteResult {
  pacienteId: string;
  totalContratos: number;
  contratosAtivos: number;
  valorTotalContratado: number;
  items: ContratoDTO[];
}

export class GetContratosPorPacienteQueryHandler {
  constructor(private contratoRepository: IContratoRepository) {}

  async execute(query: GetContratosPorPacienteQuery): Promise<ContratosPorPacienteResult> {
    const { items } = await this.contratoRepository.findAll({
      clinicId: query.clinicId,
      pacienteId: query.pacienteId
    });

    const contratos = items.map(ContratoDTO.fromEntity);
    const contratosAtivos = items.filter(c => 
      ['ASSINADO', 'EM_EXECUCAO'].includes(c.status)
    );

    return {
      pacienteId: query.pacienteId,
      totalContratos: items.length,
      contratosAtivos: contratosAtivos.length,
      valorTotalContratado: items.reduce((sum, c) => sum + c.valorFinal, 0),
      items: query.onlyActive 
        ? contratos.filter(c => ['ASSINADO', 'EM_EXECUCAO'].includes(c.status))
        : contratos
    };
  }
}
