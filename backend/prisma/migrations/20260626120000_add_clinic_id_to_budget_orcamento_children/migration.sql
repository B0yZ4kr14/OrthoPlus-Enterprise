-- Add clinic_id to budget/orcamento child tables

-- budget_approvals
ALTER TABLE financeiro.budget_approvals ADD COLUMN clinic_id TEXT;

UPDATE financeiro.budget_approvals ba
SET clinic_id = b.clinic_id
FROM financeiro.budgets b
WHERE ba.budget_id = b.id;

ALTER TABLE financeiro.budget_approvals ALTER COLUMN clinic_id SET NOT NULL;
CREATE INDEX idx_budget_approvals_clinic_id ON financeiro.budget_approvals(clinic_id);

-- budget_items
ALTER TABLE financeiro.budget_items ADD COLUMN clinic_id TEXT;

UPDATE financeiro.budget_items bi
SET clinic_id = b.clinic_id
FROM financeiro.budgets b
WHERE bi.budget_id = b.id;

ALTER TABLE financeiro.budget_items ALTER COLUMN clinic_id SET NOT NULL;
CREATE INDEX idx_budget_items_clinic_id ON financeiro.budget_items(clinic_id);

-- budget_versions
ALTER TABLE financeiro.budget_versions ADD COLUMN clinic_id TEXT;

UPDATE financeiro.budget_versions bv
SET clinic_id = b.clinic_id
FROM financeiro.budgets b
WHERE bv.budget_id = b.id;

ALTER TABLE financeiro.budget_versions ALTER COLUMN clinic_id SET NOT NULL;
CREATE INDEX idx_budget_versions_clinic_id ON financeiro.budget_versions(clinic_id);

-- orcamento_itens
ALTER TABLE financeiro.orcamento_itens ADD COLUMN clinic_id TEXT;

UPDATE financeiro.orcamento_itens oi
SET clinic_id = o.clinic_id
FROM faturamento.orcamentos o
WHERE oi.orcamento_id = o.id;

ALTER TABLE financeiro.orcamento_itens ALTER COLUMN clinic_id SET NOT NULL;
CREATE INDEX idx_orcamento_itens_clinic_id ON financeiro.orcamento_itens(clinic_id);

-- orcamento_pagamento
ALTER TABLE financeiro.orcamento_pagamento ADD COLUMN clinic_id TEXT;

UPDATE financeiro.orcamento_pagamento op
SET clinic_id = o.clinic_id
FROM faturamento.orcamentos o
WHERE op.orcamento_id = o.id;

ALTER TABLE financeiro.orcamento_pagamento ALTER COLUMN clinic_id SET NOT NULL;
CREATE INDEX idx_orcamento_pagamento_clinic_id ON financeiro.orcamento_pagamento(clinic_id);

-- orcamento_visualizacoes
ALTER TABLE financeiro.orcamento_visualizacoes ADD COLUMN clinic_id TEXT;

UPDATE financeiro.orcamento_visualizacoes ov
SET clinic_id = o.clinic_id
FROM faturamento.orcamentos o
WHERE ov.orcamento_id = o.id;

ALTER TABLE financeiro.orcamento_visualizacoes ALTER COLUMN clinic_id SET NOT NULL;
CREATE INDEX idx_orcamento_visualizacoes_clinic_id ON financeiro.orcamento_visualizacoes(clinic_id);
