// LocalAIResponse types defined below

interface ProblemaDetectado {
  tipo_problema: string;
  dente_codigo?: string;
  localizacao?: string;
  severidade: "LEVE" | "MODERADA" | "GRAVE";
  confianca: number;
  descricao?: string;
  sugestao_tratamento?: string;
  urgente: boolean;
}

interface SugestaoTratamento {
  tratamento: string;
  descricao: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
}

interface LocalAIResponse {
  problemas_detectados: ProblemaDetectado[];
  sugestoes_tratamento: SugestaoTratamento[];
  observacoes_ia: string;
  dentes_avaliados: number[];
  qualidade_imagem: string;
  requer_avaliacao_especialista: boolean;
}

export interface AIModelConfig {
  endpoint: string;
  model: string;
  version?: string;
}

export class LocalAIService {
  private defaultEndpoint =
    process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434";
  private defaultModel = process.env.AI_LOCAL_MODEL || "llava";

  async analyzeRadiografia(
    imageBuffer: Buffer,
    tipoRadiografia: string,
    modelConfig?: AIModelConfig,
  ): Promise<{
    resultado: LocalAIResponse;
    confidence: number;
    processingTimeMs: number;
    modelUsed: string;
    modelVersion?: string;
  }> {
    const startTime = Date.now();

    const endpoint = modelConfig?.endpoint || this.defaultEndpoint;
    const model = modelConfig?.model || this.defaultModel;
    const modelVersion = modelConfig?.version;

    const prompt = this.buildPrompt(tipoRadiografia);
    const imageBase64 = imageBuffer.toString("base64");

    const response = await fetch(`${endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        images: [imageBase64],
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Local AI error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as { response: string };
    const processingTimeMs = Date.now() - startTime;

    let resultado: LocalAIResponse;
    try {
      resultado = JSON.parse(data.response);
    } catch {
      // Fallback se modelo nao retornar JSON valido
      resultado = this.parseFallback(data.response, tipoRadiografia);
    }

    // Confidence heuristico: baseado na estrutura do resultado
    const confidence = this.calculateConfidence(resultado);

    return {
      resultado,
      confidence,
      processingTimeMs,
      modelUsed: model,
      modelVersion,
    };
  }

  private buildPrompt(tipoRadiografia: string): string {
    const base = `Voce eh um assistente de analise de radiografias odontologicas. Analise a imagem fornecida e retorne APENAS um JSON valido no seguinte formato, sem texto adicional:

{
  "problemas_detectados": [
    {
      "tipo_problema": "CARIE|FRATURA|PERIODONTAL|IMPLANTE_NECESSARIO|CANAL|LESAO_PERIAPICAL|OUTROS",
      "dente_codigo": "11",
      "localizacao": "mesial|distal|oclusal|vestibular|lingual|raiz",
      "severidade": "LEVE|MODERADA|GRAVE",
      "confianca": 85,
      "descricao": "descricao detalhada do achado",
      "sugestao_tratamento": "tratamento recomendado",
      "urgente": false
    }
  ],
  "sugestoes_tratamento": [
    {
      "tratamento": "nome do tratamento",
      "descricao": "descricao do tratamento",
      "prioridade": "BAIXA|MEDIA|ALTA"
    }
  ],
  "observacoes_ia": "observacoes gerais sobre a radiografia",
  "dentes_avaliados": [11, 12, ...],
  "qualidade_imagem": "baixa|regular|boa|excelente",
  "requer_avaliacao_especialista": true|false
}

IMPORTANTE: Seja conservador. Sempre indique quando ha necessidade de avaliacao humana. Use nomenclatura FDI. Inclua sugestoes_tratamento separadas dos problemas.`;

    const specific: Record<string, string> = {
      PERIAPICAL:
        "Foque em: apices radiculares, lesoes periapicais, tratamentos endodonticos.",
      BITE_WING:
        "Foque em: caries interproximais, crista ossea alveolar, adaptacao de restauracoes.",
      PANORAMICA:
        "Foque em: visao geral, dentes inclusos, lesoes osseas, ATM, seios maxilares.",
      OCLUSAL: "Foque em: fraturas, dentes inclusos, lesoes na area oclusal.",
      LATERAL: "Foque em: perfil, relacao dentaria, base do cranio.",
    };

    return base + "\n\n" + (specific[tipoRadiografia] || "");
  }

  private parseFallback(rawText: string, tipo: string): LocalAIResponse {
    // Fallback extremamente basico quando modelo nao retorna JSON
    return {
      problemas_detectados: [],
      sugestoes_tratamento: [],
      observacoes_ia: `Analise indisponivel no momento. Tipo: ${tipo}. Texto raw: ${rawText.slice(0, 200)}`,
      dentes_avaliados: [],
      qualidade_imagem: "regular",
      requer_avaliacao_especialista: true,
    };
  }

  private calculateConfidence(resultado: LocalAIResponse): number {
    let score = 0.5;
    if (resultado.dentes_avaliados.length > 0) score += 0.1;
    if (resultado.problemas_detectados.length > 0) score += 0.1;
    if (
      resultado.qualidade_imagem === "boa" ||
      resultado.qualidade_imagem === "excelente"
    )
      score += 0.1;
    if (resultado.requer_avaliacao_especialista) score += 0.1;
    if (resultado.observacoes_ia.length > 50) score += 0.1;
    return Math.min(score, 0.99);
  }
}
