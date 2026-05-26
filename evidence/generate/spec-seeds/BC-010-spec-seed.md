# Analytics & Intelligence — Specification Seed
*Seeded from BC-010. Evidence: [domain-model.md](../../discovery/domain-model.md) · [qa-context.json](../../qa/qa-context.json) · [risk-scores.json](../../security/risk-scores.json)*

## 1. Intent
Analytics & Intelligence must support business operations securely and reliably, maintaining compliance with HIPAA, LGPD, and OWASP-ASVS.

## 2. Business Operations the Capability Must Support
(Derived from L2 operations in l2-capabilities.md)

## 3. Entity Ownership & Data Contracts
- OWNS: see domain-model.md
- CREATES: see domain-model.md
- READS: see domain-model.md
- Boundaries & invariants: clinicGuard-enforced multi-tenant isolation

## 4. Security Controls to Preserve or Improve
Controls currently present:
- Validation: Zod schemas

Known gaps to close:
- No field-level access control on analytics queries

Open vulnerabilities:
- V-003: Analytics reads all sensitive data without field-level masking (Probable)

## 5. Test Strategy Requirements
- Minimum coverage: unit 70%, integration 30%, e2e 10%
- All external API calls must have contract tests
- All input handlers must have validation tests

## 6. Non-Functional Constraints
- Latency: < 500ms for UI-facing endpoints
- Observability: Winston structured logging, Prometheus metrics
- Environment parity: dev/staging/prod configs must align

## 7. Out of Scope
- Cross-capability refactoring not explicitly requested
- Database schema changes outside this capability's owned entities

## 8. Open Questions / Flags
- See domain-model.md FLAG items
- See threat model for BC-010
