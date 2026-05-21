# Security Review — SA-1/SS-3: Analise IA de Radiografias

> **Status**: BLOCKED — Implementacao PROIBIDA ate mitigacao de riscos CRITICOS e ALTOS
> **Reviewer**: OMK Adversarial Security Review
> **Data**: 2026-05-21
> **Feature**: 003-pep / ia-radiografia (frontend orphan code)
> **Classificacao**: High-Risk Medical AI with LGPD-Sensitive Data

---

## 0. Descoberta Critica: Codigo Orfao no Frontend

O modulo `ia-radiografia` esta **100% implementado no frontend** (28+ arquivos) mas **INEXISTENTE no backend**:

- Frontend chama `/ia-radiografia/upload-e-analisar` → **404 no backend**
- Frontend chama `/api/lovable-ai/analyze` → **404 no backend**
- `LovableAIService.ts` envia `imageBase64` diretamente para endpoint inexistente
- Se ativado, dados de saude seriam perdidos em requisicoes falhas

**Imediato**: Codigo orfao deve ser removido ou completamente refatorado antes de qualquer ativacao.

---

## 1. Findings Adversariais

### F-001: [CRITICO] Transferencia Internacional de Dados de Saude sem Base Legal (LGPD)

**Descricao**: O `LovableAIService.ts` propoe enviar radiografias (dados de saude — art. 5o, II e art. 11 da LGPD) para provedores externos (OpenAI, Google Gemini) sem:
- Consentimento especifico e destacado do paciente para processamento de IA
- Adequacao de nivel de protecao (art. 33 LGPD)
- Clausulas contratuais tipo ou certificacao de bindness
- Data Processing Agreement (DPA) com os provedores

**Ataque simulado**: Um dentista usa a funcionalidade sem informar o paciente. A imagem e enviada para OpenAI. O paciente descobre e processa a clinica + o software. Autoridade Nacional de Protecao de Dados aplica sancao ate 2% do faturamento (art. 52, §3o).

**Mitigacao obrigatoria**:
1. Consentimento LGPD especifico para IA (nao generico)
2. DPA com provedor que garanta: (a) nao treinamento, (b) exclusao sob demanda, (c) localizacao de dados
3. Anonimizacao/pseudonimizacao antes do envio (strip metadados DICOM)
4. Relatorio de Impacto a Protecao de Dados Pessoais (RIPD) conforme art. 38

---

### F-002: [CRITICO] Violacao de Trust Boundary — Dados Sensíveis para API Nao Confiavel

**Descricao**: A `security_constitution.md` define:
- `Backend -> External APIs`: **Untrusted** (TLS, timeout, retry limits apenas)
- `Patient PII`: **High** sensitivity
- `Clinical notes`: **High** sensitivity, dentist-only access

O `LovableAIService.ts` (frontend) envia imagens medicas diretamente para `/api/lovable-ai/analyze` (edge function externa), **bypassando completamente o backend OrthoPlus**:
- Sem `clinicGuard`
- Sem audit trail no backend
- Sem controle de acesso RBAC
- Sem criptografia end-to-end controlada

**Ataque simulado**: Um assistente malicioso com acesso ao browser intercepta o token de sessao e envia radiografias de pacientes VIP para a edge function. Nao ha registro no backend para investigacao.

**Mitigacao obrigatoria**:
1. TODAS as analises de IA devem passar pelo backend OrthoPlus
2. Backend deve ser o unico ponto de contato com APIs externas de IA
3. Audit trail obrigatorio: quem enviou, quando, qual paciente, qual imagem (hash), qual modelo
4. Rate limiting por dentista + por paciente

---

### F-003: [CRITICO] Risco de Responsabilidade Civil Medica (CFO + CDC)

**Descricao**: O spec 003-pep define:
- "Sugestao de diagnostico com nivel de confianca"
- Deteccao automatica de "caries, reabsorcoes, lesoes"

Isso configura **auxilio ao diagnostico medico** (art. 4o da Resolucao CFO-... sobre prontuario eletronico). Problemas:
1. **Automation bias**: Dentista pode confiar cegamente na IA, especialmente com "nivel de confianca" alto
2. **False negatives**: IA nao detecta lesao real → atraso no tratamento → agravamento
3. **False positives**: IA detecta lesao inexistente → tratamento desnecessario → dano estetico/financeiro
4. **Responsabilidade objetiva**: Art. 14 CDC — fornecedor de servico (OrthoPlus) responde por danos

**Ataque simulado**: IA marca confianca de 95% em "sem problemas detectados". Dentista nao faz exame clinico complementar. Seis meses depois, paciente diagnostica tumor de mandibula em estagio avancado. Processo civil contra clinica E contra OrthoPlus.

**Mitigacao obrigatoria**:
1. Aviso legal explicito: "IA eh ferramenta de apoio, NAO substitui julgamento clinico do dentista"
2. Assinatura digital do dentista confirmando revisao humana OBRIGATORIA
3. Disclaimer em TODO output da IA: "Analise sugestiva. Diagnostico definitivo apenas por profissional habilitado."
4. Seguro de responsabilidade civil que cubra uso de IA medica
5. Registro no CFO/ANS (se aplicavel) como software medico classe adequada

---

### F-004: [ALTO] Retencao de Dados para Treinamento — Direito de Eliminacao Violado

**Descricao**: OpenAI e Google podem reter dados enviados via API para:
- Melhoria de modelos (default em muitos tiers)
- Auditoria de seguranca
- Cumprimento legal (subpoenas)

O spec nao menciona:
- Data retention agreement
- Opt-out de treinamento
- Zero-retention policy
- Como garantir o direito de eliminacao (art. 18 LGPD) se dados foram incorporados em pesos de modelo

**Mitigacao obrigatoria**:
1. Contrato com provedor de IA com **zero-retention policy explicita**
2. Provedor deve ser HIPAA-compliant ou equivalente (LGPD)
3. Se provedor nao oferece zero-retention, usar **modelo self-hosted** (ex: LLaVA-Med, RadImageNet)
4. Documentar e auditar politica de retencao a cada 6 meses

---

### F-005: [ALTO] Metadados DICOM Expostos — Identificacao do Paciente

**Descricao**: Arquivos DICOM (radiografias digitais) contem metadados ricos:
- Nome do paciente
- Data de nascimento
- ID do paciente
- Nome da instituicao/clinica
- Equipamento utilizado
- Data/hora do exame

O `LovableAIService.ts` envia `imageBase64` — **nao ha stripping de metadados**.

**Ataque simulado**: Radiografia anonima enviada para OpenAI. Metadados DICOM contem nome completo + CPF. OpenAI retem dados. Vazamento futuro expoe identidade + condicao de saude do paciente.

**Mitigacao obrigatoria**:
1. Strip TODOS os metadados DICOM antes do envio (tags: PatientName, PatientID, PatientBirthDate, InstitutionName)
2. Re-encode da imagem (PNG/JPEG) para eliminar metadados
3. Verificacao automatica: imagem enviada nao pode conter metadados PII
4. Hash da imagem original guardado no backend para audit trail (sem enviar)

---

### F-006: [MEDIO] Ausencia de Consentimento Especifico para IA

**Descricao**: O spec 003-pep menciona "Consentimentos informados (LGPD)" na FR-002, mas:
- Nao ha consentimento ESPECIFICO para processamento de IA
- Consentimento generico nao cobre transferencia internacional + processamento algoritmico
- Art. 9o LGPD: dados de saude exigem finalidade explicita

**Mitigacao obrigatoria**:
1. Tela de consentimento dedicada para IA com:
   - Explicacao em linguagem clara
   - Lista de provedores externos
   - Duracao do consentimento
   - Botao de revogacao facil
2. Log de consentimento com timestamp + IP + hash do termo
3. Revogacao deve impedir futuras analises e solicitar exclusao de dados do provedor

---

### F-007: [MEDIO] Orfandade de Codigo — Risco de Ativacao Acidental

**Descricao**: O modulo `ia-radiografia` (28+ arquivos, hooks, dashboard, testes) esta totalmente implementado no frontend mas **desconectado do backend**:
- Endpoints `/ia-radiografia/*` nao existem no Express
- Endpoint `/api/lovable-ai/analyze` nao existe
- Se um desenvolvedor conectar as rotas sem o security review, ativa funcionalidade perigosa

**Mitigacao obrigatoria**:
1. Remover ou desativar completamente o modulo `ia-radiografia` ate que o backend seja implementado COM controles de seguranca
2. Adicionar feature flag `ENABLE_AI_RADIOGRAPHY` (default: false) com check de todas as mitigacoes
3. Code review obrigatorio de security team antes de ativar a flag

---

## 2. Matriz de Riscos

| ID | Risco | Prob. | Impacto | Nivel | Mitigacao |
|----|-------|-------|---------|-------|-----------|
| F-001 | Transferencia internacional sem base legal | Alta | Catastrofico | **CRITICO** | Consentimento LGPD + DPA + RIPD |
| F-002 | Trust boundary violation | Alta | Catastrofico | **CRITICO** | Backend-only processing + audit |
| F-003 | Responsabilidade civil medica | Media | Catastrofico | **CRITICO** | Disclaimer + assinatura + seguro |
| F-004 | Retencao para treinamento | Alta | Alto | **ALTO** | Zero-retention policy / self-host |
| F-005 | Metadados DICOM expostos | Alta | Alto | **ALTO** | Strip metadados + re-encode |
| F-006 | Consentimento generico | Media | Alto | **MEDIO** | Consentimento especifico + revogacao |
| F-007 | Codigo orfao ativavel | Baixa | Medio | **MEDIO** | Remover/desativar modulo |

---

## 3. Recomendacoes Adversariais

### Opcao A: Proibicao Total (Recomendada pelo Security Review)
**Descricao**: Remover completamente o modulo `ia-radiografia` do codebase.
**Pros**: Zero risco legal, zero risco LGPD, zero risco medico
**Contras**: Perda de funcionalidade diferenciadora
**Implementacao**:
1. Delete `apps/web/src/modules/ia-radiografia/`
2. Delete `apps/web/src/application/use-cases/radiografia/AnalyzeRadiografiaWithAIUseCase.ts`
3. Delete `apps/web/src/infrastructure/external/LovableAIService.ts`
4. Remover referencias no ` OdontogramaAIAnalysis` component
5. Atualizar spec 003-pep: Story 4 removido ou marcado como "Postponed indefinidamente"

### Opcao B: Reimplementacao Segura (Aprovada com condicoes)
**Descricao**: Reimplementar do zero com controles de seguranca obrigatorios.
**Condicoes de aprovacao**:
1. [ ] RIPD aprovado por DPO (Data Protection Officer)
2. [ ] DPA assinado com provedor de IA (zero-retention, nao-treinamento)
3. [ ] Modelo self-hosted aprovado (ex: LLaVA-Med) OU provedor certificado HIPAA/SOC2 Type II
4. [ ] Consentimento especifico LGPD implementado e auditavel
5. [ ] Backend-only processing com audit trail completo
6. [ ] Strip de metadados DICOM implementado e testado
7. [ ] Disclaimer medico + assinatura de revisao humana obrigatoria
8. [ ] Seguro de responsabilidade civil que cubra IA medica
9. [ ] CFO/ANS avaliacao de software medico (se aplicavel)
10. [ ] Feature flag com enable apenas apos review de security team

**Esforco estimado**: 40–60h (security) + 20–30h (legal/compliance) + 30–40h (engenharia)

---

## 4. Decisao: NO-GO com Condicoes

**Status da implementacao**: **BLOQUEADA**

A funcionalidade "Analise IA de Radiografia" NAO pode ser implementada, ativada ou conectada ao backend ate que:

1. TODOS os findings CRITICOS (F-001, F-002, F-003) sejam mitigados
2. TODOS os findings ALTOS (F-004, F-005) sejam mitigados
3. Codigo orfao seja removido OU completamente refatorado com controles

**Próximo passo recomendado**: Executar Opcao A (remocao do modulo orfao) imediatamente para eliminar risco de ativacao acidental.

---

## 5. Appendice: Evidencias Coletadas

| Evidencia | Localizacao | Descricao |
|-----------|-------------|-----------|
| Spec IA | specs/003-pep/spec.md:71-81 | Story 4 — Analise IA de Radiografia (P3) |
| Frontend service | apps/web/src/infrastructure/external/LovableAIService.ts | Envia imageBase64 para /api/lovable-ai/analyze |
| Use case | apps/web/src/application/use-cases/radiografia/AnalyzeRadiografiaWithAIUseCase.ts | Orquestra analise com IA |
| Hook | apps/web/src/modules/ia-radiografia/hooks/useRadiografia.ts | Chama /ia-radiografia/upload-e-analisar |
| Dashboard | apps/web/src/modules/ia-radiografia/components/ | 28+ arquivos de UI implementados |
| Backend gap | backend/src/index.ts | NENHUMA rota /ia-radiografia registrada |
| AI config | apps/web/src/components/settings/ai-model-config/ | UI para configurar API keys OpenAI/Google |
