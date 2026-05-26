# Deep Candidate Analysis

## C-01: Clinical
- **Cohesion**: HIGH — patient care, scheduling, procedures, health records
- **Coupling**: MEDIUM — depends on Financial (billing), Administrative (users)
- **Boundary**: CLEAR — own entities: Patient, Appointment, Procedure, Treatment
- **Action**: CONFIRM

## C-02: Financial
- **Cohesion**: HIGH — billing, payments, contracts, invoicing
- **Coupling**: MEDIUM — depends on Clinical (patient link), Inventory (products)
- **Boundary**: CLEAR — own entities: Transaction, Invoice, Contract, PaymentSplit
- **Action**: CONFIRM

## C-03: Inventory
- **Cohesion**: HIGH — products, stock, suppliers, categories
- **Coupling**: LOW — used by Financial (PDV) and Clinical (materials)
- **Boundary**: CLEAR — own entities: Product, StockMovement, Supplier, Category
- **Action**: CONFIRM

## C-04: Administrative
- **Cohesion**: MEDIUM — users, clinics, roles, settings, backups
- **Coupling**: HIGH — used by almost all other capabilities
- **Boundary**: PARTIAL — cross-cutting concerns mixed with domain logic
- **Action**: CONFIRM (with note: auth/roles are infrastructure-adjacent but domain-necessary)

## C-05: Marketing
- **Cohesion**: HIGH — campaigns, recalls, loyalty, leads, CRM
- **Coupling**: LOW — reads from Clinical (patients) and Financial (conversions)
- **Boundary**: CLEAR — own entities: Campaign, Recall, Lead, LoyaltyPoint
- **Action**: CONFIRM

## C-06: CryptoPayments
- **Cohesion**: HIGH — Bitcoin wallets, xPub, PSBT, QR codes
- **Coupling**: LOW — integrated into Financial as alternative payment method
- **Boundary**: CLEAR — own entities: Wallet, TransactionPSBT, ExchangeConfig
- **Action**: CONFIRM

## C-07: Fiscal
- **Cohesion**: HIGH — NFe, TISS, tax documents
- **Coupling**: LOW — triggered by Financial (invoice generation)
- **Boundary**: CLEAR — own entities: NFeDocument, TISSDocument
- **Action**: CONFIRM

## C-08: Files
- **Cohesion**: MEDIUM — uploads, S3/MinIO, documents, images (radiographs)
- **Coupling**: MEDIUM — used by Clinical (radiographs), Fiscal (attachments)
- **Boundary**: PARTIAL — file storage is infrastructure but medical images are domain
- **Action**: CONFIRM (with note: storage infra is de-scoped, medical imaging is domain)

## C-09: Telemedicine
- **Cohesion**: HIGH — video calls, teleodontology sessions
- **Coupling**: LOW — linked to Clinical (appointments)
- **Boundary**: CLEAR — own entities: TeleSession, VideoRoom
- **Action**: CONFIRM

## C-10: Other
- **Cohesion**: LOW — aggregates analytics, BI, dashboards, reports, AI agents, notifications
- **Coupling**: HIGH — cross-cutting support capabilities
- **Boundary**: UNCLEAR — mix of infrastructure and domain
- **Action**: SPLIT into:
  - **Analytics & BI** (CONFIRM)
  - **AI / Agent Service** (CONFIRM)
  - **Notifications** (DE-SCOPE → infrastructure)
  - **Reports** (CONFIRM)
  - **Backups / Terminal / GitHub Tools** (DE-SCOPE → infrastructure)
