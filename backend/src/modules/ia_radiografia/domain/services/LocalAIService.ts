import { ResultadoIA } from "../entities/analise"

interface LocalAIResponse {
  problemas_detectados: ResultadoIA["problemas_detectados"]
  observacoes_gerais: string
  dentes_avaliados: number[]
  qualidade_imagem: string
  requer_avaliacao_especialista: boolean
}

export class LocalAIService {
  private endpoint = process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434"
  private model = process.env.AI_LOCAL_MODEL || "llava"

  async analyzeRadiografia(
    imageBuffer: Buffer,
    tipoRadiografia: string,
  ): Promise<{ resultado: LocalAIResponse; confidence: number; processingTimeMs: number }> {
    const startTime = Date.now()

    const prompt = this.buildPrompt(tipoRadiografia)
    const imageBase64 = imageBuffer.toString("base64")

    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        images: [imageBase64],
        stream: false,
        format: "json",
      }),
    })

    if (!response.ok) {
      throw new Error(`Local AI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as { response: string }
    const processingTimeMs = Date.now() - startTime

    let resultado: LocalAIResponse
    try {
      resultado = JSON.parse(data.response)
    } catch {
      // Fallback se modelo nao retornar JSON valido
      resultado = this.parseFallback(data.response, tipoRadiografia)
    }

    // Confidence heuristico: baseado na estrutura do resultado
    const confidence = this.calculateConfidence(resultado)

    return { resultado, confidence, processingTimeMs }
  }

  private buildPrompt(tipoRadiografia: string): string {
    const base = `Voce eh um assistente de analise de radiografias odontologicas. Analise a imagem fornecida e retorne APENAS um JSON valido no seguinte formato, sem texto adicional:

{
  "problemas_detectados": [
    {
      "tipo": "cárie|fratura|reabsorcao|lesao|outro",
      "localizacao": "dente(s) afetado(s) em notacao FDI",
      "severidade": "baixa|moderada|alta|critica",
      "descricao": "descricao detalhada do achado",
      "recomendacao": "tratamento recomendado"
    }
  ],
  "observacoes_gerais": "observacoes gerais sobre a radiografia",
  "dentes_avaliados": [11, 12, ...],
  "qualidade_imagem": "baixa|regular|boa|excelente",
  "requer_avaliacao_especialista": true|false
}

IMPORTANTE: Seja conservador. Sempre indique quando ha necessidade de avaliacao humana. Use nomenclatura FDI.`

    const specific: Record<string, string> = {
      PERIAPICAL: "Foque em: apices radiculares, lesoes periapicais, tratamentos endodonticos.",
      BITE_WING: "Foque em: caries interproximais, crista ossea alveolar, adaptacao de restauracoes.",
      PANORAMICA: "Foque em: visao geral, dentes inclusos, lesoes osseas, ATM, seios maxilares.",
      OCLUSAL: "Foque em: fraturas, dentes inclusos, lesoes na area oclusal.",
      LATERAL: "Foque em: perfil, relacao dentaria, base do cranio.",
    }

    return base + "\n\n" + (specific[tipoRadiografia] || "")
  }

  private parseFallback(rawText: string, tipo: string): LocalAIResponse {
    // Fallback extremamente basico quando modelo nao retorna JSON
    return {
      problemas_detectados: [],
      observacoes_gerais: `Analise indisponivel no momento. Tipo: ${tipo}. Texto raw: ${rawText.slice(0, 200)}`,
      dentes_avaliados: [],
      qualidade_imagem: "regular",
      requer_avaliacao_especialista: true,
    }
  }

  private calculateConfidence(resultado: LocalAIResponse): number {
    let score = 0.5
    if (resultado.dentes_avaliados.length > 0) score += 0.1
    if (resultado.problemas_detectados.length > 0) score += 0.1
    if (resultado.qualidade_imagem === "boa" || resultado.qualidade_imagem === "excelente") score += 0.1
    if (resultado.requer_avaliacao_especialista) score += 0.1
    if (resultado.observacoes_gerais.length > 50) score += 0.1
    return Math.min(score, 0.99)
  }
}
