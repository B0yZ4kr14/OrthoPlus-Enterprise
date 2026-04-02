# 🤝 Contributing to Ortho+

Obrigado por considerar contribuir para o Ortho+! Este documento fornece diretrizes para contribuições.

## 📋 Código de Conduta

### Nossos Compromissos

- Manter um ambiente acolhedor e inclusivo
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade

## 🚀 Como Contribuir

### 1. Reportando Bugs

Encontrou um bug? Siga estes passos:

1. **Verifique se já existe:** Procure em [Issues](https://github.com/your-org/orthoplus/issues)
2. **Crie uma Issue detalhada:**
   - Título claro e descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Versão do sistema e browser

```markdown
### Bug Report
**Descrição:** O botão de salvar não funciona na tela de pacientes

**Passos para reproduzir:**
1. Navegar para /pacientes/novo
2. Preencher o formulário
3. Clicar em "Salvar"

**Esperado:** Paciente deve ser salvo
**Atual:** Nada acontece

**Ambiente:**
- Browser: Chrome 120
- OS: Windows 11
- Versão: 4.0.0
```

### 2. Sugerindo Features

Tem uma ideia? Adoraríamos ouvir!

1. **Crie uma Feature Request:**
   - Descreva o problema que resolve
   - Explique a solução proposta
   - Liste alternativas consideradas
   - Adicione mockups se possível

```markdown
### Feature Request
**Problema:** Dentistas precisam comparar odontogramas de diferentes datas

**Solução:** Adicionar visualização lado-a-lado de odontogramas

**Alternativas:**
- Overlay de odontogramas
- Timeline interativa

**Mockup:** [anexar imagem]
```

### 3. Pull Requests

#### Preparação

```bash
# 1. Fork o repositório
# 2. Clone seu fork
git clone https://github.com/YOUR-USERNAME/orthoplus.git

# 3. Crie uma branch
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix

# 4. Configure o remote upstream
git remote add upstream https://github.com/your-org/orthoplus.git
```

#### Desenvolvimento

```bash
# Mantenha seu fork atualizado
git fetch upstream
git rebase upstream/main

# Faça suas alterações
# Siga os padrões de código (veja abaixo)

# Teste suas alterações
npm test
npm run lint
npm run type-check

# Commit (seguindo Conventional Commits)
git add .
git commit -m "feat: adiciona comparação de odontogramas"
```

#### Submissão

```bash
# Push para seu fork
git push origin feature/minha-feature

# Abra um Pull Request no GitHub
# Preencha o template completamente
```

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ BOM
interface PatientProps {
  id: string;
  name: string;
  email?: string;
}

function createPatient(props: PatientProps): Patient {
  // implementação
}

// ❌ RUIM
function createPatient(id, name, email) {
  // sem tipos
}
```

### React Components

```typescript
// ✅ BOM - Functional Component com TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn('btn', variant)}
    >
      {label}
    </button>
  );
}

// ❌ RUIM - Sem props interface
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Commits (Conventional Commits)

```bash
# Features
git commit -m "feat: adiciona busca de pacientes"

# Fixes
git commit -m "fix: corrige cálculo de idade"

# Documentation
git commit -m "docs: atualiza README"

# Style (formatting, etc)
git commit -m "style: formata código com prettier"

# Refactor
git commit -m "refactor: extrai lógica de validação"

# Performance
git commit -m "perf: melhora performance de listagem"

# Tests
git commit -m "test: adiciona testes para Patient entity"

# Chore
git commit -m "chore: atualiza dependências"
```

### Testes

```typescript
// ✅ BOM - Teste descritivo e completo
describe('Patient Entity', () => {
  describe('create', () => {
    it('should create a patient with valid data', () => {
      const patient = Patient.create({
        name: 'João Silva',
        cpf: '123.456.789-00'
      });

      expect(patient.id).toBeDefined();
      expect(patient.name).toBe('João Silva');
      expect(patient.cpf.value).toBe('123.456.789-00');
    });

    it('should throw error with invalid CPF', () => {
      expect(() => {
        Patient.create({
          name: 'João Silva',
          cpf: 'invalid'
        });
      }).toThrow('CPF inválido');
    });
  });
});
```

## 🏗️ Arquitetura

Seguimos **Domain-Driven Design (DDD)**:

```
src/modules/pacientes/
├── domain/           # Lógica de negócio pura
│   ├── entities/     # Entidades (Patient, etc)
│   ├── value-objects/# Value Objects (CPF, Email)
│   └── repositories/ # Interfaces
├── application/      # Casos de uso
│   └── use-cases/    # CreatePatient, UpdatePatient
├── infrastructure/   # Implementação técnica
│   └── repositories/ # PostgresPatientRepository
└── presentation/     # UI
    ├── components/   # PatientCard, PatientForm
    ├── hooks/        # usePatients
    └── pages/        # PatientsPage
```

## ✅ Checklist do PR

Antes de submeter, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Commits seguem Conventional Commits
- [ ] Sem conflitos com `main`
- [ ] Build passa (`npm run build`)
- [ ] Linter passa (`npm run lint`)
- [ ] Type check passa (`npm run type-check`)
- [ ] Tests passam (`npm test`)

## 🔍 Code Review

### O que esperamos

- Código limpo e legível
- Testes adequados
- Performance considerada
- Segurança (especialmente RLS)
- Acessibilidade (a11y)
- Responsividade

### O que evitar

- Commits sem mensagem clara
- Código não testado
- Breaking changes sem aviso
- Dependências desnecessárias
- Código comentado (use git history)

## 📞 Dúvidas?

- **Discord:** [Link do Discord]
- **Email:** dev@orthoplus.com
- **Documentação:** `/docs`

## 🎉 Reconhecimento

Todos os contribuidores são listados em [CONTRIBUTORS.md](./CONTRIBUTORS.md)!

---

**Obrigado por tornar o Ortho+ melhor! 🦷✨**
