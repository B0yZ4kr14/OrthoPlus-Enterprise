import { z } from "zod";

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const AI_GATEWAY_API_KEY = process.env.VERCEL_AI_GATEWAY_API_KEY || process.env.AI_GATEWAY_API_KEY;

if (!AI_GATEWAY_API_KEY) {
  console.warn("[AI] VERCEL_AI_GATEWAY_API_KEY não configurada. Módulo AI desativado.");
}

export const TriagemSchema = z.object({
  sintomas: z.string().min(3).max(2000),
  idade: z.number().min(0).max(120).optional(),
  sexo: z.enum(["M", "F", "O"]).optional(),
});

export type TriagemInput = z.infer<typeof TriagemSchema>;

export const TriagemResultSchema = z.object({
  especialidadeSugerida: z.string(),
  urgencia: z.enum(["baixa", "media", "alta", "emergencia"]),
  orientacao: z.string(),
  motivo: z.string(),
});

export type TriagemResult = z.infer<typeof TriagemResultSchema>;

const TRIAGEM_SYSTEM_PROMPT = `Você é um assistente de triagem médica para o sistema OrthoPlus Enterprise.
Analise os sintomas do paciente e retorne APENAS um JSON válido e estritamente no seguinte formato (sem markdown, sem explicações adicionais):
{"especialidadeSugerida":"string","urgencia":"baixa|media|alta|emergencia","orientacao":"string com orientação ao paciente","motivo":"string explicando o raciocínio"}

Regras:
- Se houver sinais de emergência (dor no peito, falta de ar grave, sangramento intenso, perda de consciência, rigidez na nuca com febre), urgencia deve ser "emergencia"
- Para sintomas graves mas não imediatamente life-threatening, use "alta"
- Especialidades comuns: Clinico Geral, Cardiologia, Ortopedia, Dermatologia, Oftalmologia, Otorrino, Ginecologia, Urologia, Pediatria, Neurologia, Psiquiatria, Endocrinologia, Gastroenterologia, Pneumologia, Reumatologia
- Responda SEMPRE em português do Brasil
- Seja empático mas direto nas orientações`;

function buildTriagemPrompt(input: TriagemInput): string {
  let prompt = `Sintomas: ${input.sintomas}`;
  if (input.idade !== undefined) prompt += `\nIdade: ${input.idade} anos`;
  if (input.sexo) prompt += `\nSexo: ${input.sexo}`;
  return prompt;
}

export async function triagemVirtual(input: TriagemInput): Promise<TriagemResult> {
  if (!AI_GATEWAY_API_KEY) {
    throw new Error("AI Gateway API key não configurada");
  }

  const userContent = buildTriagemPrompt(input);

  const response = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AI_GATEWAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "alibaba/qwen3-coder-plus",
      messages: [
        { role: "system", content: TRIAGEM_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI Gateway error ${response.status}: ${error}`);
  }

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Resposta vazia do AI Gateway");
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const parsed = JSON.parse(jsonStr);
    return TriagemResultSchema.parse(parsed);
  } catch (e) {
    console.error("[AI] Falha ao parsear resposta da triagem:", content);
    throw new Error("Resposta da IA em formato inválido");
  }
}

export async function healthCheckAI(): Promise<{ status: string; model?: string }> {
  if (!AI_GATEWAY_API_KEY) {
    return { status: "disabled" };
  }

  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "alibaba/qwen3.5-flash",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      return { status: "ok", model: "vercel-ai-gateway" };
    }
    return { status: `error_${response.status}` };
  } catch (e) {
    return { status: "error" };
  }
}
