import { IPatientRepository } from '../../domain/repositories/IPatientRepository';
import { PatientDTO } from '../dto/PatientDTO';

export interface ListPatientsDTO {
  clinicId: string;
  statusCode?: string;
  searchTerm?: string;
  page: number;
  limit: number;
}

export interface ListPatientsResult {
  items: PatientDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export class ListPatientsQuery {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(query: ListPatientsDTO): Promise<ListPatientsResult> {
    const { items, total } = await this.patientRepository.findAll({
      clinicId: query.clinicId,
      status: query.statusCode,
      searchTerm: query.searchTerm,
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      items: items.map(PatientDTO.fromEntity),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit)
    };
  }
}
