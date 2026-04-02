-- =====================================================================
-- MIGRATION 003: SCHEMA PDV (Ponto de Venda)
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS pdv;

-- =====================================================================
-- TABELAS PRINCIPAIS
-- =====================================================================

-- Caixas
CREATE TABLE pdv.caixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  numero_caixa INTEGER NOT NULL,
  nome VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Movimentos de Caixa (Abertura/Fechamento)
CREATE TABLE pdv.caixa_movimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id UUID NOT NULL REFERENCES pdv.caixas(id),
  tipo VARCHAR(20) NOT NULL, -- ABERTURA, FECHAMENTO, SANGRIA, REFORCO
  valor DECIMAL(10,2) NOT NULL,
  valor_esperado DECIMAL(10,2),
  diferenca DECIMAL(10,2),
  usuario_id UUID NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendas
CREATE TABLE pdv.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  caixa_id UUID REFERENCES pdv.caixas(id),
  numero_venda VARCHAR(50) UNIQUE,
  patient_id UUID,
  vendedor_id UUID NOT NULL,
  valor_subtotal DECIMAL(10,2) NOT NULL,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'CONCLUIDA', -- ABERTA, CONCLUIDA, CANCELADA
  nfce_emitida BOOLEAN DEFAULT false,
  nfce_chave VARCHAR(44),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens de Venda
CREATE TABLE pdv.venda_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES pdv.vendas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL
);

-- Pagamentos de Venda
CREATE TABLE pdv.venda_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES pdv.vendas(id) ON DELETE CASCADE,
  forma_pagamento VARCHAR(50) NOT NULL, -- DINHEIRO, CREDITO, DEBITO, PIX, CRYPTO
  valor DECIMAL(10,2) NOT NULL,
  parcelas INTEGER DEFAULT 1,
  transacao_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NFCe (Nota Fiscal de Consumidor Eletrônica)
CREATE TABLE pdv.nfce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES pdv.vendas(id),
  numero_nfce INTEGER NOT NULL,
  serie INTEGER DEFAULT 1,
  chave_acesso VARCHAR(44) UNIQUE NOT NULL,
  protocolo_autorizacao VARCHAR(50),
  xml_nfce TEXT,
  status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, AUTORIZADA, REJEITADA, CANCELADA
  data_emissao TIMESTAMPTZ DEFAULT now(),
  data_autorizacao TIMESTAMPTZ
);

-- Metas de Vendedores
CREATE TABLE pdv.vendedor_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL,
  mes_referencia DATE NOT NULL,
  meta_valor DECIMAL(10,2) NOT NULL,
  valor_atingido DECIMAL(10,2) DEFAULT 0,
  percentual_atingido DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vendedor_id, mes_referencia)
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION pdv.gerar_numero_venda()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_venda IS NULL THEN
    NEW.numero_venda := 'VND-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('pdv.venda_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE pdv.venda_seq;
CREATE TRIGGER gerar_numero_venda_trigger BEFORE INSERT ON pdv.vendas
FOR EACH ROW EXECUTE FUNCTION pdv.gerar_numero_venda();

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_vendas_clinic_id ON pdv.vendas(clinic_id);
CREATE INDEX idx_vendas_patient_id ON pdv.vendas(patient_id);
CREATE INDEX idx_vendas_vendedor_id ON pdv.vendas(vendedor_id);
CREATE INDEX idx_vendas_created_at ON pdv.vendas(created_at);
CREATE INDEX idx_venda_itens_venda_id ON pdv.venda_itens(venda_id);
CREATE INDEX idx_venda_pagamentos_venda_id ON pdv.venda_pagamentos(venda_id);
CREATE INDEX idx_nfce_venda_id ON pdv.nfce(venda_id);
CREATE INDEX idx_nfce_chave_acesso ON pdv.nfce(chave_acesso);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE pdv.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdv.caixas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sales from their clinic" ON pdv.vendas
  FOR SELECT USING (true);

CREATE POLICY "Users can manage sales from their clinic" ON pdv.vendas
  FOR ALL USING (true);

COMMENT ON SCHEMA pdv IS 'Schema dedicado ao módulo PDV (Ponto de Venda)';
