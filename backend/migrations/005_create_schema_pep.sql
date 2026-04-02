-- =====================================================================
-- MIGRATION 005: SCHEMA PEP (Prontuário Eletrônico do Paciente)
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS pep;

-- =====================================================================
-- TABELAS PRINCIPAIS
-- =====================================================================

-- Prontuários
CREATE TABLE pep.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  numero VARCHAR(50) UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anamnese
CREATE TABLE pep.anamnese (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  queixa_principal TEXT,
  historico_doenca_atual TEXT,
  doencas_preexistentes JSONB,
  medicamentos_uso JSONB,
  alergias JSONB,
  habitos JSONB, -- fumante, alcool, etc
  historico_familiar TEXT,
  data_anamnese TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exame Clínico
CREATE TABLE pep.exame_clinico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  pressao_arterial VARCHAR(20),
  frequencia_cardiaca INTEGER,
  temperatura DECIMAL(4,1),
  exame_extraoral TEXT,
  exame_intraoral TEXT,
  oclusao TEXT,
  articulacao_temporomandibular TEXT,
  observacoes TEXT,
  data_exame TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Odontograma
CREATE TABLE pep.odontograma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  dente_numero INTEGER NOT NULL, -- 11-18, 21-28, 31-38, 41-48
  status VARCHAR(50), -- HIGIDO, CARIADO, RESTAURADO, EXTRAIDO, AUSENTE, IMPLANTE, etc
  faces_afetadas JSONB, -- {mesial: true, distal: false, oclusal: true, vestibular: false, lingual: false}
  observacoes TEXT,
  data_registro TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  UNIQUE(prontuario_id, dente_numero)
);

-- Tratamentos/Procedimentos
CREATE TABLE pep.tratamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  dente_numero INTEGER,
  procedimento VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'PLANEJADO', -- PLANEJADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO
  data_planejamento DATE,
  data_inicio DATE,
  data_conclusao DATE,
  dentista_id UUID,
  valor DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evoluções/Anotações
CREATE TABLE pep.evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  tratamento_id UUID REFERENCES pep.tratamentos(id),
  tipo VARCHAR(50) DEFAULT 'CONSULTA', -- CONSULTA, PROCEDIMENTO, RETORNO, URGENCIA
  descricao TEXT NOT NULL,
  data_atendimento TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Anexos (Radiografias, Fotos, Documentos)
CREATE TABLE pep.anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- RADIOGRAFIA, FOTO, DOCUMENTO, LAUDO, TOMOGRAFIA
  titulo VARCHAR(255),
  descricao TEXT,
  arquivo_url TEXT NOT NULL,
  arquivo_nome VARCHAR(255),
  arquivo_tamanho INTEGER,
  mime_type VARCHAR(100),
  data_upload TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID
);

-- Assinaturas Digitais
CREATE TABLE pep.assinaturas_digitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES pep.prontuarios(id) ON DELETE CASCADE,
  documento_tipo VARCHAR(50) NOT NULL, -- ANAMNESE, TERMO_CONSENTIMENTO, PLANO_TRATAMENTO
  documento_id UUID,
  assinado_por UUID NOT NULL,
  assinatura_hash VARCHAR(255) NOT NULL,
  certificado_digital TEXT,
  data_assinatura TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION pep.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON pep.prontuarios 
FOR EACH ROW EXECUTE FUNCTION pep.update_updated_at_column();

CREATE TRIGGER update_tratamentos_updated_at BEFORE UPDATE ON pep.tratamentos 
FOR EACH ROW EXECUTE FUNCTION pep.update_updated_at_column();

-- Gerar número de prontuário
CREATE OR REPLACE FUNCTION pep.gerar_numero_prontuario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    NEW.numero := 'PRONT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('pep.prontuario_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE pep.prontuario_seq;
CREATE TRIGGER gerar_numero_prontuario_trigger BEFORE INSERT ON pep.prontuarios
FOR EACH ROW EXECUTE FUNCTION pep.gerar_numero_prontuario();

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_prontuarios_patient ON pep.prontuarios(patient_id);
CREATE INDEX idx_prontuarios_clinic ON pep.prontuarios(clinic_id);
CREATE INDEX idx_prontuarios_numero ON pep.prontuarios(numero);
CREATE INDEX idx_anamnese_prontuario ON pep.anamnese(prontuario_id);
CREATE INDEX idx_exame_clinico_prontuario ON pep.exame_clinico(prontuario_id);
CREATE INDEX idx_odontograma_prontuario ON pep.odontograma(prontuario_id);
CREATE INDEX idx_tratamentos_prontuario ON pep.tratamentos(prontuario_id);
CREATE INDEX idx_tratamentos_dentista ON pep.tratamentos(dentista_id);
CREATE INDEX idx_tratamentos_status ON pep.tratamentos(status);
CREATE INDEX idx_evolucoes_prontuario ON pep.evolucoes(prontuario_id);
CREATE INDEX idx_anexos_prontuario ON pep.anexos(prontuario_id);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE pep.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pep.tratamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medical records from their clinic" ON pep.prontuarios
  FOR SELECT USING (true);

CREATE POLICY "Users can manage medical records from their clinic" ON pep.prontuarios
  FOR ALL USING (true);

COMMENT ON SCHEMA pep IS 'Schema dedicado ao módulo PEP (Prontuário Eletrônico do Paciente) - anamnese, odontograma, tratamentos, evoluções';
