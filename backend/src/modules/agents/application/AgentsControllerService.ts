import { z } from "zod";
import {
  AgentProxyService,
  CRUDRequest,
  BugfixRequest,
  RefactorRequest,
  CodeReviewRequest,
} from "@/modules/agents/services/AgentProxyService";
import { Errors } from "@/middleware/errorHandler";

const FieldDefinitionSchema = z.object({
  name: z.string().min(1, "Nome do campo e obrigatorio"),
  type: z.string().min(1, "Tipo do campo e obrigatorio"),
  required: z.boolean().default(true),
  description: z.string().optional(),
});

const CRUDRequestSchema = z.object({
  entity_name: z.string().min(1, "Nome da entidade e obrigatorio"),
  fields: z
    .array(FieldDefinitionSchema)
    .min(1, "Pelo menos um campo e obrigatorio"),
  clinica_relationship: z.boolean().default(true),
});

const BugfixRequestSchema = z.object({
  bug_report: z
    .string()
    .min(10, "Descricao do bug deve ter pelo menos 10 caracteres"),
  file_path: z.string().optional(),
  error_message: z.string().optional(),
});

const RefactorRequestSchema = z.object({
  target: z.string().min(1, "Alvo da refatoracao e obrigatorio"),
  from_pattern: z.string().min(1, "Padrao atual e obrigatorio"),
  to_pattern: z.string().min(1, "Novo padrao e obrigatorio"),
  scope: z.enum(["file", "module", "project"]).default("module"),
});

const CodeReviewRequestSchema = z.object({
  file_path: z.string().min(1, "Caminho do arquivo e obrigatorio"),
  code: z.string().optional(),
});

export class AgentsControllerService {
  private agentService = new AgentProxyService();

  checkPermission(
    userRole: string | undefined,
    allowedRoles: string[],
  ): boolean {
    return !!userRole && allowedRoles.includes(userRole);
  }

  async health() {
    const health = await this.agentService.health();
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      agent_service: health,
    };
  }

  async createCRUD(body: unknown) {
    const validationResult = CRUDRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw Errors.validation(
        `Dados invalidos: ${JSON.stringify(validationResult.error.errors)}`,
      );
    }

    const data = validationResult.data;
    const result = await this.agentService.createCRUD(data as CRUDRequest);

    return {
      request: {
        entity: data.entity_name,
        fields_count: data.fields.length,
        clinic_relationship: data.clinica_relationship,
      },
      result,
    };
  }

  async createCRUDSimple(body: { entity_name?: string; fields?: string }) {
    const { entity_name, fields } = body;

    if (!entity_name || typeof entity_name !== "string") {
      throw Errors.validation("entity_name e obrigatorio");
    }
    if (!fields || typeof fields !== "string") {
      throw Errors.validation(
        "fields e obrigatorio (ex: nome:String,ativo:Boolean)",
      );
    }

    const result = await this.agentService.createCRUDSimple(
      entity_name,
      fields,
    );

    return {
      request: { entity: entity_name, fields },
      result,
    };
  }

  async fixBug(body: unknown) {
    const validationResult = BugfixRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw Errors.validation(
        `Dados invalidos: ${JSON.stringify(validationResult.error.errors)}`,
      );
    }

    const data = validationResult.data;
    const result = await this.agentService.fixBug(data as BugfixRequest);

    return {
      request: {
        bug_report: data.bug_report.substring(0, 100) + "...",
        file_path: data.file_path,
      },
      result,
    };
  }

  async refactor(body: unknown) {
    const validationResult = RefactorRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw Errors.validation(
        `Dados invalidos: ${JSON.stringify(validationResult.error.errors)}`,
      );
    }

    const data = validationResult.data;
    const result = await this.agentService.refactor(data as RefactorRequest);

    return {
      request: {
        target: data.target,
        from_pattern: data.from_pattern,
        to_pattern: data.to_pattern,
        scope: data.scope,
      },
      result,
    };
  }

  async codeReview(body: unknown) {
    const validationResult = CodeReviewRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw Errors.validation(
        `Dados invalidos: ${JSON.stringify(validationResult.error.errors)}`,
      );
    }

    const data = validationResult.data;
    const result = await this.agentService.codeReview(
      data as CodeReviewRequest,
    );

    return {
      request: {
        file_path: data.file_path,
        has_code: !!data.code,
      },
      result,
    };
  }
}
