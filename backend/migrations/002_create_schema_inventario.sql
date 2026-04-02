-- =====================================================================
-- MIGRATION 002: SCHEMA INVENTÁRIO
-- =====================================================================
-- Cria schema dedicado para módulo INVENTÁRIO
-- Migra tabelas: produtos, categorias_produto, estoque_movimentacoes, fornecedores

CREATE SCHEMA IF NOT EXISTS inventario;

-- =====================================================================
-- TABELAS PRINCIPAIS
-- =====================================================================

-- Categorias de Produtos
CREATE TABLE inventario.categorias_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fornecedores
CREATE TABLE inventario.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Produtos
CREATE TABLE inventario.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES inventario.categorias_produto(id),
  fornecedor_id UUID REFERENCES inventario.fornecedores(id),
  unidade_medida VARCHAR(20) DEFAULT 'UN',
  quantidade_estoque DECIMAL(10,2) DEFAULT 0,
  quantidade_minima DECIMAL(10,2) DEFAULT 0,
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  margem_lucro DECIMAL(5,2),
  tem_nfe BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Movimentações de Estoque
CREATE TABLE inventario.estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES inventario.produtos(id),
  tipo VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA, AJUSTE, DEVOLUCAO
  quantidade DECIMAL(10,2) NOT NULL,
  valor_unitario DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  motivo TEXT,
  documento VARCHAR(100),
  usuario_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventários
CREATE TABLE inventario.inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_conclusao TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'EM_ANDAMENTO', -- EM_ANDAMENTO, CONCLUIDO, CANCELADO
  tipo VARCHAR(20) DEFAULT 'GERAL', -- GERAL, PARCIAL, CICLICO
  responsavel_id UUID,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens de Inventário
CREATE TABLE inventario.inventario_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventario_id UUID NOT NULL REFERENCES inventario.inventarios(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES inventario.produtos(id),
  quantidade_sistema DECIMAL(10,2) NOT NULL,
  quantidade_contada DECIMAL(10,2),
  divergencia DECIMAL(10,2),
  valor_divergencia DECIMAL(10,2),
  observacoes TEXT,
  contado_em TIMESTAMPTZ,
  contado_por UUID
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION inventario.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_produto_updated_at BEFORE UPDATE ON inventario.categorias_produto 
FOR EACH ROW EXECUTE FUNCTION inventario.update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON inventario.fornecedores 
FOR EACH ROW EXECUTE FUNCTION inventario.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON inventario.produtos 
FOR EACH ROW EXECUTE FUNCTION inventario.update_updated_at_column();

-- Trigger para atualizar estoque após movimentação
CREATE OR REPLACE FUNCTION inventario.atualizar_estoque_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo IN ('ENTRADA', 'AJUSTE') THEN
    UPDATE inventario.produtos 
    SET quantidade_estoque = quantidade_estoque + NEW.quantidade 
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo IN ('SAIDA', 'DEVOLUCAO') THEN
    UPDATE inventario.produtos 
    SET quantidade_estoque = quantidade_estoque - NEW.quantidade 
    WHERE id = NEW.produto_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER atualizar_estoque_movimentacao AFTER INSERT ON inventario.estoque_movimentacoes
FOR EACH ROW EXECUTE FUNCTION inventario.atualizar_estoque_trigger();

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_produtos_clinic_id ON inventario.produtos(clinic_id);
CREATE INDEX idx_produtos_categoria ON inventario.produtos(categoria_id);
CREATE INDEX idx_produtos_fornecedor ON inventario.produtos(fornecedor_id);
CREATE INDEX idx_produtos_codigo ON inventario.produtos(codigo);
CREATE INDEX idx_movimentacoes_produto ON inventario.estoque_movimentacoes(produto_id);
CREATE INDEX idx_movimentacoes_created_at ON inventario.estoque_movimentacoes(created_at);
CREATE INDEX idx_inventarios_clinic_id ON inventario.inventarios(clinic_id);
CREATE INDEX idx_inventario_itens_inventario ON inventario.inventario_itens(inventario_id);

-- =====================================================================
-- RLS POLICIES (Multi-tenant por clinic_id)
-- =====================================================================

ALTER TABLE inventario.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario.inventarios ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (devem ser refinadas conforme auth do sistema)
CREATE POLICY "Users can view products from their clinic" ON inventario.produtos
  FOR SELECT USING (true); -- Substituir por auth.uid() check

CREATE POLICY "Users can manage products from their clinic" ON inventario.produtos
  FOR ALL USING (true); -- Substituir por auth.uid() check

CREATE POLICY "Users can view inventories from their clinic" ON inventario.inventarios
  FOR SELECT USING (true);

CREATE POLICY "Users can manage inventories from their clinic" ON inventario.inventarios
  FOR ALL USING (true);

-- =====================================================================
-- COMENTÁRIOS
-- =====================================================================

COMMENT ON SCHEMA inventario IS 'Schema dedicado ao módulo INVENTÁRIO - produtos, estoque, fornecedores';
COMMENT ON TABLE inventario.produtos IS 'Produtos de consumo, serviços e itens promocionais';
COMMENT ON TABLE inventario.estoque_movimentacoes IS 'Histórico de todas as movimentações de estoque';
COMMENT ON TABLE inventario.inventarios IS 'Inventários físicos realizados';
