# Drift Report — Frontend Scan

**Generated**: 2026-05-19  
**Scope**: Specs vs Implementation  

---

## Summary

| Spec | Status | Drift |
|------|--------|-------|
| specs/001-pacientes | Partial | Tests missing, some TS errors |
| specs/002-agenda | Partial | Tests missing |
| specs/003-pep | Partial | Tests minimal |

---

## Unspecced Code

| Feature | Location | Lines |
|---------|----------|-------|
| Crypto module | `modules/crypto/`, `components/crypto/` | ~5000+ |
| PDV module | `modules/pdv/`, `components/pdv/` | ~3000+ |
| BI module | `modules/bi/` | ~2000+ |

**Note**: These modules have no corresponding specs. Consider creating specs or documenting.

---

## Inter-Spec Conflicts

None detected.
