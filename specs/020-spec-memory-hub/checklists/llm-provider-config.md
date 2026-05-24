# Checklist: LLM Provider Configuration Requirements Quality

**Purpose**: Validate requirements quality for embedding provider configuration (API Keys vs Ollama local)
**Created**: 2026-05-24
**Feature**: specs/020-spec-memory-hub/spec.md
**Context**: User clarified: "Não usar Ollama. Usar API-Key de LLMs"

---

## Requirement Completeness

- [ ] CHK001 - Are requirements defined for embedding provider selection (Ollama vs API-based LLMs)? [Gap, Spec §Dependencies]
- [ ] CHK002 - Are configuration requirements specified for multiple API key providers (OpenAI, Anthropic, Google, etc.)? [Gap]
- [ ] CHK003 - Are fallback requirements defined when the primary embedding provider is unavailable? [Gap, Exception Flow]
- [ ] CHK004 - Are requirements documented for provider-specific rate limiting and quota management? [Gap]
- [ ] CHK005 - Are cost/usage tracking requirements specified for API-based providers? [Gap]

## Requirement Clarity

- [ ] CHK006 - Is the term "API-Key de LLMs" quantified with specific provider models and embedding dimensions? [Clarity, Spec §Dependencies]
- [ ] CHK007 - Are the criteria for choosing between Ollama and API-key providers explicitly defined? [Clarity]
- [ ] CHK008 - Is the embedding model naming convention consistent across provider configurations? [Consistency]
- [ ] CHK009 - Are environment variable naming requirements clear for different provider API keys? [Clarity]
- [ ] CHK010 - Is the expected latency difference between local Ollama and API providers quantified? [Clarity, Spec §NFR-001]

## Requirement Consistency

- [ ] CHK011 - Does switching from Ollama to API-key providers conflict with NFR-004 ("operable without external cloud dependencies")? [Conflict, Spec §NFR-004]
- [ ] CHK012 - Are authentication requirements consistent between local Ollama (no auth) and API-key providers (key-based auth)? [Consistency]
- [ ] CHK013 - Do the dependencies section and clarifications session align on the embedding provider strategy? [Consistency, Spec §Dependencies vs §Clarifications]
- [ ] CHK014 - Are error handling requirements consistent across provider types (timeout, rate limit, invalid key)? [Consistency]

## Acceptance Criteria Quality

- [ ] CHK015 - Can "embedding provider is correctly configured" be objectively verified without manual inspection? [Measurability, Gap]
- [ ] CHK016 - Are success criteria measurable for API-key provider integration (e.g., "valid key test returns 200")? [Measurability]
- [ ] CHK017 - Is there a measurable acceptance criterion for embedding quality comparison between providers? [Measurability, Gap]
- [ ] CHK018 - Are failure criteria defined for invalid or expired API keys? [Acceptance Criteria, Exception Flow]

## Scenario Coverage

- [ ] CHK019 - Are requirements defined for network-unavailable scenarios when using API-key providers? [Coverage, Exception Flow]
- [ ] CHK020 - Are requirements specified for API key rotation without system restart? [Coverage, Gap]
- [ ] CHK021 - Are migration requirements defined for switching from Ollama to API-key providers (and vice versa)? [Coverage, Gap]
- [ ] CHK022 - Are requirements documented for running in air-gapped environments with API-key providers? [Coverage, Edge Case]

## Edge Case Coverage

- [ ] CHK023 - Are requirements defined for handling API key exhaustion or quota depletion? [Edge Case, Gap]
- [ ] CHK024 - Are requirements specified for embedding model deprecation by the API provider? [Edge Case, Gap]
- [ ] CHK025 - Are confidentiality requirements addressed for sending project documents to external API providers? [Edge Case, Spec §FR-008]
- [ ] CHK026 - Are requirements defined for caching embeddings to reduce API costs? [Edge Case, Gap]

## Non-Functional Requirements

- [ ] CHK027 - Are performance requirements updated to reflect API latency vs local Ollama latency? [NFR, Spec §NFR-001]
- [ ] CHK028 - Are security requirements specified for storing API keys (encryption, rotation, access control)? [NFR, Security]
- [ ] CHK029 - Are reliability requirements defined for API-provider dependency (SLA expectations)? [NFR, Gap]
- [ ] CHK030 - Are operational requirements documented for monitoring API usage and costs? [NFR, Gap]

## Dependencies & Assumptions

- [ ] CHK031 - Is the assumption that "API keys are available and valid" documented and validated? [Assumption]
- [ ] CHK032 - Are external dependencies (LLM provider APIs) documented with their own requirements? [Dependency, Gap]
- [ ] CHK033 - Are fallback dependencies specified if the chosen API provider discontinues service? [Dependency, Gap]

## Ambiguities & Conflicts

- [ ] CHK034 - Is the contradiction between "local-first architecture" (NFR-004) and "use API-key LLMs" resolved in requirements? [Conflict, Spec §NFR-004 vs User Input]
- [ ] CHK035 - Are the implications of sending project memory to external APIs addressed for LGPD compliance? [Ambiguity, Spec §FR-008]
- [ ] CHK036 - Is the cost model (per-token vs flat-rate) clarified for API-based embedding providers? [Ambiguity, Gap]

## Traceability

- [ ] CHK037 - Is a requirement ID scheme established for provider configuration requirements? [Traceability, Gap]
- [ ] CHK038 - Are API provider configuration requirements traceable to specific functional requirements? [Traceability]
