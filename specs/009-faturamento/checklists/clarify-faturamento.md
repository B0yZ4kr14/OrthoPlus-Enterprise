# Clarification Questions — Faturamento (009)

**Analysis Date**: 2026-05-17 | **Method**: Socratic + Popperian

---

## Question 1: NFSe vs NF-e de Produtos — Both Needed?

**Context**: Spec focuses on NFSe (nota fiscal de serviços, LC 116) which is correct for dental procedures. However, clinics also sell products (toothpaste, brushes) which require NF-e (nota fiscal de produtos).

**What we need to know**: Should the module handle both NFSe (services) and NF-e (products), or only NFSe?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | NFSe only (services) | Simpler, covers core dental services, products billed as service |
| B | NFSe + NF-e (products) | Full compliance, but requires two different SEFAZ integrations |
| C | NFSe now, NF-e later (P3) | Phased approach, MVP focuses on services |

**Your choice**: _[Wait for user response]_

---

## Question 2: Municipal vs State SEFAZ — Which One?

**Context**: NFSe is issued at municipal level (prefeitura), while NF-e is at state level. Each municipality uses a different SEFAZ provider (GINFES, Betha, Tinus, etc.).

**What we need to know**: Should the system integrate with a specific SEFAZ provider, or use a gateway (like Webmania or TecnoSpeed) that abstracts multiple providers?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | Direct SEFAZ integration | No intermediary fees, but requires integration per municipality |
| B | Gateway (Webmania/TecnoSpeed) | Single API for all municipalities, but monthly fees apply |
| C | Both (direct for major cities, gateway for others) | Most robust, but complex to maintain |

**Your choice**: _[Wait for user response]_
