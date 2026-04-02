import { z } from 'zod';

export const createFuncionarioSchema = z.object({
  nome: z.string().max(200),
  cargo: z.string().max(100),
  email: z.string().email(),
  telefone: z.string().max(20).optional(),
  celular: z.string().max(20),
  cpf: z.string().max(14),
  data_nascimento: z.string(),
  data_admissao: z.string(),
  permissoes: z.any(),
  status: z.string().optional(),
  salario: z.number().int().nonnegative().optional(),
  sexo: z.string().optional(),
  endereco: z.any().optional(),
  horario_trabalho: z.any().optional(),
  dias_trabalho: z.array(z.number()).optional(),
  rg: z.string().optional(),
});
export const updateFuncionarioSchema = createFuncionarioSchema.partial();
