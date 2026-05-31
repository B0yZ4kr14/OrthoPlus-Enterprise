/**
 * Port (interface) for document repository operations.
 * Domain layer depends on this abstraction, not on infrastructure.
 */
export interface IDocumentRepository {
  count(clinicId?: string): number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listAll(clinicId?: string): any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findByPath(path: string, clinicId?: string): any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isConfidential(doc: any): boolean;
  archive(id: string): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsert(doc: any): any;
  findVersions(
    sourcePath: string,
    clinicId?: string,
  ): Array<{
    version: number;
    contentHash: string;
    title: string;
    wordCount: number;
    createdAt: number;
  }>;
}
