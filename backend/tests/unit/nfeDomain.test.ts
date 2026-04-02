import { NFe } from '../../src/modules/nfe/domain/entities/NFe';

const makeNFe = (overrides: Partial<Parameters<typeof NFe.create>[0]> = {}): NFe => {
  const now = new Date('2025-01-01T10:00:00Z');
  return NFe.create({
    id: 'nfe-001',
    clinicId: 'clinic-1',
    numero: '000001',
    serie: '001',
    tipo: 'NFE',
    status: 'RASCUNHO',
    chaveAcesso: null,
    xml: null,
    pdfUrl: null,
    clienteId: 'client-abc',
    clienteNome: 'João Silva',
    valorTotal: 250.0,
    dataEmissao: new Date('2025-01-01'),
    protocolo: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};

describe('NFe Domain Entity', () => {
  describe('create', () => {
    it('creates an NFe with the provided values', () => {
      const nfe = makeNFe();
      expect(nfe.id).toBe('nfe-001');
      expect(nfe.clinicId).toBe('clinic-1');
      expect(nfe.numero).toBe('000001');
      expect(nfe.serie).toBe('001');
      expect(nfe.tipo).toBe('NFE');
      expect(nfe.status).toBe('RASCUNHO');
      expect(nfe.clienteNome).toBe('João Silva');
      expect(nfe.valorTotal).toBe(250.0);
      expect(nfe.chaveAcesso).toBeNull();
      expect(nfe.xml).toBeNull();
      expect(nfe.pdfUrl).toBeNull();
      expect(nfe.protocolo).toBeNull();
    });

    it('preserves readonly fields', () => {
      const now = new Date('2025-03-01T00:00:00Z');
      const nfe = makeNFe({ id: 'fixed-id', clinicId: 'clinic-x', createdAt: now });
      expect(nfe.id).toBe('fixed-id');
      expect(nfe.clinicId).toBe('clinic-x');
      expect(nfe.createdAt).toBe(now);
    });
  });

  describe('cancelar', () => {
    it('sets status to CANCELADA when NFe is AUTORIZADA', () => {
      const nfe = makeNFe({ status: 'AUTORIZADA' });
      const before = nfe.updatedAt;
      nfe.cancelar();
      expect(nfe.status).toBe('CANCELADA');
      expect(nfe.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('throws when trying to cancel a RASCUNHO NFe', () => {
      const nfe = makeNFe({ status: 'RASCUNHO' });
      expect(() => nfe.cancelar()).toThrow('Apenas NFe autorizada pode ser cancelada');
    });

    it('throws when trying to cancel an already CANCELADA NFe', () => {
      const nfe = makeNFe({ status: 'CANCELADA' });
      expect(() => nfe.cancelar()).toThrow('Apenas NFe autorizada pode ser cancelada');
    });

    it('throws when trying to cancel a REJEITADA NFe', () => {
      const nfe = makeNFe({ status: 'REJEITADA' });
      expect(() => nfe.cancelar()).toThrow('Apenas NFe autorizada pode ser cancelada');
    });

    it('throws when trying to cancel a INUTILIZADA NFe', () => {
      const nfe = makeNFe({ status: 'INUTILIZADA' });
      expect(() => nfe.cancelar()).toThrow('Apenas NFe autorizada pode ser cancelada');
    });

    it('updates updatedAt on successful cancellation', () => {
      const past = new Date('2020-01-01T00:00:00Z');
      const nfe = makeNFe({ status: 'AUTORIZADA', updatedAt: past });
      nfe.cancelar();
      expect(nfe.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });
  });

  describe('mutable fields', () => {
    it('allows updating status, chaveAcesso, xml, pdfUrl, protocolo, updatedAt', () => {
      const nfe = makeNFe();
      nfe.status = 'AUTORIZADA';
      nfe.chaveAcesso = 'CHAVE-123';
      nfe.xml = '<xml>...</xml>';
      nfe.pdfUrl = 'https://example.com/nfe.pdf';
      nfe.protocolo = 'PROTO-456';
      nfe.updatedAt = new Date();

      expect(nfe.status).toBe('AUTORIZADA');
      expect(nfe.chaveAcesso).toBe('CHAVE-123');
      expect(nfe.xml).toBe('<xml>...</xml>');
      expect(nfe.pdfUrl).toBe('https://example.com/nfe.pdf');
      expect(nfe.protocolo).toBe('PROTO-456');
    });
  });
});
