# Clarification Questions — TISS (012)

**Analysis Date**: 2026-05-17 | **Method**: Socratic + Popperian

---

## Question 1: SOAP vs REST — Which Protocol for TISS?

**Context**: Spec specifies "Envio via webservice SOAP" conforme TISS 3.0.0+. However, ANS has been moving toward REST APIs in newer specifications.

**What we need to know**: Should we implement SOAP (legacy, complex) or REST (modern, simpler) or both with fallback?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | SOAP only (TISS 3.0.0 compliant) | Guaranteed compatibility with all operators, but complex XML handling |
| B | REST only (if operator supports) | Simpler implementation, but may not work with older operators |
| C | REST primary + SOAP fallback | Best of both, but doubles integration effort |

**Your choice**: _[Wait for user response]_

---

## Question 2: Operator-Specific Adapters — How Many?

**Context**: Each health operator (Amil, Bradesco, SulAmérica, etc.) has slight variations in their TISS webservice implementation.

**What we need to know**: Should the system support a generic TISS adapter, or build operator-specific adapters?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | Generic TISS only | Faster MVP, but may fail with operator quirks |
| B | Top 5 operators with specific adapters | More robust, but requires research per operator |
| C | Generic + pluggable adapter system | Future-proof, but adds architectural complexity |

**Your choice**: _[Wait for user response]_
