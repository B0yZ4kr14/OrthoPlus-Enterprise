import { TipoRadiografia } from "@prisma/client"

export interface CriarAnaliseDTO {
  clinicId: string
  pacienteId: string
  prontuarioId?: string
  dentistaId: string
  imagemHash: string
  imagemStoragePath: string
  tipoRadiografia: TipoRadiografia
  modeloUsado: string
}

export interface RevisarAnaliseDTO {
  analiseId: string
  dentistaRevisorId: string
  observacoesDentista: string
  assinaturaDigital: string
}

export interface ResultadoIA {
  problemas_detectados: Array<{
    tipo: string
    localizacao: string
    severidade: string
    descricao: string
    recomendacao: string
  }>
  observacoes_gerais: string
  dentes_avaliados: number[]
  qualidade_imagem: string
  requer_avaliacao_especialista: boolean
}
