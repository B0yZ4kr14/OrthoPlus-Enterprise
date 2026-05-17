# Clarification Questions — PEP (003)

**Analysis Date**: 2026-05-17 | **Method**: Socratic + Popperian

---

## Question 1: Odontograma 3D — MVP or Experimental?

**Context**: Spec states "Odontograma interativo (2D e 3D)" in Scope, but Notes say "Suporta 2D e visualização 3D experimental (Three.js)".

**What we need to know**: Is 3D odontograma a Must Have for MVP, or can it be deferred to P3+? Three.js adds ~200KB bundle size and significant complexity.

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | 3D is MVP — patients expect it | Increases timeline by ~2 sprints, requires Three.js expertise |
| B | 3D is P3 experimental (defer) | MVP ships with Fabric.js 2D only, faster delivery |
| C | 3D is out of scope entirely | Simplifies spec, focus on robust 2D odontograma |

**Your choice**: _[Wait for user response]_

---

## Question 2: ICP Digital Signature — Which Certificate Types?

**Context**: FR-006 requires "Certificado A1 ou A3" with ICP-Brasil chain validation.

**What we need to know**: A1 (file) and A3 (smart card/HSM) have different integration paths. A3 requires native middleware (pcsc-lite) which is complex in web apps.

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | A1 only (PKCS#12 file upload) | Simpler web integration, sufficient for most clinics |
| B | A1 + A3 via desktop agent | Requires Electron/native wrapper, adds complexity |
| C | Cloud signature (ICP Cloud) | Modern approach, no local certificate needed, but vendor lock-in |

**Your choice**: _[Wait for user response]_

---

## Question 3: DICOM Support — Full Parser or Thumbnail Only?

**Context**: FR-005 says "Upload de imagens (JPG, PNG, DICOM), PDFs" but DICOM files are typically 10-50MB and require specialized viewers.

**What we need to know**: Does the system need a full DICOM viewer (cornerstone.js) or just thumbnail generation + external viewer link?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | Full DICOM viewer inline | Requires cornerstone.js or similar, ~500KB bundle |
| B | Thumbnail + download only | Simpler, user opens in external DICOM viewer |
| C | Convert DICOM to JPG on upload | One-time processing, simpler viewing, but loses DICOM metadata |

**Your choice**: _[Wait for user response]_
