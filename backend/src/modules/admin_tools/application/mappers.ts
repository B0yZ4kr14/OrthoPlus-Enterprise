import type { Adr, WikiPage } from "@orthoplus/shared-types";

export function mapPrismaAdrToDto(raw: Record<string, unknown>): Adr {
  return {
    id: String(raw.id),
    adrNumber: Number(raw.adr_number),
    title: String(raw.title),
    status: raw.status as Adr["status"],
    context: String(raw.context),
    decision: String(raw.decision),
    consequences: String(raw.consequences),
    alternativesConsidered: raw.alternatives_considered
      ? String(raw.alternatives_considered)
      : undefined,
    createdAt: String(raw.created_at),
    decidedAt: raw.decided_at ? String(raw.decided_at) : undefined,
    createdBy: raw.created_by ? String(raw.created_by) : undefined,
    decidedBy: raw.decided_by ? String(raw.decided_by) : undefined,
  };
}

export function mapPrismaWikiPageToDto(raw: Record<string, unknown>): WikiPage {
  return {
    id: String(raw.id),
    title: String(raw.title),
    slug: String(raw.slug),
    content: String(raw.content),
    category: raw.category as WikiPage["category"],
    isPublished: Boolean(raw.is_published),
    createdAt: String(raw.created_at),
    updatedAt: String(raw.updated_at),
    version: Number(raw.version),
    createdBy: raw.created_by ? String(raw.created_by) : undefined,
    clinicId: raw.clinic_id ? String(raw.clinic_id) : undefined,
  };
}
