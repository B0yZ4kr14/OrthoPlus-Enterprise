export interface Procedure {
    id: string;
    nome: string;
    codigo?: string;
    descricao?: string;
    categoria?: string;
    preco?: number;
    duracao_minutos?: number;
    ativo?: boolean;
    created_at?: string;
    updated_at?: string;
}
export interface ProcedureCategory {
    id: string;
    nome: string;
    descricao?: string;
    cor?: string;
}
export interface ProcedureTemplate {
    id: string;
    nome: string;
    procedimentos: Procedure[];
    descricao?: string;
}
export interface CreateProcedureRequest {
    nome: string;
    codigo?: string;
    descricao?: string;
    categoria?: string;
    preco?: number;
    duracao_minutos?: number;
}
export interface UpdateProcedureRequest extends Partial<CreateProcedureRequest> {
    id: string;
}
export interface ProcedureFilters {
    search?: string;
    categoria?: string;
    ativo?: boolean;
}
//# sourceMappingURL=procedimentos.d.ts.map