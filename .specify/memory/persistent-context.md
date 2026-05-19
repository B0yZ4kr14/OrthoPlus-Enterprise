# Memoria Persistente Spec Kit - OrthoPlus-Enterprise

Gerado em: 20260518-141826
Origem: /home/b0yz4kr14/Projects/Tunning/SpecKit/scripts/bootstrap-spec-kit-projects.sh


## Finalidade

Este projeto usa Spec Kit como camada de governanca para especificacoes, planos, tarefas e analise antes de implementacao.

## Padrao Profissional

- CLI oficial: `specify-cli v0.8.11` instalado via `git+https://github.com/github/spec-kit.git`.
- Integracao preferencial para Codex: `codex`, scripts `sh`.
- Nao instalar extensoes comunitarias sem revisao de codigo, fonte, permissao e plano de rollback.
- Nao usar `specify init --here --force` sem backup previo de `.specify/`, arquivos de agente e memoria.
- Para upgrade de projeto, preservar `.specify/memory/constitution.md`; a documentacao oficial alerta que `--force` pode sobrescrever a constituicao.

## Workflow Base

1. `$speckit-specify` para declarar o que e por que.
2. `$speckit-clarify` para reduzir ambiguidades.
3. `$speckit-checklist` para testar qualidade dos requisitos.
4. `$speckit-plan` para definir abordagem tecnica.
5. `$speckit-tasks` para gerar tarefas pequenas e ordenadas.
6. `$speckit-analyze` antes de executar.
7. `$speckit-implement` somente quando os gates estiverem verdes.

## Regras Contra Entropia

- Uma feature por objetivo.
- Uma mudanca material por lote.
- Specs antigas devem ser arquivadas ou atualizadas; nao duplicar nomes com semantica conflitante.
- O arquivo `persistent-context.md` deve conter politica duravel, nao diario de execucao.
- Evidencias, logs e relatorios ficam fora da memoria quando forem volumosos.
