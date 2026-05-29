import { z } from "zod";

// ============================================================================
// User DTO Schema (T5.4 — Architecture Refactor)
// ============================================================================

export const UserRoleSchema = z.enum([
  "admin",
  "dentist",
  "receptionist",
  "assistant",
  "financial",
]);

export const UserDTOSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: UserRoleSchema,
  clinicId: z.string().uuid(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserDTO = z.infer<typeof UserDTOSchema>;

// ============================================================================
// Transaction DTO Schema (T5.4 — Architecture Refactor)
// ============================================================================

export const TransactionTypeSchema = z.enum(["RECEITA", "DESPESA"]);
export const TransactionStatusSchema = z.enum([
  "PENDENTE",
  "PAGO",
  "CANCELADO",
  "ATRASADO",
]);
export const PaymentMethodSchema = z.enum([
  "DINHEIRO",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "PIX",
  "BOLETO",
  "TRANSFERENCIA",
  "CHEQUE",
]);

export const TransactionDTOSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  type: TransactionTypeSchema,
  description: z.string().min(1).max(500),
  amount: z.number().nonnegative(),
  status: TransactionStatusSchema,
  paymentMethod: PaymentMethodSchema.optional(),
  category: z.string().max(100).optional(),
  dueDate: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
  createdBy: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TransactionDTO = z.infer<typeof TransactionDTOSchema>;

export const CreateTransactionRequestSchema = z.object({
  clinicId: z.string().uuid(),
  type: TransactionTypeSchema,
  description: z.string().min(1).max(500),
  amount: z.number().nonnegative(),
  status: TransactionStatusSchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  category: z.string().max(100).optional(),
  dueDate: z.string().datetime().optional(),
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
  createdBy: z.string().uuid().optional(),
});

// ============================================================================
// Dashboard Overview DTO Schema (T5.4 — Architecture Refactor)
// ============================================================================

export const DashboardStatsSchema = z.object({
  totalPatients: z.number().int().nonnegative(),
  todayAppointments: z.number().int().nonnegative(),
  monthlyRevenue: z.number().nonnegative(),
  occupancyRate: z.number().min(0).max(1),
  pendingTreatments: z.number().int().nonnegative(),
  completedTreatments: z.number().int().nonnegative(),
});

export const DashboardChartDataSchema = z.object({
  labels: z.array(z.string()),
  revenue: z.array(z.number()),
  expenses: z.array(z.number()),
  appointments: z.array(z.number()),
  newPatients: z.array(z.number()),
});

export const DashboardOverviewDTOSchema = z.object({
  stats: DashboardStatsSchema,
  charts: DashboardChartDataSchema,
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

export type DashboardOverviewDTO = z.infer<typeof DashboardOverviewDTOSchema>;

// ============================================================================
// Standardized API Response Envelope (T5.5 — Architecture Refactor)
// ============================================================================

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  value: z.unknown().optional(),
});

export const ProblemDetailSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string(),
  errors: z.array(ValidationErrorSchema).optional(),
  timestamp: z.string().datetime().optional(),
  requestId: z.string().uuid().optional(),
});

export function createStandardResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T,
) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: ProblemDetailSchema.nullable(),
    meta: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
      })
      .optional(),
  });
}
