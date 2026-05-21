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

export interface ProblemaDetectado {
  tipo_problema: string
  dente_codigo?: string
  localizacao?: string
  severidade: "LEVE" | "MODERADA" | "GRAVE"
  confianca: number
  descricao?: string
  sugestao_tratamento?: string
  urgente: boolean
}

export interface SugestaoTratamento {
  tratamento: string
  descricao: string
  prioridade: "BAIXA" | "MEDIA" | "ALTA"
}

export interface ResultadoIA {
  problemas_detectados: ProblemaDetectado[]
  sugestoes_tratamento: SugestaoTratamento[]
  observacoes_ia: string
  dentes_avaliados?: number[]
  qualidade_imagem?: string
  requer_avaliacao_especialista?: boolean
}
