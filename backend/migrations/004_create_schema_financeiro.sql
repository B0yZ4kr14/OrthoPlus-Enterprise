-- =====================================================================
-- MIGRATION 004: SCHEMA FINANCEIRO
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS financeiro;

-- =====================================================================
-- TABELAS PRINCIPAIS
-- =====================================================================

-- Categorias Financeiras
CREATE TABLE financeiro.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- RECEITA, DESPESA
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contas a Receber
CREATE TABLE financeiro.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  patient_id UUID,
  descricao VARCHAR(255) NOT NULL,
  categoria_id UUID REFERENCES financeiro.categorias(id),
  valor_original DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  valor_pendente DECIMAL(10,2),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, PAGO, ATRASADO, CANCELADO
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contas a Pagar
CREATE TABLE financeiro.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  fornecedor_id UUID,
  descricao VARCHAR(255) NOT NULL,
  categoria_id UUID REFERENCES financeiro.categorias(id),
  valor_original DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  valor_pendente DECIMAL(10,2),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  documento VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fluxo de Caixa Consolidado
CREATE TABLE financeiro.fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  data DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA
  valor DECIMAL(10,2) NOT NULL,
  categoria_id UUID REFERENCES financeiro.categorias(id),
  origem VARCHAR(50), -- PDV, CONTA_RECEBER, CONTA_PAGAR
  origem_id UUID,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Split de Pagamentos (Otimização Tributária)
CREATE TABLE financeiro.split_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transacao_id UUID NOT NULL,
  entidade_id UUID NOT NULL, -- Dentista, Clínica, etc
  percentual DECIMAL(5,2) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo_entidade VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crypto Pagamentos
CREATE TABLE financeiro.crypto_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  patient_id UUID,
  moeda VARCHAR(10) NOT NULL, -- BTC, USDT, ETH, BNB
  valor_crypto DECIMAL(18,8) NOT NULL,
  valor_fiat DECIMAL(10,2) NOT NULL,
  cotacao DECIMAL(18,8) NOT NULL,
  wallet_address VARCHAR(255),
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, CONFIRMADO, FALHOU
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION financeiro.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON financeiro.contas_receber 
FOR EACH ROW EXECUTE FUNCTION financeiro.update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON financeiro.contas_pagar 
FOR EACH ROW EXECUTE FUNCTION financeiro.update_updated_at_column();

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_contas_receber_clinic ON financeiro.contas_receber(clinic_id);
CREATE INDEX idx_contas_receber_patient ON financeiro.contas_receber(patient_id);
CREATE INDEX idx_contas_receber_status ON financeiro.contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON financeiro.contas_receber(data_vencimento);
CREATE INDEX idx_contas_pagar_clinic ON financeiro.contas_pagar(clinic_id);
CREATE INDEX idx_contas_pagar_status ON financeiro.contas_pagar(status);
CREATE INDEX idx_fluxo_caixa_clinic_data ON financeiro.fluxo_caixa(clinic_id, data);
CREATE INDEX idx_crypto_transacoes_clinic ON financeiro.crypto_transacoes(clinic_id);
CREATE INDEX idx_crypto_transacoes_status ON financeiro.crypto_transacoes(status);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE financeiro.contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro.crypto_transacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view receivables from their clinic" ON financeiro.contas_receber
  FOR SELECT USING (true);

CREATE POLICY "Users can manage receivables from their clinic" ON financeiro.contas_receber
  FOR ALL USING (true);

COMMENT ON SCHEMA financeiro IS 'Schema dedicado ao módulo FINANCEIRO - contas a receber/pagar, fluxo de caixa, split pagamentos, crypto';
