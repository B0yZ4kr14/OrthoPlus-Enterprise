CREATE TABLE IF NOT EXISTS pdv.pdv_venda_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL,
    produto_id TEXT NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario INT NOT NULL,
    valor_desconto INT NOT NULL DEFAULT 0,
    valor_total INT NOT NULL,
    clinic_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdv_venda_itens_venda_id ON pdv.pdv_venda_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_pdv_venda_itens_produto_id ON pdv.pdv_venda_itens(produto_id);
