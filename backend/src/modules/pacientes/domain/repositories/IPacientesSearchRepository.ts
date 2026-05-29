export interface SearchPatientsParams {
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  skip: number;
  take: number;
  select: {
    id: boolean;
    full_name: boolean;
    cpf: boolean;
    phone_primary: boolean;
    email: boolean;
    status: boolean;
    birth_date: boolean;
    photo_url: boolean;
    last_appointment_date: boolean;
  };
}

/**
 * IPacientesSearchRepository — interface for patient search operations.
 * Decouples PacienteSearchService from Prisma / infrastructure details.
 */
export interface IPacientesSearchRepository {
  searchPatients(
    params: SearchPatientsParams,
  ): Promise<Record<string, unknown>[]>;
  countPatients(where: Record<string, unknown>): Promise<number>;
}
