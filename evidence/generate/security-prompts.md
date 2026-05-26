# Security-Aware Prompts

## [BC-010] Analytics reads all sensitive data without field-level masking (V-003)
*Vulnerability Review* · Evidence: [catalog.json#V-003](../security/vulnerabilities/catalog.json)

Analyze Analytics reads all sensitive data without field-level masking in BC-010. Files: backend/src/modules/analytics. Current controls: ['Validation']. Fix: Implement field-level masking in analytics queries based on user role

## [BC-007] Government API errors may leak sensitive data in logs (V-005)
*Vulnerability Review* · Evidence: [catalog.json#V-005](../security/vulnerabilities/catalog.json)

Analyze Government API errors may leak sensitive data in logs in BC-007. Files: backend/src/modules/nfe. Current controls: []. Fix: Mask CNPJ/CPF in logs; use structured logging with PII redaction

## [BC-010] Validation gap at BC-010-01
*Input Validation Hardening* · Evidence: [control-map.json#BC-010](../security/vulnerabilities/catalog.json)

Review input validation in BC-010 for GET /api/analytics/dashboard-overview. Gap: No field-level access control on aggregated queries. Add Zod schema validation.

## [BC-001] Contract test gap
*Contract Test Drafting* · Evidence: [qa-gaps.json](../security/vulnerabilities/catalog.json)

Draft contract tests for BC-001 external dependencies. Gap: no contract tests for FHIR compatibility

## [BC-002] Contract test gap
*Contract Test Drafting* · Evidence: [qa-gaps.json](../security/vulnerabilities/catalog.json)

Draft contract tests for BC-002 external dependencies. Gap: no contract tests for payment gateway integration

## [BC-005] Contract test gap
*Contract Test Drafting* · Evidence: [qa-gaps.json](../security/vulnerabilities/catalog.json)

Draft contract tests for BC-005 external dependencies. Gap: no contract tests for email/SMS provider

## [BC-008] Contract test gap
*Contract Test Drafting* · Evidence: [qa-gaps.json](../security/vulnerabilities/catalog.json)

Draft contract tests for BC-008 external dependencies. Gap: no contract tests for AI model API

