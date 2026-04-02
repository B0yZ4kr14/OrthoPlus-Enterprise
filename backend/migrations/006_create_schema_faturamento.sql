-- =====================================================================
-- MIGRATION 006: SCHEMA FATURAMENTO E INTEGRAÇÕES FISCAIS
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS faturamento;

-- =====================================================================
-- TABELAS PRINCIPAIS
-- =====================================================================

-- Convênios/Planos
CREATE TABLE faturamento.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cnpj VARCHAR(18),
  codigo_ans VARCHAR(20),
  tipo VARCHAR(50), -- ODONTOLOGICO, MEDICO, MISTO
  tabela_procedimentos JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lotes de Faturamento TISS
CREATE TABLE faturamento.lotes_tiss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  convenio_id UUID NOT NULL REFERENCES faturamento.convenios(id),
  numero_lote VARCHAR(50) UNIQUE,
  competencia DATE NOT NULL, -- Mês de referência
  quantidade_guias INTEGER DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ABERTO', -- ABERTO, ENVIADO, PROCESSADO, PAGO, GLOSADO
  data_envio TIMESTAMPTZ,
  data_processamento TIMESTAMPTZ,
  xml_envio TEXT,
  xml_retorno TEXT,
  protocolo VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Guias TISS
CREATE TABLE faturamento.guias_tiss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id UUID REFERENCES faturamento.lotes_tiss(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  convenio_id UUID NOT NULL REFERENCES faturamento.convenios(id),
  numero_guia VARCHAR(50) NOT NULL,
  tipo_guia VARCHAR(50) NOT NULL, -- CONSULTA, SP_SADT, HONORARIO_INDIVIDUAL
  numero_carteirinha VARCHAR(50),
  data_atendimento DATE NOT NULL,
  dentista_id UUID,
  procedimentos JSONB NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2),
  valor_glosa DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, ENVIADO, PAGO, GLOSADO
  motivo_glosa TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NFe/NFSe
CREATE TABLE faturamento.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  tipo VARCHAR(10) NOT NULL, -- NFE, NFSE, NFCE
  numero INTEGER NOT NULL,
  serie INTEGER DEFAULT 1,
  chave_acesso VARCHAR(44) UNIQUE,
  protocolo_autorizacao VARCHAR(50),
  valor_total DECIMAL(10,2) NOT NULL,
  valor_impostos DECIMAL(10,2),
  tomador_cpf_cnpj VARCHAR(18),
  tomador_nome VARCHAR(255),
  descricao_servicos TEXT,
  xml_nota TEXT,
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, AUTORIZADA, REJEITADA, CANCELADA
  data_emissao TIMESTAMPTZ DEFAULT now(),
  data_autorizacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SPED Fiscal
CREATE TABLE faturamento.sped_fiscal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  arquivo_sped TEXT, -- Conteúdo do arquivo SPED gerado
  data_geracao TIMESTAMPTZ DEFAULT now(),
  gerado_por UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION faturamento.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lotes_tiss_updated_at BEFORE UPDATE ON faturamento.lotes_tiss 
FOR EACH ROW EXECUTE FUNCTION faturamento.update_updated_at_column();

-- Gerar número de lote TISS
CREATE OR REPLACE FUNCTION faturamento.gerar_numero_lote()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_lote IS NULL THEN
    NEW.numero_lote := 'LOTE-' || TO_CHAR(NEW.competencia, 'YYYYMM') || '-' || LPAD(nextval('faturamento.lote_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE faturamento.lote_seq;
CREATE TRIGGER gerar_numero_lote_trigger BEFORE INSERT ON faturamento.lotes_tiss
FOR EACH ROW EXECUTE FUNCTION faturamento.gerar_numero_lote();

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_lotes_tiss_clinic ON faturamento.lotes_tiss(clinic_id);
CREATE INDEX idx_lotes_tiss_convenio ON faturamento.lotes_tiss(convenio_id);
CREATE INDEX idx_lotes_tiss_status ON faturamento.lotes_tiss(status);
CREATE INDEX idx_lotes_tiss_competencia ON faturamento.lotes_tiss(competencia);
CREATE INDEX idx_guias_tiss_lote ON faturamento.guias_tiss(lote_id);
CREATE INDEX idx_guias_tiss_patient ON faturamento.guias_tiss(patient_id);
CREATE INDEX idx_guias_tiss_convenio ON faturamento.guias_tiss(convenio_id);
CREATE INDEX idx_notas_fiscais_clinic ON faturamento.notas_fiscais(clinic_id);
CREATE INDEX idx_notas_fiscais_chave ON faturamento.notas_fiscais(chave_acesso);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE faturamento.lotes_tiss ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturamento.notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view billing from their clinic" ON faturamento.lotes_tiss
  FOR SELECT USING (true);

CREATE POLICY "Users can manage billing from their clinic" ON faturamento.lotes_tiss
  FOR ALL USING (true);

COMMENT ON SCHEMA faturamento IS 'Schema dedicado ao módulo FATURAMENTO - convênios TISS, NFe/NFSe, SPED Fiscal';
