import { TISSSoapClient } from "../../src/modules/tiss/infrastructure/TISSSoapClient";

describe("TISSSoapClient", () => {
  describe("buildLoteXml", () => {
    it("builds valid TISS XML envelope", () => {
      const client = new TISSSoapClient();
      const xml = client.buildLoteXml({
        batchNumber: "LOTE-001",
        insuranceCompany: "Test Insurance",
        operatorCode: "12345",
        guides: [
          {
            guideNumber: "GUIA-001",
            patientName: "John Doe",
            patientCpf: "12345678900",
            procedureCode: "123456",
            procedureName: "Consulta",
            serviceDate: "2026-05-30",
            amount: 10000,
            dentistCro: "12345",
            dentistName: "Dr. Smith",
          },
        ],
        totalAmount: 10000,
      });

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<soapenv:Envelope");
      expect(xml).toContain("<tiss:enviarLoteGuias>");
      expect(xml).toContain("<numeroLote>LOTE-001</numeroLote>");
      expect(xml).toContain(
        "<numeroGuiaPrestador>GUIA-001</numeroGuiaPrestador>",
      );
      expect(xml).toContain("<nomeBeneficiario>John Doe</nomeBeneficiario>");
      expect(xml).toContain("<codigoProcedimento>123456</codigoProcedimento>");
      expect(xml).toContain("<valorProcedimento>100.00</valorProcedimento>");
      expect(xml).toContain("<registroANS>12345</registroANS>");
      expect(xml).toContain("<versaoPadrao>3.00.00</versaoPadrao>");
    });

    it("escapes XML special characters", () => {
      const client = new TISSSoapClient();
      const xml = client.buildLoteXml({
        batchNumber: "LOTE<>&\"'",
        insuranceCompany: "Test",
        guides: [
          {
            guideNumber: "GUIA-001",
            patientName: "John & Jane <Doe>",
            patientCpf: "12345678900",
            procedureCode: "123456",
            procedureName: "Consulta",
            serviceDate: "2026-05-30",
            amount: 10000,
          },
        ],
        totalAmount: 10000,
      });

      expect(xml).toContain("LOTE&lt;&gt;&amp;&quot;&apos;");
      expect(xml).toContain("John &amp; Jane &lt;Doe&gt;");
    });

    it("handles empty guide list", () => {
      const client = new TISSSoapClient();
      const xml = client.buildLoteXml({
        batchNumber: "LOTE-002",
        insuranceCompany: "Test Insurance",
        guides: [],
        totalAmount: 0,
      });

      expect(xml).toContain("<numeroLote>LOTE-002</numeroLote>");
      expect(xml).toContain("<guiasTISS>");
    });

    it("formats amounts correctly", () => {
      const client = new TISSSoapClient();
      const xml = client.buildLoteXml({
        batchNumber: "LOTE-003",
        insuranceCompany: "Test",
        guides: [
          {
            guideNumber: "GUIA-001",
            patientName: "Patient",
            patientCpf: "12345678900",
            procedureCode: "123456",
            procedureName: "Procedimento",
            serviceDate: "2026-05-30",
            amount: 12345,
          },
        ],
        totalAmount: 12345,
      });

      expect(xml).toContain("<valorProcedimento>123.45</valorProcedimento>");
      expect(xml).toContain("<valorTotal>123.45</valorTotal>");
    });
  });

  describe("submitBatch", () => {
    it("returns error when endpoint is not configured", async () => {
      const client = new TISSSoapClient();
      const result = await client.submitBatch({
        batchNumber: "LOTE-001",
        insuranceCompany: "Test",
        guides: [],
        totalAmount: 0,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe("ERROR");
      expect(result.message).toContain("endpoint not configured");
    });

    it("returns mock success when endpoint is configured", async () => {
      const client = new TISSSoapClient("https://operator.example.com/tiss");
      const result = await client.submitBatch({
        batchNumber: "LOTE-001",
        insuranceCompany: "Test",
        guides: [
          {
            guideNumber: "GUIA-001",
            patientName: "Patient",
            patientCpf: "12345678900",
            procedureCode: "123456",
            procedureName: "Consulta",
            serviceDate: "2026-05-30",
            amount: 10000,
          },
        ],
        totalAmount: 10000,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("ACCEPTED");
      expect(result.protocolNumber).toBeDefined();
      expect(result.protocolNumber).toMatch(/^PROT-/);
      expect(result.message).toContain("accepted");
    });
  });
});
