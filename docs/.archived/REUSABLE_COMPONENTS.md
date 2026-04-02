# Componentes Reutilizáveis - Guia de Uso

Este documento descreve os componentes reutilizáveis criados na FASE 3 da refatoração do frontend, fornecendo exemplos práticos de uso.

## DataTable

Componente de tabela genérico com sorting, filtering e paginação integrados.

### Características
- ✅ Busca/filtro em múltiplas colunas
- ✅ Ordenação ascendente/descendente
- ✅ Paginação configurável (10, 25, 50, 100 linhas)
- ✅ Estados de loading e empty integrados
- ✅ Renderização customizada por coluna
- ✅ Totalmente tipado com TypeScript

### Exemplo de Uso

```tsx
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo';
  createdAt: Date;
}

const columns: Column<Patient>[] = [
  {
    key: 'nome',
    label: 'Nome',
    sortable: true,
    width: '25%',
  },
  {
    key: 'email',
    label: 'E-mail',
    sortable: true,
    width: '25%',
  },
  {
    key: 'telefone',
    label: 'Telefone',
    width: '20%',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '15%',
    render: (row) => (
      <Badge variant={row.status === 'ativo' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'actions',
    label: 'Ações',
    width: '15%',
    render: (row) => (
      <Button variant="ghost" size="sm" onClick={() => handleEdit(row.id)}>
        Editar
      </Button>
    ),
  },
];

function PatientsTable() {
  const { patients, loading } = usePatients();

  return (
    <DataTable
      data={patients}
      columns={columns}
      searchable
      searchPlaceholder="Buscar por nome, email ou telefone..."
      searchKeys={['nome', 'email', 'telefone']}
      loading={loading}
      emptyMessage="Nenhum paciente cadastrado"
      emptyDescription="Comece cadastrando seu primeiro paciente"
      pageSize={25}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  );
}
```

---

## EmptyState

Componente para exibir estados vazios de forma consistente e ilustrativa.

### Variantes Disponíveis
- `default`: Estado vazio genérico (ícone: Inbox)
- `search`: Nenhum resultado encontrado (ícone: Search)
- `error`: Erro ao carregar dados (ícone: AlertCircle)
- `no-data`: Sem dados disponíveis (ícone: FileX)

### Exemplos de Uso

```tsx
import { EmptyState } from '@/components/shared/EmptyState';
import { UserPlus } from 'lucide-react';

// Estado vazio padrão
<EmptyState
  message="Nenhum paciente cadastrado"
  description="Você ainda não possui pacientes cadastrados. Clique no botão abaixo para começar."
  action={{
    label: 'Cadastrar Paciente',
    onClick: () => navigate('/pacientes/novo')
  }}
/>

// Resultado de busca vazio
<EmptyState
  variant="search"
  message="Nenhum resultado encontrado"
  description="Não encontramos pacientes com esse critério de busca. Tente usar outros termos."
/>

// Erro ao carregar
<EmptyState
  variant="error"
  message="Erro ao carregar dados"
  description="Não foi possível carregar os pacientes. Tente novamente mais tarde."
  action={{
    label: 'Tentar Novamente',
    onClick: refetch
  }}
/>

// Ícone customizado
<EmptyState
  icon={UserPlus}
  message="Comece agora"
  description="Cadastre seu primeiro paciente para começar a usar o sistema"
/>
```

---

## FormField

Componente de campo de formulário com validação visual aprimorada e ícones de feedback.

### Tipos Suportados
- `text`, `email`, `password`, `number`, `tel`, `url`, `date`, `time`
- `textarea` - área de texto
- `select` - dropdown com opções
- `custom` - campo totalmente customizado

### Exemplos de Uso

```tsx
import { FormField } from '@/components/shared/FormField';
import { useState } from 'react';

function PatientForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<Record<string, boolean>>({});

  // Input de texto com validação
  <FormField
    label="Nome Completo"
    name="nome"
    type="text"
    value={nome}
    onChange={setNome}
    error={errors.nome}
    success={validated.nome}
    required
    helperText="Digite o nome completo do paciente"
    maxLength={100}
  />

  // Email com validação
  <FormField
    label="E-mail"
    name="email"
    type="email"
    value={email}
    onChange={setEmail}
    error={errors.email}
    success={validated.email}
    required
    placeholder="exemplo@email.com"
  />

  // Textarea
  <FormField
    label="Observações"
    name="observacoes"
    type="textarea"
    value={observacoes}
    onChange={setObservacoes}
    rows={4}
    maxLength={500}
    helperText="Informações adicionais sobre o paciente"
  />

  // Select
  <FormField
    label="Status"
    name="status"
    type="select"
    value={status}
    onChange={setStatus}
    options={[
      { value: 'ativo', label: 'Ativo' },
      { value: 'inativo', label: 'Inativo' },
    ]}
    required
  />

  // Custom field
  <FormField
    label="Data de Nascimento"
    name="dataNascimento"
    type="custom"
    error={errors.dataNascimento}
  >
    <DatePicker
      value={dataNascimento}
      onChange={setDataNascimento}
    />
  </FormField>
}
```

### Validação com Zod

```tsx
import { z } from 'zod';

const patientSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .trim()
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres'),
  telefone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
});

function handleSubmit() {
  try {
    const validated = patientSchema.parse({ nome, email, telefone });
    setValidated({ nome: true, email: true, telefone: true });
    setErrors({});
    // Prosseguir com submit
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setValidated({});
    }
  }
}
```

---

## LoadingState

Componente expandido com múltiplas variantes de loading para diferentes contextos.

### Variantes Disponíveis
- `spinner`: Loader circular padrão
- `pulse`: Animação pulsante
- `skeleton`: Skeleton de texto
- `table`: Skeleton de tabela completa
- `grid`: Skeleton de grid cards
- `list`: Skeleton de lista com avatares

### Exemplos de Uso

```tsx
import { LoadingState } from '@/components/shared/LoadingState';

// Spinner simples
<LoadingState 
  variant="spinner" 
  size="lg" 
  message="Carregando pacientes..." 
/>

// Skeleton de tabela
<LoadingState 
  variant="table"
  rows={10}
  columns={5}
/>

// Skeleton de grid (para dashboards)
<LoadingState 
  variant="grid"
  rows={6}
/>

// Skeleton de lista
<LoadingState 
  variant="list"
  rows={8}
/>

// Uso condicional
{loading ? (
  <LoadingState variant="table" rows={10} columns={4} />
) : (
  <DataTable data={patients} columns={columns} />
)}
```

---

## Checklist de Migração

Ao refatorar componentes existentes para usar estes novos componentes:

### Para Tabelas:
- [ ] Substituir tabelas manuais por `<DataTable />`
- [ ] Definir colunas com interface `Column<T>`
- [ ] Configurar `searchKeys` para busca
- [ ] Usar `render` para células customizadas
- [ ] Remover paginação manual (já incluída)

### Para Estados Vazios:
- [ ] Substituir mensagens hardcoded por `<EmptyState />`
- [ ] Escolher variant apropriado
- [ ] Adicionar ações quando aplicável
- [ ] Usar descrições descritivas

### Para Formulários:
- [ ] Substituir inputs manuais por `<FormField />`
- [ ] Implementar validação com Zod
- [ ] Adicionar feedback visual (error/success)
- [ ] Incluir helper texts informativos
- [ ] Definir maxLength apropriado

### Para Loading States:
- [ ] Substituir spinners genéricos por `<LoadingState />`
- [ ] Escolher variant correto para contexto
- [ ] Ajustar `rows` e `columns` para skeleton realista
- [ ] Adicionar mensagens quando relevante

---

## ToastEnhanced

Componente de notificação toast com animações aprimoradas e feedback visual rico. Implementado na FASE 5 com cores WCAG AA compliant e ícones contextuais.

### Variantes Disponíveis
- `success`: Notificação de sucesso (verde, ícone CheckCircle2)
- `error`: Notificação de erro (vermelho, ícone XCircle)
- `warning`: Notificação de alerta (laranja, ícone AlertCircle)
- `info`: Notificação informativa (azul, ícone Info)

### Características
- ✅ Animação slide-in-right com backdrop-blur
- ✅ Border lateral colorido (4px) conforme variante
- ✅ Ícones contextuais automáticos
- ✅ Suporte para ação secundária
- ✅ Botão de fechamento integrado
- ✅ Efeito glassmorphism
- ✅ Cores WCAG AA compliant

### Exemplos de Uso

```tsx
import { ToastEnhanced } from '@/components/ui/toast-enhanced';
import { useState } from 'react';

// Sucesso simples
<ToastEnhanced
  variant="success"
  title="Operação concluída"
  description="Paciente cadastrado com sucesso!"
  onClose={() => setToastOpen(false)}
/>

// Erro com detalhes
<ToastEnhanced
  variant="error"
  title="Erro ao salvar"
  description="Verifique os campos obrigatórios e tente novamente"
  onClose={handleClose}
/>

// Warning com ação
<ToastEnhanced
  variant="warning"
  title="Atenção"
  description="Seu plano expira em 7 dias"
  onClose={handleClose}
  action={{
    label: "Renovar Agora",
    onClick: () => navigate('/billing')
  }}
/>

// Info com navegação
<ToastEnhanced
  variant="info"
  title="Nova mensagem"
  description="Você recebeu uma mensagem do Dr. Silva"
  onClose={handleClose}
  action={{
    label: "Visualizar",
    onClick: () => navigate('/messages/123')
  }}
/>
```

### Integração com Formulários

```tsx
import { useToast } from '@/hooks/use-toast';
import { ToastEnhanced } from '@/components/ui/toast-enhanced';

function PatientForm() {
  const [toastConfig, setToastConfig] = useState(null);

  const handleSubmit = async (data) => {
    try {
      await savePatient(data);
      setToastConfig({
        variant: 'success',
        title: 'Paciente salvo',
        description: `${data.nome} foi cadastrado com sucesso`,
        action: {
          label: 'Ver Paciente',
          onClick: () => navigate(`/pacientes/${newId}`)
        }
      });
    } catch (error) {
      setToastConfig({
        variant: 'error',
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro inesperado',
        action: {
          label: 'Tentar Novamente',
          onClick: () => handleSubmit(data)
        }
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* campos */}
      </form>

      {toastConfig && (
        <ToastEnhanced
          {...toastConfig}
          onClose={() => setToastConfig(null)}
        />
      )}
    </>
  );
}
```

### Padrões de Uso

**Sucesso (success):**
- Cadastros concluídos
- Atualizações salvas
- Exclusões confirmadas
- Uploads finalizados

**Erro (error):**
- Falhas de validação
- Erros de rede
- Operações não autorizadas
- Timeouts

**Warning (warning):**
- Avisos importantes
- Confirmações necessárias
- Limites próximos
- Ações reversíveis

**Info (info):**
- Notificações gerais
- Atualizações do sistema
- Dicas contextuais
- Novas funcionalidades

---

## Performance e Boas Práticas

### DataTable
- Use `React.memo` para renderizações de células pesadas
- Defina `width` em colunas para evitar recálculos de layout
- Configure `pageSize` inicial baseado no uso esperado
- Limite `searchKeys` apenas a campos realmente necessários

### FormField
- Debounce validação assíncrona (ex: verificar email existente)
- Valide apenas após blur ou submit, não em cada keystroke
- Use `maxLength` para prevenir inputs gigantes
- Desabilite campos durante submissão

### LoadingState
- Use skeleton variants para melhor percepção de performance
- Ajuste `rows` para simular conteúdo real esperado
- Evite spinners genéricos, prefira skeletons estruturados

### ToastEnhanced
- Use debounce para evitar múltiplos toasts simultâneos
- Configure timeout automático (3-5s para sucesso, 7-10s para erro)
- Limite toasts ativos na tela (máximo 3-4)
- Use ações para operações reversíveis (undo)

---

## Acessibilidade

Todos os componentes implementam:
- ✅ Atributos ARIA apropriados
- ✅ Navegação por teclado (Tab, Enter, Escape)
- ✅ Feedback visual para estados (focus, hover, disabled)
- ✅ Labels semânticos e descritivos
- ✅ Contraste WCAG AA mínimo
- ✅ Screen reader friendly
