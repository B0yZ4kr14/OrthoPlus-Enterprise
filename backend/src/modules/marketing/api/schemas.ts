import { z } from 'zod';

export const createCampanhaSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(2000).optional(),
  campaign_type: z.string(),
  channel: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  target_audience: z.string().optional(),
  status: z.string().optional(),
});
export const updateCampanhaSchema = createCampanhaSchema.partial();

export const createEnvioSchema = z.object({
  campanha_id: z.string().uuid(),
  destinatario_id: z.string().uuid(),
  destinatario_tipo: z.string(),
  email: z.string().email().optional(),
  telefone: z.string().max(20).optional(),
  status_envio: z.string().optional(),
});

export const createRecallSchema = z.object({
  patient_id: z.string().uuid(),
  tipo_recall: z.string().max(100),
  data_prevista: z.string(),
  mensagem_personalizada: z.string().optional(),
  metodo_notificacao: z.string().optional(),
  status: z.string().optional(),
});
