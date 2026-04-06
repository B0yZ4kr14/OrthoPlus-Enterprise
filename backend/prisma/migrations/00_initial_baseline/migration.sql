-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "configuracoes";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "faturamento";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "financeiro";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventario";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pacientes";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pdv";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pep";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "abuse_reports" (
    "abuse_type" TEXT NOT NULL,
    "auto_blocked" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "endpoint" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "ip_address" JSONB NOT NULL,
    "resolved" BOOLEAN,
    "resolved_at" TEXT,
    "resolved_by" TEXT,
    "severity" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "abuse_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_configurations" (
    "clinic_id" TEXT NOT NULL,
    "config_data" JSONB NOT NULL,
    "config_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "admin_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analises_radiograficas" (
    "ai_model_version" TEXT,
    "ai_processing_time_ms" INTEGER,
    "auto_approved" BOOLEAN,
    "clinic_id" TEXT NOT NULL,
    "confidence_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "feedback_comments" TEXT,
    "feedback_rating" INTEGER,
    "id" TEXT NOT NULL,
    "imagem_storage_path" TEXT NOT NULL,
    "imagem_url" TEXT NOT NULL,
    "observacoes_dentista" TEXT,
    "patient_id" TEXT NOT NULL,
    "problemas_detectados" INTEGER,
    "prontuario_id" TEXT,
    "resultado_ia" JSONB,
    "revisado_em" TEXT,
    "revisado_por" TEXT,
    "revisado_por_dentista" BOOLEAN,
    "status_analise" TEXT NOT NULL,
    "tipo_radiografia" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analises_radiograficas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analises_radiograficas_history" (
    "ai_model_version" TEXT,
    "analise_id" TEXT NOT NULL,
    "confidence_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "problemas_detectados" INTEGER,
    "resultado_ia" JSONB NOT NULL,
    "versao" INTEGER NOT NULL,

    CONSTRAINT "analises_radiograficas_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_confirmations" (
    "appointment_id" TEXT NOT NULL,
    "confirmation_method" TEXT NOT NULL,
    "confirmed_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "id" TEXT NOT NULL,
    "message_content" TEXT,
    "phone_number" TEXT,
    "sent_at" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "appointment_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_reminders" (
    "appointment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "id" TEXT NOT NULL,
    "message_template" TEXT NOT NULL,
    "phone_number" TEXT,
    "reminder_type" TEXT NOT NULL,
    "scheduled_for" TEXT NOT NULL,
    "sent_at" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "appointment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."appointments" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "dentist_id" TEXT NOT NULL,
    "description" TEXT,
    "end_time" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "treatment_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "architecture_decision_records" (
    "adr_number" INTEGER NOT NULL,
    "alternatives_considered" TEXT,
    "clinic_id" TEXT NOT NULL,
    "consequences" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "decided_at" TEXT,
    "decided_by" TEXT,
    "decision" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "superseded_by_adr_id" TEXT,
    "supersedes_adr_id" TEXT,
    "tags" TEXT[],
    "title" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "architecture_decision_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."audit_logs" (
    "action" TEXT NOT NULL,
    "action_type" TEXT,
    "affected_records" JSONB,
    "clinic_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "id" SERIAL NOT NULL,
    "ip_address" JSONB NOT NULL,
    "target_module_id" INTEGER,
    "user_agent" TEXT,
    "user_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trail" (
    "action" TEXT NOT NULL,
    "clinic_id" TEXT,
    "entity_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "ip_address" JSONB NOT NULL,
    "new_values" JSONB,
    "old_values" JSONB,
    "sensitivity_level" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "user_agent" TEXT,
    "user_id" TEXT,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_history" (
    "backup_type" TEXT NOT NULL,
    "checksum_md5" TEXT,
    "checksum_sha256" TEXT,
    "clinic_id" TEXT NOT NULL,
    "completed_at" TEXT,
    "compression_ratio" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "error_message" TEXT,
    "file_path" TEXT,
    "file_size_bytes" INTEGER,
    "format" TEXT,
    "id" TEXT NOT NULL,
    "includes_postgres_dump" BOOLEAN,
    "metadata" JSONB,
    "parent_backup_id" TEXT,
    "restore_tested_at" TEXT,
    "retention_policy_id" TEXT,
    "status" TEXT NOT NULL,
    "transfer_speed_mbps" INTEGER,
    "verified_at" TEXT,

    CONSTRAINT "backup_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_replications" (
    "backup_id" TEXT NOT NULL,
    "checksum_md5" TEXT,
    "completed_at" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "file_size_bytes" INTEGER,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "region" TEXT NOT NULL,
    "replication_status" TEXT NOT NULL,
    "source_clinic_id" TEXT NOT NULL,
    "started_at" TEXT,
    "storage_path" TEXT,
    "storage_provider" TEXT NOT NULL,
    "target_clinic_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "backup_replications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_retention_policies" (
    "auto_delete_enabled" BOOLEAN,
    "backup_type" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "keep_daily" INTEGER NOT NULL,
    "keep_monthly" INTEGER NOT NULL,
    "keep_weekly" INTEGER NOT NULL,
    "keep_yearly" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "backup_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_verification_log" (
    "backup_id" TEXT NOT NULL,
    "details" JSONB,
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "verification_type" TEXT NOT NULL,
    "verified_at" TEXT,

    CONSTRAINT "backup_verification_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_dashboards" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "layout" JSONB,
    "name" TEXT NOT NULL,
    "refresh_interval_minutes" INTEGER,
    "shared_with" TEXT[],
    "tags" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_data_cache" (
    "cache_key" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "expires_at" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "widget_id" TEXT,

    CONSTRAINT "bi_data_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_metrics" (
    "aggregation_period" TEXT NOT NULL,
    "calculation_type" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_sources" TEXT[],
    "description" TEXT,
    "formula" TEXT,
    "id" TEXT NOT NULL,
    "last_calculated_at" TEXT,
    "metadata" JSONB,
    "metric_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trend" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "value" INTEGER,

    CONSTRAINT "bi_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_reports" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "last_generated_at" TEXT,
    "name" TEXT NOT NULL,
    "next_generation_at" TEXT,
    "parameters" JSONB,
    "recipients" TEXT[],
    "report_type" TEXT NOT NULL,
    "schedule" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_widgets" (
    "cache_duration_minutes" INTEGER,
    "chart_type" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dashboard_id" TEXT NOT NULL,
    "data_source" TEXT NOT NULL,
    "display_config" JSONB,
    "height" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position_x" INTEGER NOT NULL,
    "position_y" INTEGER NOT NULL,
    "query_config" JSONB NOT NULL,
    "refresh_on_load" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "widget_type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,

    CONSTRAINT "bi_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."blocked_times" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "dentist_id" TEXT NOT NULL,
    "end_datetime" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "start_datetime" TEXT NOT NULL,

    CONSTRAINT "blocked_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_approvals" (
    "acao" TEXT NOT NULL,
    "alteracoes_realizadas" JSONB,
    "budget_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "motivo" TEXT,
    "usuario_id" TEXT NOT NULL,
    "valor_orcamento" INTEGER NOT NULL,
    "versao" INTEGER NOT NULL,

    CONSTRAINT "budget_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "budget_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dente_regiao" TEXT,
    "desconto_percentual" INTEGER,
    "desconto_valor" INTEGER,
    "descricao" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "ordem" INTEGER NOT NULL,
    "procedimento_id" TEXT,
    "quantidade" INTEGER NOT NULL,
    "valor_total" INTEGER NOT NULL,
    "valor_unitario" INTEGER NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_versions" (
    "budget_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "versao" INTEGER NOT NULL,

    CONSTRAINT "budget_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."budgets" (
    "aprovado_em" TEXT,
    "aprovado_por" TEXT,
    "clinic_id" TEXT NOT NULL,
    "contrato_id" TEXT,
    "convertido_contrato" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_expiracao" TEXT,
    "desconto_percentual" INTEGER,
    "desconto_valor" INTEGER,
    "descricao" TEXT,
    "id" TEXT NOT NULL,
    "motivo_rejeicao" TEXT,
    "numero_orcamento" TEXT NOT NULL,
    "observacoes" TEXT,
    "patient_id" TEXT NOT NULL,
    "rejeitado_em" TEXT,
    "rejeitado_por" TEXT,
    "status" TEXT NOT NULL,
    "tipo_plano" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "validade_dias" INTEGER NOT NULL,
    "valor_subtotal" INTEGER NOT NULL,
    "valor_total" INTEGER NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."caixa_incidentes" (
    "boletim_ocorrencia" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "data_incidente" TEXT NOT NULL,
    "descricao" TEXT,
    "dia_semana" INTEGER NOT NULL,
    "horario_incidente" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "tipo_incidente" TEXT NOT NULL,
    "valor_caixa_momento" INTEGER,
    "valor_perdido" INTEGER,

    CONSTRAINT "caixa_incidentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."caixa_movimentos" (
    "aberto_em" TEXT,
    "caixa_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "diferenca" INTEGER,
    "fechado_em" TEXT,
    "horario_risco" TEXT,
    "id" TEXT NOT NULL,
    "motivo_sangria" TEXT,
    "observacoes" TEXT,
    "risco_calculado" INTEGER,
    "status" TEXT NOT NULL,
    "sugerido_por_ia" BOOLEAN,
    "tipo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "valor_esperado" INTEGER,
    "valor_final" INTEGER,
    "valor_inicial" INTEGER,

    CONSTRAINT "caixa_movimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_metrics" (
    "bounce_rate" INTEGER,
    "campaign_id" TEXT NOT NULL,
    "click_rate" INTEGER,
    "conversion_rate" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "metric_date" TEXT NOT NULL,
    "open_rate" INTEGER,
    "revenue_generated" INTEGER,
    "total_clicked" INTEGER,
    "total_converted" INTEGER,
    "total_delivered" INTEGER,
    "total_errors" INTEGER,
    "total_opened" INTEGER,
    "total_sent" INTEGER,
    "unsubscribe_count" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."campaign_sends" (
    "campaign_id" TEXT NOT NULL,
    "clicked_at" TEXT,
    "converted_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "id" TEXT NOT NULL,
    "message_content" TEXT,
    "metadata" JSONB,
    "opened_at" TEXT,
    "patient_id" TEXT NOT NULL,
    "recipient_contact" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "retry_count" INTEGER,
    "scheduled_for" TEXT NOT NULL,
    "sent_at" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "campaign_sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."campaign_templates" (
    "category" TEXT,
    "clinic_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "template_type" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "variables" JSONB,

    CONSTRAINT "campaign_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."campaign_triggers" (
    "campaign_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delay_days" INTEGER,
    "delay_hours" INTEGER,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "trigger_condition" JSONB NOT NULL,
    "trigger_type" TEXT NOT NULL,

    CONSTRAINT "campaign_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."campanha_envios" (
    "aberto_em" TEXT,
    "campanha_id" TEXT NOT NULL,
    "clicado_em" TEXT,
    "convertido_em" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destinatario_id" TEXT NOT NULL,
    "destinatario_tipo" TEXT NOT NULL,
    "email" TEXT,
    "enviado_em" TEXT,
    "erro_mensagem" TEXT,
    "id" TEXT NOT NULL,
    "status_envio" TEXT NOT NULL,
    "telefone" TEXT,

    CONSTRAINT "campanha_envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."campanhas_inadimplencia" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_envio" TEXT,
    "id" TEXT NOT NULL,
    "inadimplente_id" TEXT,
    "mensagem_enviada" TEXT,
    "resposta_recebida" BOOLEAN,
    "status" TEXT NOT NULL,
    "tipo_campanha" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_recuperado" INTEGER,

    CONSTRAINT "campanhas_inadimplencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."campanhas_marketing" (
    "clinic_id" TEXT NOT NULL,
    "conteudo_template" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_fim" TEXT,
    "data_inicio" TEXT,
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "segmento_alvo" JSONB,
    "status" TEXT NOT NULL,
    "taxa_abertura" INTEGER,
    "taxa_clique" INTEGER,
    "taxa_conversao" INTEGER,
    "tipo" TEXT NOT NULL,
    "total_aberturas" INTEGER,
    "total_cliques" INTEGER,
    "total_conversoes" INTEGER,
    "total_destinatarios" INTEGER,
    "total_enviados" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campanhas_marketing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."clinic_modules" (
    "clinic_id" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "module_catalog_id" INTEGER NOT NULL,
    "subscribed_at" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."clinics" (
    "auto_cleanup_enabled" BOOLEAN,
    "backup_retention_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."cloud_storage_configs" (
    "clinic_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "provider" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cloud_storage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."collection_actions" (
    "action_date" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "message_content" TEXT,
    "overdue_account_id" TEXT NOT NULL,
    "response_received" TEXT,
    "scheduled_for" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "collection_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."collection_automation_config" (
    "action_type" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "days_trigger" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "message_template" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_automation_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."contas_pagar" (
    "anexo_url" TEXT,
    "categoria" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "data_emissao" TEXT NOT NULL,
    "data_pagamento" TEXT,
    "data_vencimento" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "forma_pagamento" TEXT,
    "fornecedor" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "parcela_numero" INTEGER,
    "parcela_total" INTEGER,
    "periodicidade" TEXT,
    "recorrente" BOOLEAN,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor" INTEGER NOT NULL,
    "valor_pago" INTEGER,

    CONSTRAINT "contas_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."contas_receber" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "data_emissao" TEXT NOT NULL,
    "data_pagamento" TEXT,
    "data_vencimento" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "forma_pagamento" TEXT,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "parcela_numero" INTEGER,
    "parcela_total" INTEGER,
    "patient_id" TEXT,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor" INTEGER NOT NULL,
    "valor_pago" INTEGER,

    CONSTRAINT "contas_receber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."contrato_anexos" (
    "caminho_storage" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,

    CONSTRAINT "contrato_anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturamento"."contrato_templates" (
    "ativo" BOOLEAN NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "conteudo_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo_tratamento" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "variaveis_disponiveis" JSONB,

    CONSTRAINT "contrato_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturamento"."contratos" (
    "assinado_em" TEXT,
    "assinatura_dentista_base64" TEXT,
    "assinatura_paciente_base64" TEXT,
    "cancelado_em" TEXT,
    "clinic_id" TEXT NOT NULL,
    "conteudo_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_inicio" TEXT NOT NULL,
    "data_termino" TEXT,
    "hash_blockchain" TEXT,
    "id" TEXT NOT NULL,
    "ip_assinatura" TEXT,
    "motivo_cancelamento" TEXT,
    "numero_contrato" TEXT NOT NULL,
    "orcamento_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "renovacao_automatica" BOOLEAN,
    "status" TEXT NOT NULL,
    "template_id" TEXT,
    "titulo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_contrato" INTEGER NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_activities" (
    "activity_type" TEXT NOT NULL,
    "assigned_to" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "completed_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "outcome" TEXT,
    "scheduled_date" TEXT,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_conversions" (
    "assigned_to" TEXT,
    "clinic_id" TEXT NOT NULL,
    "conversion_type" TEXT NOT NULL,
    "conversion_value" INTEGER,
    "converted_at" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "time_to_convert_days" INTEGER,
    "total_interactions" INTEGER,

    CONSTRAINT "crm_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_interactions" (
    "attachments" JSONB,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration_minutes" INTEGER,
    "id" TEXT NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "next_action" TEXT,
    "next_action_date" TEXT,
    "outcome" TEXT,
    "subject" TEXT,

    CONSTRAINT "crm_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_leads" (
    "assigned_to" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "email" TEXT,
    "estimated_value" INTEGER,
    "id" TEXT NOT NULL,
    "interest_description" TEXT,
    "name" TEXT NOT NULL,
    "next_contact_date" TEXT,
    "notes" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tags" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_stages" (
    "average_time_days" INTEGER,
    "clinic_id" TEXT NOT NULL,
    "color" TEXT,
    "conversion_rate" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."crypto_candlestick_data" (
    "close_price" INTEGER NOT NULL,
    "close_time" TEXT NOT NULL,
    "coin_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "high_price" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "low_price" INTEGER NOT NULL,
    "open_price" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,

    CONSTRAINT "crypto_candlestick_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."crypto_payments" (
    "amount_brl" INTEGER NOT NULL,
    "checkout_link" TEXT,
    "clinic_id" TEXT NOT NULL,
    "confirmations" INTEGER,
    "confirmed_at" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "crypto_amount" INTEGER,
    "crypto_currency" TEXT,
    "currency" TEXT NOT NULL,
    "expires_at" TEXT,
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "metadata" JSONB,
    "order_id" TEXT NOT NULL,
    "qr_code_data" TEXT,
    "status" TEXT NOT NULL,
    "transaction_id" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "crypto_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."crypto_price_alerts" (
    "alert_type" TEXT NOT NULL,
    "auto_convert_on_trigger" BOOLEAN,
    "cascade_enabled" BOOLEAN,
    "cascade_group_id" TEXT,
    "cascade_order" INTEGER,
    "clinic_id" TEXT NOT NULL,
    "coin_type" TEXT NOT NULL,
    "conversion_percentage" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "last_triggered_at" TEXT,
    "notification_method" TEXT[],
    "stop_loss_enabled" BOOLEAN,
    "target_rate_brl" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."dentist_schedules" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "dentist_id" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "start_time" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dentist_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."estoque_pedidos" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_pedido" TEXT NOT NULL,
    "data_prevista_entrega" TEXT,
    "data_recebimento" TEXT,
    "fornecedor_id" TEXT NOT NULL,
    "gerado_automaticamente" BOOLEAN,
    "id" TEXT NOT NULL,
    "numero_pedido" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_total" INTEGER,

    CONSTRAINT "estoque_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."estoque_pedidos_config" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dias_entrega_estimados" INTEGER,
    "gerar_automaticamente" BOOLEAN,
    "id" TEXT NOT NULL,
    "ponto_pedido" INTEGER NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade_reposicao" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estoque_pedidos_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."estoque_pedidos_itens" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "pedido_id" TEXT NOT NULL,
    "preco_unitario" INTEGER NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidade_recebida" INTEGER,
    "valor_total" INTEGER NOT NULL,

    CONSTRAINT "estoque_pedidos_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."fechamento_caixa" (
    "arquivo_sped_gerado_em" TEXT,
    "arquivo_sped_path" TEXT,
    "caixa_movimento_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_fechamento" TEXT NOT NULL,
    "divergencia" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "percentual_divergencia" INTEGER,
    "quantidade_nfce" INTEGER NOT NULL,
    "quantidade_vendas_pdv" INTEGER NOT NULL,
    "total_nfce_emitidas" INTEGER NOT NULL,
    "total_sangrias" INTEGER NOT NULL,
    "total_suprimentos" INTEGER NOT NULL,
    "total_vendas_pdv" INTEGER NOT NULL,
    "vendas_sem_nfce" INTEGER NOT NULL,

    CONSTRAINT "fechamento_caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."financial_categories" (
    "active" BOOLEAN,
    "clinic_id" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro"."financial_transactions" (
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "description" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "payment_method" TEXT,
    "status" TEXT NOT NULL,
    "tags" TEXT[],
    "transaction_date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."fiscal_config" (
    "ambiente" TEXT NOT NULL,
    "certificado_digital" TEXT,
    "clinic_id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "codigo_regime_tributario" INTEGER,
    "contingencia_enabled" BOOLEAN,
    "contingencia_motivo" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "csc_id" TEXT,
    "csc_token" TEXT,
    "email_contabilidade" TEXT,
    "endereco" JSONB,
    "id" TEXT NOT NULL,
    "inscricao_estadual" TEXT,
    "is_active" BOOLEAN,
    "nome_fantasia" TEXT,
    "numero_ultimo_nfce" INTEGER,
    "razao_social" TEXT NOT NULL,
    "regime_tributario" TEXT NOT NULL,
    "senha_certificado" TEXT,
    "serie_nfce" INTEGER,
    "tipo_emissao" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fiscal_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."funcionarios" (
    "avatar_url" TEXT,
    "cargo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_admissao" TEXT NOT NULL,
    "data_nascimento" TEXT NOT NULL,
    "dias_trabalho" INTEGER[],
    "email" TEXT NOT NULL,
    "endereco" JSONB NOT NULL,
    "horario_trabalho" JSONB NOT NULL,
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "observacoes" TEXT,
    "permissoes" JSONB NOT NULL,
    "rg" TEXT,
    "salario" INTEGER NOT NULL,
    "sexo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_events" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_data" JSONB NOT NULL,
    "event_type" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "triggered_by" TEXT,

    CONSTRAINT "github_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_clinico" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "dados_estruturados" JSONB,
    "descricao" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historico_clinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inadimplentes" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dias_atraso" INTEGER NOT NULL,
    "email" TEXT,
    "id" TEXT NOT NULL,
    "nome_paciente" TEXT NOT NULL,
    "observacoes" TEXT,
    "patient_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "telefone" TEXT,
    "ultima_cobranca" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_total_devido" INTEGER NOT NULL,

    CONSTRAINT "inadimplentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integracao_contabil_config" (
    "api_key" TEXT,
    "api_secret" TEXT,
    "api_url" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "codigo_empresa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_contador" TEXT,
    "enviar_nfce_dados" BOOLEAN NOT NULL,
    "enviar_sped_fiscal" BOOLEAN NOT NULL,
    "envio_automatico" BOOLEAN NOT NULL,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "periodicidade_envio" TEXT NOT NULL,
    "software" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integracao_contabil_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integracao_contabil_envios" (
    "arquivo_path" TEXT,
    "arquivo_size_bytes" INTEGER,
    "clinic_id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviado_em" TEXT,
    "erro_mensagem" TEXT,
    "id" TEXT NOT NULL,
    "max_tentativas" INTEGER NOT NULL,
    "periodo_referencia" TEXT NOT NULL,
    "response_data" JSONB,
    "status" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integracao_contabil_envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_agendamentos" (
    "ativo" BOOLEAN NOT NULL,
    "categorias_ids" TEXT[],
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "dia_execucao" INTEGER,
    "dia_semana" INTEGER,
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "notificar_dias_antes" INTEGER,
    "notificar_responsavel" BOOLEAN,
    "observacoes" TEXT,
    "periodicidade" TEXT NOT NULL,
    "proxima_execucao" TEXT,
    "responsavel" TEXT NOT NULL,
    "tipo_inventario" TEXT NOT NULL,
    "ultima_execucao" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."inventario_itens" (
    "contado_em" TEXT,
    "contado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "divergencia" INTEGER,
    "id" TEXT NOT NULL,
    "inventario_id" TEXT NOT NULL,
    "lote" TEXT,
    "observacoes" TEXT,
    "percentual_divergencia" INTEGER,
    "produto_id" TEXT NOT NULL,
    "produto_nome" TEXT NOT NULL,
    "quantidade_fisica" INTEGER,
    "quantidade_sistema" INTEGER NOT NULL,
    "valor_divergencia" INTEGER,
    "valor_unitario" INTEGER NOT NULL,

    CONSTRAINT "inventario_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."inventarios" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "divergencias_encontradas" INTEGER,
    "id" TEXT NOT NULL,
    "itens_contados" INTEGER,
    "numero" TEXT NOT NULL,
    "observacoes" TEXT,
    "responsavel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "total_itens" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_divergencias" INTEGER,

    CONSTRAINT "inventarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_interacoes" (
    "agendou_avaliacao" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "proximo_passo" TEXT,
    "resultado" TEXT,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "lead_interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_tags" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "lead_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "atribuido_a" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "email" TEXT,
    "id" TEXT NOT NULL,
    "interesse" TEXT,
    "motivo_perda" TEXT,
    "nome" TEXT NOT NULL,
    "observacoes" TEXT,
    "origem" TEXT NOT NULL,
    "proximo_followup" TEXT,
    "score_qualidade" INTEGER,
    "status_funil" TEXT NOT NULL,
    "telefone" TEXT,
    "temperatura" TEXT NOT NULL,
    "ultimo_contato" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "utm_campaign" TEXT,
    "utm_medium" TEXT,
    "utm_source" TEXT,
    "valor_estimado" INTEGER,
    "whatsapp" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_consents" (
    "accepted" BOOLEAN NOT NULL,
    "accepted_at" TEXT,
    "accepted_by" TEXT,
    "clinic_id" TEXT NOT NULL,
    "consent_text" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TEXT,
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "metadata" JSONB,
    "patient_id" TEXT NOT NULL,
    "revoked" BOOLEAN,
    "revoked_at" TEXT,
    "revoked_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "lgpd_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_data_consents" (
    "clinic_id" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TEXT,
    "granted" BOOLEAN NOT NULL,
    "granted_at" TEXT,
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "revoked_at" TEXT,

    CONSTRAINT "lgpd_data_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_data_exports" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "download_count" INTEGER,
    "downloaded_at" TEXT,
    "error_message" TEXT,
    "expires_at" TEXT,
    "export_type" TEXT NOT NULL,
    "file_format" TEXT,
    "file_path" TEXT,
    "file_size_bytes" INTEGER,
    "generated_at" TEXT,
    "generated_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "patient_id" TEXT NOT NULL,
    "request_id" TEXT,
    "status" TEXT NOT NULL,
    "tables_included" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lgpd_data_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_data_requests" (
    "clinic_id" TEXT NOT NULL,
    "completed_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_export_id" TEXT,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "patient_id" TEXT NOT NULL,
    "rejection_reason" TEXT,
    "request_type" TEXT NOT NULL,
    "requested_at" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "responded_at" TEXT,
    "responded_by" TEXT,
    "response" TEXT,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lgpd_data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "attempted_at" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_fingerprint" TEXT,
    "email" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "ip_address" TEXT,
    "ip_geolocation" JSONB,
    "session_duration_seconds" INTEGER,
    "success" BOOLEAN NOT NULL,
    "user_agent" TEXT,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "campaign_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "description" TEXT,
    "end_date" TEXT,
    "id" TEXT NOT NULL,
    "last_sent_at" TEXT,
    "metadata" JSONB,
    "name" TEXT NOT NULL,
    "schedule_config" JSONB,
    "send_immediately" BOOLEAN,
    "start_date" TEXT,
    "status" TEXT NOT NULL,
    "target_audience" JSONB,
    "template_id" TEXT,
    "trigger_config" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_catalog" (
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "icon" TEXT,
    "id" SERIAL NOT NULL,
    "module_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "module_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_configuration_templates" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "icon" TEXT,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "modules" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_configuration_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."module_dependencies" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "depends_on_module_id" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,

    CONSTRAINT "module_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "motivo" TEXT,
    "observacoes" TEXT,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidade_anterior" INTEGER NOT NULL,
    "quantidade_atual" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "valor_total" INTEGER NOT NULL,
    "valor_unitario" INTEGER NOT NULL,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."nfce_carta_correcao" (
    "clinic_id" TEXT NOT NULL,
    "codigo_status" TEXT,
    "correcao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_evento" TEXT,
    "id" TEXT NOT NULL,
    "motivo" TEXT,
    "nfce_id" TEXT NOT NULL,
    "protocolo" TEXT,
    "sequencia" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "xml_evento" TEXT,

    CONSTRAINT "nfce_carta_correcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."nfce_contingencia" (
    "chave_acesso" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emitido_em" TEXT NOT NULL,
    "erro_sincronizacao" TEXT,
    "forma_pagamento" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "itens" JSONB NOT NULL,
    "modo_contingencia" TEXT NOT NULL,
    "motivo_contingencia" TEXT NOT NULL,
    "numero_nfce" INTEGER NOT NULL,
    "protocolo_autorizacao" TEXT,
    "serie" INTEGER NOT NULL,
    "sincronizado_em" TEXT,
    "status_sincronizacao" TEXT NOT NULL,
    "tentativas_sincronizacao" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_total" INTEGER NOT NULL,
    "venda_id" TEXT,
    "xml_nfce" TEXT NOT NULL,

    CONSTRAINT "nfce_contingencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."nfce_emitidas" (
    "ambiente" TEXT NOT NULL,
    "chave_acesso" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "contingencia" BOOLEAN,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "data_cancelamento" TEXT,
    "data_emissao" TEXT,
    "error_message" TEXT,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "motivo_cancelamento" TEXT,
    "numero_nfce" INTEGER NOT NULL,
    "pdf_url" TEXT,
    "protocolo_autorizacao" TEXT,
    "qrcode_url" TEXT,
    "serie" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "tipo_emissao" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "valor_total" INTEGER NOT NULL,
    "venda_id" TEXT NOT NULL,
    "xml_cancelamento" TEXT,
    "xml_nfce" TEXT,

    CONSTRAINT "nfce_emitidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."nfce_inutilizacao" (
    "ano" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "codigo_status" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_inutilizacao" TEXT,
    "id" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "motivo" TEXT,
    "numero_final" INTEGER NOT NULL,
    "numero_inicial" INTEGER NOT NULL,
    "protocolo" TEXT,
    "serie" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "xml_inutilizacao" TEXT,

    CONSTRAINT "nfce_inutilizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturamento"."notas_fiscais" (
    "chave_acesso" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "data_emissao" TEXT NOT NULL,
    "data_recebimento" TEXT,
    "destinatario_cnpj" TEXT,
    "destinatario_nome" TEXT,
    "emitente_cnpj" TEXT NOT NULL,
    "emitente_nome" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "observacoes" TEXT,
    "pdf_url" TEXT,
    "serie" TEXT,
    "status" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_icms" INTEGER,
    "valor_iss" INTEGER,
    "valor_total" INTEGER NOT NULL,
    "xml_url" TEXT,

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL,
    "lida_em" TEXT,
    "link_acao" TEXT,
    "mensagem" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."odontogramas" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "history" JSONB NOT NULL,
    "id" TEXT NOT NULL,
    "last_updated" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "teeth" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odontogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_analytics" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "step_name" TEXT,
    "step_number" INTEGER,
    "time_spent_seconds" INTEGER,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "onboarding_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento_itens" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dente_codigo" TEXT,
    "descricao" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "orcamento_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "procedimento_id" TEXT,
    "quantidade" INTEGER NOT NULL,
    "valor_total" INTEGER NOT NULL,
    "valor_unitario" INTEGER NOT NULL,

    CONSTRAINT "orcamento_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento_pagamento" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forma_pagamento" TEXT[],
    "id" TEXT NOT NULL,
    "numero_parcelas" INTEGER,
    "observacoes" TEXT,
    "orcamento_id" TEXT NOT NULL,
    "tipo_pagamento" TEXT NOT NULL,
    "valor_entrada" INTEGER,
    "valor_parcela" INTEGER,

    CONSTRAINT "orcamento_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento_visualizacoes" (
    "duracao_segundos" INTEGER,
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "orcamento_id" TEXT NOT NULL,
    "user_agent" TEXT,
    "visualizado_em" TEXT NOT NULL,

    CONSTRAINT "orcamento_visualizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturamento"."orcamentos" (
    "aprovado_em" TEXT,
    "aprovado_por" TEXT,
    "clinic_id" TEXT NOT NULL,
    "convertido_em" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_validade" TEXT NOT NULL,
    "desconto_percentual" INTEGER,
    "desconto_valor" INTEGER,
    "descricao" TEXT,
    "id" TEXT NOT NULL,
    "motivo_rejeicao" TEXT,
    "numero_orcamento" TEXT NOT NULL,
    "observacoes" TEXT,
    "patient_id" TEXT NOT NULL,
    "prontuario_id" TEXT,
    "rejeitado_em" TEXT,
    "status" TEXT NOT NULL,
    "tipo_plano" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "validade_dias" INTEGER NOT NULL,
    "valor_final" INTEGER NOT NULL,
    "valor_total" INTEGER NOT NULL,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overdue_accounts" (
    "clinic_id" TEXT NOT NULL,
    "conta_receber_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "days_overdue" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "interest_amount" INTEGER,
    "original_amount" INTEGER NOT NULL,
    "patient_id" TEXT NOT NULL,
    "penalty_amount" INTEGER,
    "remaining_amount" INTEGER NOT NULL,
    "risk_level" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overdue_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_accounts" (
    "ativo" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "email_verificado" BOOLEAN NOT NULL,
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "token_verificacao" TEXT,
    "ultimo_acesso" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_messages" (
    "anexos" JSONB,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL,
    "lida_em" TEXT,
    "mensagem" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "remetente_id" TEXT NOT NULL,
    "remetente_tipo" TEXT NOT NULL,

    CONSTRAINT "patient_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_notifications" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL,
    "lida_em" TEXT,
    "link_acao" TEXT,
    "mensagem" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,

    CONSTRAINT "patient_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_preferences" (
    "id" TEXT NOT NULL,
    "idioma" TEXT,
    "lembrete_consulta_horas" INTEGER,
    "notificacoes_email" BOOLEAN,
    "notificacoes_push" BOOLEAN,
    "notificacoes_sms" BOOLEAN,
    "notificacoes_whatsapp" BOOLEAN,
    "patient_id" TEXT NOT NULL,
    "tema" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_sessions" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "patient_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."patient_status_history" (
    "changed_at" TEXT,
    "changed_by" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "from_status" TEXT,
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "patient_id" TEXT NOT NULL,
    "reason" TEXT,
    "to_status" TEXT NOT NULL,

    CONSTRAINT "patient_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."patients" (
    "address_city" TEXT,
    "address_complement" TEXT,
    "address_country" TEXT,
    "address_neighborhood" TEXT,
    "address_number" TEXT,
    "address_state" TEXT,
    "address_street" TEXT,
    "address_zipcode" TEXT,
    "alcohol_frequency" TEXT,
    "allergies_list" TEXT[],
    "birth_date" TEXT NOT NULL,
    "bleeding_disorder_details" TEXT,
    "blood_pressure_diastolic" INTEGER,
    "blood_pressure_systolic" INTEGER,
    "blood_type" TEXT,
    "bmi" INTEGER,
    "campanha_origem_id" TEXT,
    "campanha_origem_nome" TEXT,
    "canal_captacao" TEXT,
    "cardiovascular_details" TEXT,
    "cargo" TEXT,
    "churn_risk_score" INTEGER,
    "clinic_id" TEXT NOT NULL,
    "clinical_observations" TEXT,
    "cnpj_empresa" TEXT,
    "cpf" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "current_medications" TEXT[],
    "data_conversao" TEXT,
    "data_primeiro_contato" TEXT,
    "data_qualificacao" TEXT,
    "data_sharing_consent" BOOLEAN,
    "diabetes_controlled" BOOLEAN,
    "diabetes_type" TEXT,
    "education_level" TEXT,
    "email" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_relationship" TEXT,
    "empresa" TEXT,
    "evento_captacao" TEXT,
    "first_appointment_date" TEXT,
    "full_name" TEXT NOT NULL,
    "gender" TEXT,
    "gum_condition" TEXT,
    "has_alcohol_habit" BOOLEAN,
    "has_allergies" BOOLEAN,
    "has_bleeding_disorder" BOOLEAN,
    "has_cardiovascular_disease" BOOLEAN,
    "has_diabetes" BOOLEAN,
    "has_hepatitis" BOOLEAN,
    "has_hiv" BOOLEAN,
    "has_hypertension" BOOLEAN,
    "has_medication_allergy" BOOLEAN,
    "has_smoking_habit" BOOLEAN,
    "has_systemic_disease" BOOLEAN,
    "heart_rate" INTEGER,
    "height_cm" INTEGER,
    "hepatitis_type" TEXT,
    "hypertension_controlled" BOOLEAN,
    "id" TEXT NOT NULL,
    "image_usage_consent" BOOLEAN,
    "indicado_por" TEXT,
    "indicado_por_dentista_id" TEXT,
    "indicado_por_paciente_id" TEXT,
    "is_breastfeeding" BOOLEAN,
    "is_pregnant" BOOLEAN,
    "last_appointment_date" TEXT,
    "lgpd_consent" BOOLEAN,
    "lgpd_consent_date" TEXT,
    "main_complaint" TEXT,
    "marital_status" TEXT,
    "marketing_campaign" TEXT,
    "marketing_event" TEXT,
    "marketing_promoter" TEXT,
    "marketing_source" TEXT,
    "marketing_telemarketing_agent" TEXT,
    "medication_allergies" TEXT[],
    "nationality" TEXT,
    "occupation" TEXT,
    "oral_hygiene_quality" TEXT,
    "origem_lead" TEXT,
    "pain_level" INTEGER,
    "patient_code" TEXT,
    "payment_status" TEXT,
    "phone_emergency" TEXT,
    "phone_primary" TEXT NOT NULL,
    "phone_secondary" TEXT,
    "preferred_payment_method" TEXT,
    "pregnancy_trimester" INTEGER,
    "promotor_id" TEXT,
    "promotor_nome" TEXT,
    "propensao_indicacao" INTEGER,
    "referral_source" TEXT,
    "rg" TEXT,
    "risk_level" TEXT,
    "risk_score_anesthetic" INTEGER,
    "risk_score_medical" INTEGER,
    "risk_score_overall" INTEGER,
    "risk_score_surgical" INTEGER,
    "smoking_frequency" TEXT,
    "social_name" TEXT,
    "status" TEXT,
    "systemic_diseases" TEXT[],
    "total_appointments" INTEGER,
    "total_debt" INTEGER,
    "total_paid" INTEGER,
    "treatment_consent" BOOLEAN,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "valor_lifetime" INTEGER,
    "valor_ticket_medio" INTEGER,
    "weight_kg" INTEGER,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "active" BOOLEAN,
    "clinic_id" TEXT NOT NULL,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxa_fixa" INTEGER,
    "taxa_percentual" INTEGER,
    "type" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_negotiations" (
    "accepted_at" TEXT,
    "clinic_id" TEXT NOT NULL,
    "completed_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "discount_amount" INTEGER,
    "discount_percentage" INTEGER,
    "first_payment_date" TEXT,
    "id" TEXT NOT NULL,
    "installments" INTEGER,
    "negotiated_amount" INTEGER NOT NULL,
    "original_amount" INTEGER NOT NULL,
    "overdue_account_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_negotiations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."pdv_produtos" (
    "cest" TEXT,
    "cfop" TEXT,
    "clinic_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cofins_aliquota" INTEGER,
    "controla_estoque" BOOLEAN,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "cst_cofins" TEXT,
    "cst_icms" TEXT,
    "cst_pis" TEXT,
    "descricao" TEXT NOT NULL,
    "estoque_atual" INTEGER,
    "estoque_minimo" INTEGER,
    "icms_aliquota" INTEGER,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN,
    "ncm" TEXT,
    "origem_mercadoria" INTEGER,
    "pis_aliquota" INTEGER,
    "tipo" TEXT NOT NULL,
    "unidade_medida" TEXT,
    "updated_at" TIMESTAMP(3),
    "valor_unitario" INTEGER NOT NULL,

    CONSTRAINT "pdv_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."pdv_vendas" (
    "caixa_movimento_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forma_pagamento" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "numero_venda" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_total" INTEGER NOT NULL,

    CONSTRAINT "pdv_vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."pep_anexos" (
    "caminho_storage" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "historico_id" TEXT,
    "id" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,

    CONSTRAINT "pep_anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep_assinaturas" (
    "assinatura_base64" TEXT NOT NULL,
    "historico_id" TEXT,
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "prontuario_id" TEXT NOT NULL,
    "signed_at" TEXT NOT NULL,
    "signed_by" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "user_agent" TEXT,

    CONSTRAINT "pep_assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."pep_evolucoes" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_evolucao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tratamento_id" TEXT NOT NULL,

    CONSTRAINT "pep_evolucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."pep_odontograma" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "dente_codigo" TEXT NOT NULL,
    "faces_afetadas" TEXT[],
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "prontuario_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pep_odontograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."pep_odontograma_data" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "prontuario_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tooth_number" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "pep_odontograma_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."pep_odontograma_history" (
    "changed_teeth" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "prontuario_id" TEXT NOT NULL,
    "snapshot_data" JSONB NOT NULL,

    CONSTRAINT "pep_odontograma_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep_tooth_surfaces" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "odontograma_data_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pep_tooth_surfaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."pep_tratamentos" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_conclusao" TEXT,
    "data_inicio" TEXT NOT NULL,
    "dente_codigo" TEXT,
    "descricao" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "procedimento_id" TEXT,
    "prontuario_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_estimado" INTEGER,

    CONSTRAINT "pep_tratamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."permission_audit_logs" (
    "action" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "id" TEXT NOT NULL,
    "module_catalog_id" INTEGER,
    "target_user_id" TEXT NOT NULL,
    "template_name" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "permission_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_templates" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "icon" TEXT,
    "id" TEXT NOT NULL,
    "module_keys" TEXT[],
    "name" TEXT NOT NULL,

    CONSTRAINT "permission_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescricoes_remotas" (
    "assinatura_digital" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "enviado_em" TEXT,
    "enviado_para_paciente" BOOLEAN,
    "id" TEXT NOT NULL,
    "instrucoes" TEXT,
    "medicamento_dosagem" TEXT,
    "medicamento_duracao" TEXT,
    "medicamento_frequencia" TEXT,
    "medicamento_nome" TEXT,
    "teleconsulta_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "prescricoes_remotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problemas_radiograficos" (
    "analise_id" TEXT NOT NULL,
    "confianca" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dente_codigo" TEXT,
    "descricao" TEXT,
    "id" TEXT NOT NULL,
    "localizacao" TEXT,
    "severidade" TEXT NOT NULL,
    "sugestao_tratamento" TEXT,
    "tipo_problema" TEXT NOT NULL,
    "urgente" BOOLEAN,

    CONSTRAINT "problemas_radiograficos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimento_templates" (
    "categoria" TEXT NOT NULL,
    "clinic_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "descricao" TEXT,
    "id" TEXT NOT NULL,
    "is_public" BOOLEAN,
    "nome" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "tags" TEXT[],
    "tempo_estimado_minutos" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_sugerido" INTEGER NOT NULL,

    CONSTRAINT "procedimento_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."produtos" (
    "ativo" BOOLEAN NOT NULL,
    "categoria" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "codigo_barras" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "fornecedor" TEXT,
    "id" TEXT NOT NULL,
    "localizacao" TEXT,
    "nome" TEXT NOT NULL,
    "observacoes" TEXT,
    "quantidade_atual" INTEGER NOT NULL,
    "quantidade_minima" INTEGER NOT NULL,
    "unidade_medida" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_unitario" INTEGER NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "app_role" TEXT NOT NULL,
    "avatar_url" TEXT,
    "clinic_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" TEXT,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "phone" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pep"."prontuarios" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prontuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiografia_ai_feedback" (
    "analise_id" TEXT NOT NULL,
    "anotacoes_dentista" JSONB,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "diagnostico_correto" TEXT,
    "falsos_negativos" JSONB,
    "falsos_positivos" JSONB,
    "ia_estava_correta" BOOLEAN NOT NULL,
    "id" TEXT NOT NULL,
    "imagem_marcada_url" TEXT,
    "usado_para_treino" BOOLEAN,

    CONSTRAINT "radiografia_ai_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiografia_laudo_templates" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "nome_template" TEXT NOT NULL,
    "template_markdown" TEXT NOT NULL,
    "tipo_radiografia" TEXT NOT NULL,
    "variaveis_disponiveis" JSONB,

    CONSTRAINT "radiografia_laudo_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_config" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabled" BOOLEAN NOT NULL,
    "endpoint" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "max_requests_per_ip" INTEGER NOT NULL,
    "max_requests_per_user" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "window_minutes" INTEGER NOT NULL,

    CONSTRAINT "rate_limit_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_log" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "ip_address" JSONB NOT NULL,
    "request_count" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "window_start" TEXT NOT NULL,

    CONSTRAINT "rate_limit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recalls" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "data_prevista" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "mensagem_personalizada" TEXT,
    "metodo_notificacao" TEXT,
    "notificacao_enviada" BOOLEAN,
    "patient_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tipo_recall" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_availability" (
    "capacity" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "equipment" JSONB,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_number" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "root_actions_log" (
    "action" TEXT NOT NULL,
    "details" JSONB,
    "executed_at" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "ip_address" JSONB NOT NULL,
    "root_user_id" TEXT NOT NULL,
    "target_record_id" TEXT,
    "target_table" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "root_actions_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rum_metrics" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" INTEGER NOT NULL,
    "page_url" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "user_agent" TEXT,
    "user_id" TEXT,

    CONSTRAINT "rum_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sat_mfe_config" (
    "ativo" BOOLEAN NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "codigo_ativacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fabricante" TEXT,
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "metadata" JSONB,
    "modelo" TEXT,
    "numero_serie" TEXT NOT NULL,
    "porta" INTEGER,
    "tipo_equipamento" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "versao_software" TEXT,

    CONSTRAINT "sat_mfe_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sat_mfe_impressoes" (
    "chave_consulta" TEXT,
    "clinic_id" TEXT NOT NULL,
    "codigo_autorizacao" TEXT,
    "config_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "mensagem_retorno" TEXT,
    "metadata" JSONB,
    "nfce_id" TEXT,
    "numero_sessao" TEXT,
    "status" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL,
    "tipo_equipamento" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "venda_id" TEXT,
    "xml_enviado" TEXT,
    "xml_retorno" TEXT,

    CONSTRAINT "sat_mfe_impressoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_backups" (
    "backup_type" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "compression_enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "day_of_month" INTEGER,
    "day_of_week" INTEGER,
    "encryption_enabled" BOOLEAN NOT NULL,
    "frequency" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "include_data" JSONB NOT NULL,
    "includes_postgres_dump" BOOLEAN,
    "is_active" BOOLEAN NOT NULL,
    "last_run_at" TEXT,
    "local_path" TEXT,
    "max_parallel_jobs" INTEGER,
    "name" TEXT NOT NULL,
    "next_run_at" TEXT NOT NULL,
    "notification_emails" TEXT[],
    "retention_policy_id" TEXT,
    "storage_config" JSONB,
    "storage_destination" TEXT,
    "time_of_day" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_exports" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dashboard_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "export_format" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "last_sent_at" TEXT,
    "next_send_at" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "scheduled_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_audit_log" (
    "description" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "issue_type" TEXT NOT NULL,
    "migration_version" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "resolved_at" TEXT NOT NULL,
    "severity" TEXT,

    CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_payment_config" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "percentage" INTEGER NOT NULL,
    "procedure_type" TEXT,
    "professional_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_payment_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_payment_details" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "net_amount" INTEGER NOT NULL,
    "paid_at" TEXT,
    "recipient_id" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "split_amount" INTEGER NOT NULL,
    "split_transaction_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tax_withheld" INTEGER,

    CONSTRAINT "split_payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_payment_recipients" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "recipient_id" TEXT,
    "recipient_name" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "split_fixed_amount" INTEGER,
    "split_percentage" INTEGER,
    "tax_rate" INTEGER,
    "tax_regime" TEXT,

    CONSTRAINT "split_payment_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_payment_rules" (
    "clinic_id" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "rule_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_payment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_payment_transactions" (
    "clinic_id" TEXT NOT NULL,
    "conta_receber_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "id" TEXT NOT NULL,
    "processed_at" TEXT,
    "rule_id" TEXT,
    "split_calculated_at" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "transaction_id" TEXT,

    CONSTRAINT "split_payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_transactions" (
    "clinic_amount" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "processed_at" TEXT,
    "professional_amount" INTEGER NOT NULL,
    "professional_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "split_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_metrics" (
    "clinic_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "metric_type" TEXT NOT NULL,
    "recorded_at" TEXT NOT NULL,
    "unit" TEXT,
    "value" INTEGER NOT NULL,

    CONSTRAINT "system_health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teleconsultas" (
    "appointment_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "conduta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "data_agendada" TEXT NOT NULL,
    "data_finalizada" TEXT,
    "data_iniciada" TEXT,
    "dentist_id" TEXT NOT NULL,
    "diagnostico" TEXT,
    "duracao_minutos" INTEGER,
    "id" TEXT NOT NULL,
    "link_sala" TEXT,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "patient_id" TEXT NOT NULL,
    "recording_url" TEXT,
    "status" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teleconsultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teleodonto_chat" (
    "attachment_type" TEXT,
    "attachment_url" TEXT,
    "id" TEXT NOT NULL,
    "message_text" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "read_at" TEXT,
    "sender_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "sent_at" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "teleodonto_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teleodonto_files" (
    "compartilhado_com_paciente" BOOLEAN,
    "descricao" TEXT,
    "file_name" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT,
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "uploaded_at" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,

    CONSTRAINT "teleodonto_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teleodonto_sessions" (
    "appointment_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "consentimento_assinado_em" TEXT,
    "consentimento_gravacao" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "dentist_id" TEXT NOT NULL,
    "dentist_joined_at" TEXT,
    "diagnostico_preliminar" TEXT,
    "duracao_minutos" INTEGER,
    "ended_at" TEXT,
    "id" TEXT NOT NULL,
    "notas_pos_consulta" TEXT,
    "notas_pre_consulta" TEXT,
    "patient_id" TEXT NOT NULL,
    "patient_joined_at" TEXT,
    "platform" TEXT NOT NULL,
    "prescricoes" JSONB,
    "problemas_tecnicos" TEXT,
    "qualidade_audio" TEXT,
    "qualidade_video" TEXT,
    "recording_url" TEXT,
    "room_id" TEXT,
    "room_url" TEXT,
    "scheduled_end" TEXT NOT NULL,
    "scheduled_start" TEXT NOT NULL,
    "started_at" TEXT,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teleodonto_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminal_command_history" (
    "clinic_id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "duration_ms" INTEGER,
    "executed_at" TEXT NOT NULL,
    "exit_code" INTEGER,
    "id" TEXT NOT NULL,
    "output" TEXT,
    "user_id" TEXT NOT NULL,
    "was_successful" BOOLEAN,

    CONSTRAINT "terminal_command_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiss_batches" (
    "batch_number" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guide_ids" TEXT[],
    "id" TEXT NOT NULL,
    "insurance_company" TEXT NOT NULL,
    "processed_at" TEXT,
    "sent_at" TEXT,
    "status" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "total_guides" INTEGER NOT NULL,

    CONSTRAINT "tiss_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiss_guides" (
    "amount" INTEGER NOT NULL,
    "batch_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guide_number" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "insurance_company" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "procedure_code" TEXT NOT NULL,
    "procedure_name" TEXT NOT NULL,
    "response_date" TEXT,
    "service_date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "submission_date" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiss_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triagem_teleconsulta" (
    "alergias" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fotos_anexas" JSONB,
    "id" TEXT NOT NULL,
    "intensidade_dor" INTEGER,
    "medicamentos_uso" TEXT,
    "sintomas" TEXT[],
    "teleconsulta_id" TEXT NOT NULL,
    "tempo_sintoma" TEXT,

    CONSTRAINT "triagem_teleconsulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_clinic_access" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_clinic_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_module_permissions" (
    "can_delete" BOOLEAN NOT NULL,
    "can_edit" BOOLEAN NOT NULL,
    "can_view" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "module_catalog_id" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_module_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_page_versions" (
    "change_summary" TEXT,
    "changed_by" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "wiki_page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_pages" (
    "category" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL,
    "parent_id" TEXT,
    "slug" TEXT NOT NULL,
    "tags" TEXT[],
    "title" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "wiki_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banco_extratos" (
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER,
    "category" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "source" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "banco_extratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_registers" (
    "clinic_id" TEXT NOT NULL,
    "closed_at" TEXT,
    "closing_obs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "opened_at" TEXT NOT NULL,
    "opened_by" TEXT NOT NULL,
    "saldo_final" INTEGER,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "valor_abertura" INTEGER NOT NULL,

    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_offline_wallets" (
    "address" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT,
    "network" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_offline_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_transactions" (
    "amount" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exchange_id" TEXT,
    "fee" INTEGER,
    "id" TEXT NOT NULL,
    "price_brl" INTEGER,
    "status" TEXT NOT NULL,
    "tx_hash" TEXT,
    "type" TEXT NOT NULL,
    "wallet_id" TEXT,

    CONSTRAINT "crypto_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_wallets" (
    "address" TEXT,
    "balance" INTEGER,
    "clinic_id" TEXT NOT NULL,
    "coin" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exchange" TEXT,
    "id" TEXT NOT NULL,
    "label" TEXT,
    "type" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelidade_badges" (
    "clinic_id" TEXT NOT NULL,
    "condition" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "icon" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fidelidade_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelidade_indicacoes" (
    "bonus_awarded" BOOLEAN,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "indicated_name" TEXT NOT NULL,
    "indicated_phone" TEXT,
    "patient_id" TEXT NOT NULL,
    "reward_points" INTEGER,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fidelidade_indicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelidade_pontos" (
    "amount" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "fidelidade_pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelidade_recompensas" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fidelidade_recompensas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_dashboard" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_referencia" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "metricas" JSONB,
    "periodo" TEXT,
    "total_vendas" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdv_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_metas_gamificacao" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "id" TEXT NOT NULL,
    "meta_tipo" TEXT NOT NULL,
    "meta_valor" INTEGER NOT NULL,
    "periodo" TEXT,
    "progresso" INTEGER,
    "recompensa" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendedor_id" TEXT,

    CONSTRAINT "pdv_metas_gamificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_comissoes" (
    "amount" INTEGER NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "config_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "paid_at" TEXT,
    "percentage" INTEGER,
    "professional_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transaction_id" TEXT,

    CONSTRAINT "split_comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv"."vendedor_metas" (
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "meta_tipo" TEXT NOT NULL,
    "meta_valor" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "progresso" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendedor_id" TEXT NOT NULL,

    CONSTRAINT "vendedor_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendedor_ranking" (
    "clinic_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,
    "total_vendas" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendedor_id" TEXT NOT NULL,
    "vendedor_nome" TEXT,

    CONSTRAINT "vendedor_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes"."event_store" (
    "id" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clinic_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "event_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "clinic_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "configuracoes"."users"("email");

-- CreateIndex
CREATE INDEX "domain_events_aggregate_id_occurred_at_idx" ON "domain_events"("aggregate_id", "occurred_at");

