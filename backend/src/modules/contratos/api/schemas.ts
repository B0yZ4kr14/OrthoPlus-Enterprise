import { z } from 'zod';

export const createContratoSchema = z.object({
  titulo: z.string().max(200),
  conteudo_html: z.string(),
  patient_id: z.string().uuid(),
  numero_contrato: z.string().max(50),
  valor_contrato: z.number().int().nonnegative(),
  status: z.string().optional(),
  data_inicio: z.string(),
  data_termino: z.string().optional(),
  template_id: z.string().uuid().optional(),
  orcamento_id: z.string().uuid().optional(),
});
export const updateContratoSchema = createContratoSchema.partial();
