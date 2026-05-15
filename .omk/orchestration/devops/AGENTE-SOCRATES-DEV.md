# AGENTE-SOCRATES-DEV
# Questionador Dialético — Dominio DevOps

## Afirmacoes a Questionar

### AF-DEV-001: "O frontend roda em Docker orthoplus-frontend:v2.9.9"
Perguntas:
1. "A imagem v2.9.9 existe localmente? E no registry?"
2. "O container tsiapp-orthoplus usa esta imagem?"
3. "O Dockerfile esta versionado no repo?"
4. "Ha multi-stage build otimizado?"

### AF-DEV-002: "O backend usa host network"
Perguntas:
1. "Por que host network em vez de bridge?"
2. "Isso nao quebra o isolamento?"
3. "Como o backend se comunica com o frontend?"
4. "Ha conflito de porta se outro servico usar 3005?"

### AF-DEV-003: "Redis esta autenticado"
Perguntas:
1. "A senha do Redis esta em .env?"
2. "O backend usa a senha ao conectar?"
3. "Ha binding restrito (127.0.0.1)?"
4. "O Redis esta exposto para a internet?"

### AF-DEV-004: "Nginx serve o frontend e proxy o backend"
Perguntas:
1. "A configuracao do nginx esta versionada?"
2. "O proxy pass funciona para /api?"
3. "Ha SSL termination?"
4. "O CSP header esta configurado?"
