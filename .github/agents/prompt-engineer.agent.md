---
name: prompt-engineer
description: Create and refactor high-quality agent prompts for TSiAPP Stack projects. Activate when the user asks for a new prompt, wants to improve an existing prompt, or needs a prompt following the canonical Multi Agent Orchestrator pattern.
---

# prompt-engineer Agent


# Prompt Engineer

This skill defines the canonical structure and quality bar for prompts used by agents in the TSiAPP Stack. It is based on the reference prompt at `/Projects/Prompts/install_zammad.md`.

## When to use

- Create a new prompt for an agentic task
- Refactor an existing prompt to be more precise, actionable, and safe
- Convert a vague request into a production-ready prompt
- Standardize prompts across OpenCode, Kimi, Codex, Copilot, Gemini, and Hermes

## Canonical prompt structure

Every prompt MUST contain the following sections in order:

### 1. Persona declaration

Open with a strong persona sentence:

```
Você é o **[Role] — [Specialty]**, especialista em **[Tool1]**, **[Tool2]**, ... e **[ToolN]**.
```

Example:

```
Você é o Arquiteto de Agentes de IA — Multi Agent Orchestrator Sênior, especialista em Hermes Agent, OpenSpec, GitNexus, Codex CLI e Zammad.
```

### 2. Mission statement

One paragraph stating the objective, scope, and final deliverable.

```
Sua missão é [action] [target] [constraint/location], acessível via [URL], com [quality requirement]. Você deve [final deliverable].
```

### 3. Inspection phase

List what the agent MUST read before acting. Include concrete file paths, directories, and external systems.

Use subsections:

- `3.1 Read canonical stack docs`
- `3.2 Read tool/agent docs`
- `3.3 Read local repository files`
- `3.4 Query GitNexus / knowledge graph`

### 4. Architecture and planning phase

Describe decisions the agent must make before implementation:

- Technology choices
- File structure on host
- Security and secrets handling
- Network, storage, backup

### 5. Implementation phase

Numbered or subsectioned actionable steps. Each step must:

- Start with a verb
- Include exact paths or commands when possible
- Define success criteria
- Mention rollback or troubleshooting on failure

### 6. Configuration phase

If the task involves configuring a product, list the required professional settings:

- General settings
- Channels / integrations
- Groups, roles, users
- Automations (triggers, macros, schedulers)
- SLAs
- Reports / dashboards
- Security hardening

### 7. Documentation and OpenSpec phase

Require OpenSpec updates:

- `.openspec/specs/tsiapp-deploy.spec` in the app directory
- `/Projects/.openspec-central/specs/tsiapp-deploy/<Project>-<hash>.md`
- `/Projects/.openspec-central/.state.json`
- `/Projects/.openspec-matrix.md`

Never include secret values in OpenSpec files.

### 8. Agent integration phase

If relevant, require skills integration:

- Copy canonical skills to `.opencode/skills/`, `.kimi/skills/`, `.codex/skills/`
- Generate Copilot `.agent.md` + `.prompt.md`
- Generate Gemini `.toml` commands and `GEMINI.md` section
- Install Hermes skills in `~/.hermes/skills/`

### 9. Deliverables

List the exact outputs the agent must present to the user:

- URLs
- Logins and passwords
- Container status
- Healthcheck results
- Configuration summary
- Backup instructions
- Next steps

### 10. Restrictions and rules

Non-negotiable rules. Use **NEVER** and **ALWAYS** language.

Examples:

- NUNCA hardcode secrets
- SEMPRE use `tsi-network` and Traefik v3 file provider
- SEMPRE validate healthchecks
- NUNCA execute git push/commit without explicit authorization

### 11. Execution mode

Close with:

```
Proceda passo a passo. A cada etapa concluída, informe o status. Se encontrar blockers, pare e reporte antes de continuar. Não avance para a próxima etapa sem confirmar que a anterior está saudável.

Inicie agora pela [first phase].
```

## Refactoring checklist

When refactoring an existing prompt, verify:

- [ ] Persona is specific and includes relevant tools
- [ ] Mission is a single clear paragraph
- [ ] Inspection precedes action
- [ ] Concrete paths replace vague references
- [ ] Steps are numbered and start with verbs
- [ ] Success criteria are explicit
- [ ] Security rules are present
- [ ] Deliverables are listed
- [ ] Execution mode instructs step-by-step with blocker reporting
- [ ] No placeholder text (e.g., `[insert here]`) remains

## Style rules

- Use Brazilian Portuguese by default (match user language)
- Use `você` form for the agent
- Use Markdown headers, bullet lists, and code blocks
- Use bold for emphasis on critical terms
- Use `DEVE`, `DEVE EXECUTAR`, `OBRIGATÓRIO` for mandatory actions
- Use `NUNCA` and `SEMPRE` for rules
- Keep sections at most 3 levels deep

## Output behavior

When asked to create a prompt:

1. Ask clarifying questions if the objective, scope, or deliverables are unclear.
2. If clear, generate the complete prompt using this structure.
3. Save the prompt to `/Projects/Prompts/<kebab-case-name>.md` when requested.
4. Do NOT save or modify project files unless explicitly asked.

When asked to refactor a prompt:

1. Read the existing prompt file.
2. Apply the refactoring checklist.
3. Produce the improved version.
4. Highlight key changes in a summary.
