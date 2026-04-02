-- =====================================================================
-- MIGRATION 007: SCHEMA CONFIGURAÇÕES E PARAMETRIZAÇÕES
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS configuracoes;

-- =====================================================================
-- TABELAS PRINCIPAIS
-- =====================================================================

-- Clínicas
CREATE TABLE configuracoes.clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),
  telefone VARCHAR(20),
  email VARCHAR(255),
  site VARCHAR(255),
  logo_url TEXT,
  endereco JSONB,
  horario_funcionamento JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usuários/Profissionais
CREATE TABLE configuracoes.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES configuracoes.clinicas(id),
  nome_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  avatar_url TEXT,
  tipo VARCHAR(50) NOT NULL, -- ADMIN, DENTISTA, RECEPCIONISTA, FINANCEIRO, AUX_CLINICO
  especialidade VARCHAR(100), -- Para dentistas
  cro VARCHAR(20), -- Registro profissional
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permissões de Módulos por Usuário
CREATE TABLE configuracoes.modulo_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES configuracoes.usuarios(id) ON DELETE CASCADE,
  modulo VARCHAR(50) NOT NULL, -- INVENTARIO, PDV, FINANCEIRO, PEP, FATURAMENTO, etc
  permissoes JSONB, -- {read: true, write: true, delete: false, export: true}
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, modulo)
);

-- Configurações Gerais do Sistema
CREATE TABLE configuracoes.parametros_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES configuracoes.clinicas(id),
  chave VARCHAR(100) NOT NULL,
  valor TEXT,
  tipo VARCHAR(20) DEFAULT 'STRING', -- STRING, INTEGER, BOOLEAN, JSON
  descricao TEXT,
  modulo VARCHAR(50), -- Módulo ao qual a configuração pertence
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, chave, modulo)
);

-- Catálogo de Módulos
CREATE TABLE configuracoes.modulo_catalog (
  id SERIAL PRIMARY KEY,
  module_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(50),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true
);

-- Módulos Ativos por Clínica
CREATE TABLE configuracoes.clinic_modules (
  id SERIAL PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES configuracoes.clinicas(id),
  module_catalog_id INTEGER NOT NULL REFERENCES configuracoes.modulo_catalog(id),
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinic_id, module_catalog_id)
);

-- Dependências entre Módulos
CREATE TABLE configuracoes.module_dependencies (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES configuracoes.modulo_catalog(id),
  depends_on_module_id INTEGER NOT NULL REFERENCES configuracoes.modulo_catalog(id),
  UNIQUE(module_id, depends_on_module_id)
);

-- Logs de Auditoria
CREATE TABLE configuracoes.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  clinic_id UUID REFERENCES configuracoes.clinicas(id),
  usuario_id UUID REFERENCES configuracoes.usuarios(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION configuracoes.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON configuracoes.clinicas 
FOR EACH ROW EXECUTE FUNCTION configuracoes.update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON configuracoes.usuarios 
FOR EACH ROW EXECUTE FUNCTION configuracoes.update_updated_at_column();

CREATE TRIGGER update_parametros_sistema_updated_at BEFORE UPDATE ON configuracoes.parametros_sistema 
FOR EACH ROW EXECUTE FUNCTION configuracoes.update_updated_at_column();

CREATE TRIGGER update_clinic_modules_updated_at BEFORE UPDATE ON configuracoes.clinic_modules 
FOR EACH ROW EXECUTE FUNCTION configuracoes.update_updated_at_column();

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_usuarios_clinic ON configuracoes.usuarios(clinic_id);
CREATE INDEX idx_usuarios_email ON configuracoes.usuarios(email);
CREATE INDEX idx_usuarios_tipo ON configuracoes.usuarios(tipo);
CREATE INDEX idx_modulo_permissoes_usuario ON configuracoes.modulo_permissoes(usuario_id);
CREATE INDEX idx_parametros_clinic_modulo ON configuracoes.parametros_sistema(clinic_id, modulo);
CREATE INDEX idx_clinic_modules_clinic ON configuracoes.clinic_modules(clinic_id);
CREATE INDEX idx_audit_logs_clinic ON configuracoes.audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_usuario ON configuracoes.audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_created_at ON configuracoes.audit_logs(created_at);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE configuracoes.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes.parametros_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes.clinic_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users from their clinic" ON configuracoes.usuarios
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage users from their clinic" ON configuracoes.usuarios
  FOR ALL USING (true);

-- =====================================================================
-- SEED DATA - Catálogo de Módulos
-- =====================================================================

INSERT INTO configuracoes.modulo_catalog (module_key, name, description, category, ordem) VALUES
('DASHBOARD', 'Dashboard', 'Visão geral e métricas', 'Core', 1),
('PACIENTES', 'Pacientes', 'Gestão de pacientes e CRM', 'Core', 2),
('PEP', 'Prontuário Eletrônico', 'PEP completo com anamnese, odontograma, tratamentos', 'Core', 3),
('AGENDA', 'Agenda', 'Agendamento e gestão de consultas', 'Core', 4),
('INVENTARIO', 'Inventário', 'Gestão de produtos e estoque', 'Gestão', 5),
('PDV', 'PDV (Ponto de Venda)', 'Vendas, caixa e NFCe', 'Gestão', 6),
('FINANCEIRO', 'Financeiro', 'Contas a receber/pagar, fluxo de caixa', 'Financeiro', 7),
('SPLIT_PAGAMENTO', 'Split de Pagamento', 'Divisão automática de recebimentos', 'Financeiro', 8),
('CRYPTO_PAGAMENTOS', 'Pagamentos Crypto', 'Recebimentos em criptomoedas', 'Financeiro', 9),
('FATURAMENTO', 'Faturamento TISS', 'Faturamento de convênios', 'Compliance', 10),
('NFE', 'Emissão de NFe/NFSe', 'Notas fiscais eletrônicas', 'Compliance', 11),
('LGPD', 'LGPD e Segurança', 'Conformidade LGPD', 'Compliance', 12),
('IA_RADIOGRAFIA', 'IA Radiografia', 'Análise de radiografias com IA', 'Inovação', 13),
('TELEODONTOLOGIA', 'Teleodontologia', 'Consultas remotas', 'Inovação', 14),
('RELATORIOS', 'Relatórios', 'Relatórios gerenciais', 'Gestão', 15),
('CONFIGURACOES', 'Configurações', 'Parametrizações do sistema', 'Admin', 16);

-- Dependências entre módulos
INSERT INTO configuracoes.module_dependencies (module_id, depends_on_module_id) VALUES
((SELECT id FROM configuracoes.modulo_catalog WHERE module_key = 'SPLIT_PAGAMENTO'), (SELECT id FROM configuracoes.modulo_catalog WHERE module_key = 'FINANCEIRO')),
((SELECT id FROM configuracoes.modulo_catalog WHERE module_key = 'CRYPTO_PAGAMENTOS'), (SELECT id FROM configuracoes.modulo_catalog WHERE module_key = 'FINANCEIRO')),
((SELECT id FROM configuracoes.modulo_catalog WHERE module_key = 'NFE'), (SELECT id FROM configuracoes.modulo_catalog WHERE module_key = 'PDV'));

COMMENT ON SCHEMA configuracoes IS 'Schema dedicado ao módulo CONFIGURAÇÕES - clínicas, usuários, permissões, parâmetros do sistema, catálogo de módulos';
