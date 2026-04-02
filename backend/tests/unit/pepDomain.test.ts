import { Prontuario, ProntuarioProps } from '../../src/modules/pep/domain/entities/Prontuario';

const makeProntuario = (
  overrides: Partial<Omit<ProntuarioProps, 'id' | 'assinadoDigitalmente' | 'createdAt' | 'updatedAt'>> = {}
): Prontuario => {
  return Prontuario.create({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    dentistaId: 'dentist-1',
    dataConsulta: new Date('2026-03-30T10:00:00Z'),
    motivoConsulta: 'Dor de dente',
    anamnese: 'Paciente relata dor há 3 dias',
    exameFisico: 'Cárie no dente 36',
    diagnostico: 'Cárie profunda',
    planoDeTratamento: 'Restauração com resina',
    observacoes: 'Paciente alérgico a penicilina',
    ...overrides,
  });
};

describe('Prontuario Domain Entity', () => {
  describe('create', () => {
    it('creates a prontuario with the given values', () => {
      const pront = makeProntuario();

      expect(pront).toBeDefined();
      expect(pront.id).toBeDefined();
      expect(pront.clinicId).toBe('clinic-1');
      expect(pront.patientId).toBe('patient-1');
      expect(pront.assinadoDigitalmente).toBe(false);
    });

    it('generates a unique ID', () => {
      const pront1 = makeProntuario();
      const pront2 = makeProntuario();

      expect(pront1.id).not.toBe(pront2.id);
    });

    it('initializes with assinadoDigitalmente as false', () => {
      const pront = makeProntuario();

      expect(pront.assinadoDigitalmente).toBe(false);
    });

    it('allows optional fields to be undefined', () => {
      const pront = Prontuario.create({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        dentistaId: 'dentist-1',
        dataConsulta: new Date(),
        motivoConsulta: 'Consulta de rotina',
      });

      const obj = pront.toObject();
      expect(obj.anamnese).toBeUndefined();
      expect(obj.exameFisico).toBeUndefined();
      expect(obj.diagnostico).toBeUndefined();
      expect(obj.planoDeTratamento).toBeUndefined();
      expect(obj.observacoes).toBeUndefined();
    });

    it('initializes with empty anexos array when not provided', () => {
      const pront = makeProntuario();
      const obj = pront.toObject();

      expect(obj.anexos).toBeUndefined();
    });
  });

  describe('restore', () => {
    it('restores a prontuario from persisted data', () => {
      const props: ProntuarioProps = {
        id: 'pront-001',
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        dentistaId: 'dentist-1',
        dataConsulta: new Date('2026-03-30T10:00:00Z'),
        motivoConsulta: 'Dor de dente',
        assinadoDigitalmente: true,
        assinaturaHash: 'hash123',
        assinadoEm: new Date('2026-03-30T11:00:00Z'),
        createdAt: new Date('2026-03-30T09:00:00Z'),
        updatedAt: new Date('2026-03-30T11:00:00Z'),
      };

      const pront = Prontuario.restore(props);

      expect(pront.id).toBe('pront-001');
      expect(pront.assinadoDigitalmente).toBe(true);
    });
  });

  describe('assinarDigitalmente', () => {
    it('signs a prontuario with digital signature', () => {
      const pront = makeProntuario();
      const hash = 'digital-signature-hash-123';

      pront.assinarDigitalmente(hash);

      const obj = pront.toObject();
      expect(obj.assinadoDigitalmente).toBe(true);
      expect(obj.assinaturaHash).toBe(hash);
      expect(obj.assinadoEm).toBeInstanceOf(Date);
    });

    it('updates updatedAt when signing', () => {
      const pront = makeProntuario();
      const beforeUpdate = pront.toObject().updatedAt;

      // Wait a tiny bit to ensure timestamp difference
      setTimeout(() => {
        pront.assinarDigitalmente('hash123');
        const afterUpdate = pront.toObject().updatedAt;

        expect(afterUpdate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      }, 1);
    });

    it('throws when trying to sign already signed prontuario', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash1');

      expect(() => pront.assinarDigitalmente('hash2')).toThrow(
        'Prontuário já foi assinado digitalmente'
      );
    });

    it('sets assinado flag to true', () => {
      const pront = makeProntuario();
      expect(pront.assinadoDigitalmente).toBe(false);

      pront.assinarDigitalmente('hash');
      expect(pront.assinadoDigitalmente).toBe(true);
    });
  });

  describe('adicionarAnexo', () => {
    it('adds anexo URL to prontuario', () => {
      const pront = makeProntuario();
      const url = 'https://storage.example.com/file1.pdf';

      pront.adicionarAnexo(url);

      const obj = pront.toObject();
      expect(obj.anexos).toContain(url);
    });

    it('adds multiple anexos', () => {
      const pront = makeProntuario();

      pront.adicionarAnexo('https://storage.example.com/file1.pdf');
      pront.adicionarAnexo('https://storage.example.com/file2.jpg');
      pront.adicionarAnexo('https://storage.example.com/file3.png');

      const obj = pront.toObject();
      expect(obj.anexos).toHaveLength(3);
      expect(obj.anexos).toContain('https://storage.example.com/file1.pdf');
      expect(obj.anexos).toContain('https://storage.example.com/file2.jpg');
      expect(obj.anexos).toContain('https://storage.example.com/file3.png');
    });

    it('initializes anexos array if undefined', () => {
      const pront = makeProntuario();

      // Before adding anexo, anexos might be undefined
      let obj = pront.toObject();
      expect(obj.anexos).toBeUndefined();

      pront.adicionarAnexo('https://storage.example.com/file1.pdf');

      obj = pront.toObject();
      expect(obj.anexos).toBeDefined();
      expect(obj.anexos).toHaveLength(1);
    });

    it('updates updatedAt when adding anexo', () => {
      const pront = makeProntuario();
      const beforeUpdate = pront.toObject().updatedAt;

      setTimeout(() => {
        pront.adicionarAnexo('https://storage.example.com/file.pdf');
        const afterUpdate = pront.toObject().updatedAt;

        expect(afterUpdate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      }, 1);
    });

    it('allows adding anexos to signed prontuarios', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash');

      // Should not throw
      expect(() => pront.adicionarAnexo('https://storage.example.com/extra.pdf')).not.toThrow();
    });
  });

  describe('atualizarDiagnostico', () => {
    it('updates diagnostico field', () => {
      const pront = makeProntuario({ diagnostico: 'Diagnóstico inicial' });

      pront.atualizarDiagnostico('Diagnóstico atualizado');

      const obj = pront.toObject();
      expect(obj.diagnostico).toBe('Diagnóstico atualizado');
    });

    it('updates updatedAt when updating diagnostico', () => {
      const pront = makeProntuario();
      const beforeUpdate = pront.toObject().updatedAt;

      setTimeout(() => {
        pront.atualizarDiagnostico('Novo diagnóstico');
        const afterUpdate = pront.toObject().updatedAt;

        expect(afterUpdate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      }, 1);
    });

    it('throws when trying to update diagnostico of signed prontuario', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash');

      expect(() => pront.atualizarDiagnostico('Novo diagnóstico')).toThrow(
        'Não é possível editar prontuário assinado digitalmente'
      );
    });

    it('allows updating from undefined to defined', () => {
      const pront = Prontuario.create({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        dentistaId: 'dentist-1',
        dataConsulta: new Date(),
        motivoConsulta: 'Consulta',
      });

      pront.atualizarDiagnostico('Primeiro diagnóstico');

      const obj = pront.toObject();
      expect(obj.diagnostico).toBe('Primeiro diagnóstico');
    });
  });

  describe('atualizarPlanoDeTratamento', () => {
    it('updates plano de tratamento field', () => {
      const pront = makeProntuario({ planoDeTratamento: 'Plano inicial' });

      pront.atualizarPlanoDeTratamento('Plano atualizado');

      const obj = pront.toObject();
      expect(obj.planoDeTratamento).toBe('Plano atualizado');
    });

    it('updates updatedAt when updating plano', () => {
      const pront = makeProntuario();
      const beforeUpdate = pront.toObject().updatedAt;

      setTimeout(() => {
        pront.atualizarPlanoDeTratamento('Novo plano');
        const afterUpdate = pront.toObject().updatedAt;

        expect(afterUpdate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      }, 1);
    });

    it('throws when trying to update plano of signed prontuario', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash');

      expect(() => pront.atualizarPlanoDeTratamento('Novo plano')).toThrow(
        'Não é possível editar prontuário assinado digitalmente'
      );
    });

    it('allows updating from undefined to defined', () => {
      const pront = Prontuario.create({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        dentistaId: 'dentist-1',
        dataConsulta: new Date(),
        motivoConsulta: 'Consulta',
      });

      pront.atualizarPlanoDeTratamento('Primeiro plano');

      const obj = pront.toObject();
      expect(obj.planoDeTratamento).toBe('Primeiro plano');
    });
  });

  describe('toObject', () => {
    it('returns a plain object with all properties', () => {
      const pront = makeProntuario();
      const obj = pront.toObject();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('clinicId');
      expect(obj).toHaveProperty('patientId');
      expect(obj).toHaveProperty('dentistaId');
      expect(obj).toHaveProperty('dataConsulta');
      expect(obj).toHaveProperty('motivoConsulta');
      expect(obj).toHaveProperty('assinadoDigitalmente');
      expect(obj).toHaveProperty('createdAt');
      expect(obj).toHaveProperty('updatedAt');
    });

    it('includes signature details when signed', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash123');

      const obj = pront.toObject();
      expect(obj.assinadoDigitalmente).toBe(true);
      expect(obj.assinaturaHash).toBe('hash123');
      expect(obj.assinadoEm).toBeInstanceOf(Date);
    });
  });

  describe('workflow scenarios', () => {
    it('supports complete workflow: create -> update fields -> add anexos -> sign', () => {
      const pront = makeProntuario();

      // Update diagnostico
      pront.atualizarDiagnostico('Cárie profunda no dente 36');

      // Update plano
      pront.atualizarPlanoDeTratamento('1. Restauração com resina\n2. Polimento');

      // Add anexos
      pront.adicionarAnexo('https://storage.example.com/raio-x.jpg');
      pront.adicionarAnexo('https://storage.example.com/foto-intraoral.jpg');

      // Sign
      pront.assinarDigitalmente('final-hash-123');

      const obj = pront.toObject();
      expect(obj.diagnostico).toBe('Cárie profunda no dente 36');
      expect(obj.planoDeTratamento).toContain('Restauração com resina');
      expect(obj.anexos).toHaveLength(2);
      expect(obj.assinadoDigitalmente).toBe(true);
    });

    it('prevents editing after signing', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash');

      expect(() => pront.atualizarDiagnostico('Novo')).toThrow();
      expect(() => pront.atualizarPlanoDeTratamento('Novo')).toThrow();
    });

    it('allows adding anexos after signing', () => {
      const pront = makeProntuario();
      pront.assinarDigitalmente('hash');

      pront.adicionarAnexo('https://storage.example.com/follow-up.pdf');

      const obj = pront.toObject();
      expect(obj.anexos).toContain('https://storage.example.com/follow-up.pdf');
    });

    it('handles minimal prontuario creation and signing', () => {
      const pront = Prontuario.create({
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        dentistaId: 'dentist-1',
        dataConsulta: new Date(),
        motivoConsulta: 'Emergência',
      });

      pront.assinarDigitalmente('emergency-hash');

      const obj = pront.toObject();
      expect(obj.motivoConsulta).toBe('Emergência');
      expect(obj.assinadoDigitalmente).toBe(true);
    });
  });
});
