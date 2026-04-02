import { Request, Response } from 'express';
import { logger } from '@/infrastructure/logger';
import { CreatePatientCommand, CreatePatientDTO } from '../../application/commands/CreatePatientCommand';
import { UpdatePatientCommand, UpdatePatientDTO } from '../../application/commands/UpdatePatientCommand';
import { ChangePatientStatusCommand, ChangePatientStatusDTO } from '../../application/commands/ChangePatientStatusCommand';

export class PatientCommandController {
  constructor(
    private createPatientCommand: CreatePatientCommand,
    private updatePatientCommand: UpdatePatientCommand,
    private changeStatusCommand: ChangePatientStatusCommand,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const data: CreatePatientDTO = {
        ...req.body,
        clinicId: user.clinicId,
        createdBy: user.id,
      };

      const patient = await this.createPatientCommand.execute(data);
      res.status(201).json(patient);
    } catch (error) {
      logger.error('Error creating patient', { error });
      res.status(500).json({ error: 'Failed to create patient' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const data: UpdatePatientDTO = {
        ...req.body,
        id: req.params.id,
        clinicId: user.clinicId,
        updatedBy: user.id,
      };

      const patient = await this.updatePatientCommand.execute(data);
      res.status(200).json(patient);
    } catch (error) {
      logger.error('Error updating patient', { error });
      res.status(500).json({ error: 'Failed to update patient' });
    }
  }

  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const data: ChangePatientStatusDTO = {
        patientId: req.params.id,
        statusCode: req.body.statusCode,
        reason: req.body.reason,
        clinicId: user.clinicId,
        changedBy: user.id,
      };

      const patient = await this.changeStatusCommand.execute(data);
      res.status(200).json(patient);
    } catch (error) {
      logger.error('Error changing patient status', { error });
      res.status(500).json({ error: 'Failed to change patient status' });
    }
  }
}
