import { Request, Response } from 'express';
import { logger } from '@/infrastructure/logger';
import { GetPatientQuery, GetPatientDTO } from '../../application/queries/GetPatientQuery';
import { ListPatientsQuery, ListPatientsDTO } from '../../application/queries/ListPatientsQuery';
import { GetPatientStatsQuery, PatientStatsDTO } from '../../application/queries/GetPatientStatsQuery';

export class PatientQueryController {
  constructor(
    private getPatientQuery: GetPatientQuery,
    private listPatientsQuery: ListPatientsQuery,
    private getPatientStatsQuery: GetPatientStatsQuery,
  ) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const dto: GetPatientDTO = {
        id: req.params.id,
        clinicId: req.user!.clinicId,
      };

      const patient = await this.getPatientQuery.execute(dto);
      if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
      }
      res.status(200).json(patient);
    } catch (error: unknown) {
      logger.error('Error getting patient', { error });
      res.status(500).json({ error: 'Failed to get patient' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const dto: ListPatientsDTO = {
        clinicId: req.user!.clinicId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        searchTerm: req.query.search as string,
        statusCode: req.query.status as string,
      };

      const result = await this.listPatientsQuery.execute(dto);
      res.status(200).json(result);
    } catch (error: unknown) {
      logger.error('Error listing patients', { error });
      res.status(500).json({ error: 'Failed to list patients' });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const dto: PatientStatsDTO = {
        clinicId: req.user!.clinicId,
      };

      const stats = await this.getPatientStatsQuery.execute(dto);
      res.status(200).json(stats);
    } catch (error: unknown) {
      logger.error('Error getting patient stats', { error });
      res.status(500).json({ error: 'Failed to get patient stats' });
    }
  }
}
