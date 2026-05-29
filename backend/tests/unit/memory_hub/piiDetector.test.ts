import {
  PIIDetector,
  piiDetector,
} from "../../../src/modules/memory_hub/infrastructure/PIIDetector";

describe("PIIDetector", () => {
  describe("scan", () => {
    it("should detect CPF in content", () => {
      const content = "Patient CPF: 123.456.789-09";
      const result = piiDetector.scan(content);
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContainEqual(
        expect.stringContaining("CPF"),
      );
      expect(result.confidence).toBe("medium");
    });

    it("should detect email addresses", () => {
      const content = "Contact: patient@email.com for follow-up";
      const result = piiDetector.scan(content);
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContainEqual(
        expect.stringContaining("EMAIL"),
      );
    });

    it("should detect Brazilian phone numbers", () => {
      const content = "Phone: (11) 98765-4321";
      const result = piiDetector.scan(content);
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContainEqual(
        expect.stringContaining("PHONE_BR"),
      );
    });

    it("should detect credit card numbers", () => {
      const content = "Card: 4111 1111 1111 1111";
      const result = piiDetector.scan(content);
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContainEqual(
        expect.stringContaining("CREDIT_CARD"),
      );
      expect(result.confidence).toBe("high");
    });

    it("should accumulate multiple PII types for higher confidence", () => {
      const content = `
        CPF: 123.456.789-09
        Email: test@example.com
        Phone: (11) 98765-4321
      `;
      const result = piiDetector.scan(content);
      expect(result.hasPII).toBe(true);
      expect(result.confidence).toBe("high");
      expect(result.matchCount).toBeGreaterThanOrEqual(3);
    });

    it("should return no PII for clean technical content", () => {
      const content = `
        ## Architecture Decision
        We will use Redis for session caching.
        The rate limit is 100 requests per minute.
      `;
      const result = piiDetector.scan(content);
      expect(result.hasPII).toBe(false);
      expect(result.detectedTypes).toHaveLength(0);
      expect(result.confidence).toBe("low");
    });

    it("should respect custom block threshold", () => {
      const strictDetector = new PIIDetector({ blockThreshold: 1 });
      const content = "Email: test@example.com";
      const result = strictDetector.scan(content);
      expect(result.hasPII).toBe(true);
    });

    it("should not flag content below threshold", () => {
      const lenientDetector = new PIIDetector({ blockThreshold: 10 });
      const content = "Email: test@example.com";
      const result = lenientDetector.scan(content);
      expect(result.hasPII).toBe(false);
    });
  });

  describe("hasLawfulBasis", () => {
    it("should return true for lawful_basis frontmatter", () => {
      expect(
        piiDetector.hasLawfulBasis({ lawful_basis: "legitimate_interest" }),
      ).toBe(true);
    });

    it("should return true for lawfulBasis frontmatter", () => {
      expect(piiDetector.hasLawfulBasis({ lawfulBasis: "consent" })).toBe(true);
    });

    it("should return true for legal_basis frontmatter", () => {
      expect(piiDetector.hasLawfulBasis({ legal_basis: "contract" })).toBe(
        true,
      );
    });

    it("should return false for empty lawful basis", () => {
      expect(piiDetector.hasLawfulBasis({ lawful_basis: "" })).toBe(false);
    });

    it("should return false when no lawful basis key exists", () => {
      expect(piiDetector.hasLawfulBasis({ title: "Test" })).toBe(false);
    });
  });

  describe("shouldBlockIndexing", () => {
    it("should block when PII detected and no lawful basis", () => {
      const content = "CPF: 123.456.789-09";
      const result = piiDetector.shouldBlockIndexing(content);
      expect(result.blocked).toBe(true);
      expect(result.reason).toContain("PII detected");
    });

    it("should allow when lawful basis is declared despite PII", () => {
      const content = "CPF: 123.456.789-09";
      const frontmatter = { lawful_basis: "legitimate_interest" };
      const result = piiDetector.shouldBlockIndexing(content, frontmatter);
      expect(result.blocked).toBe(false);
      expect(result.reason).toBeNull();
    });

    it("should allow clean content without lawful basis", () => {
      const content = "## Technical Spec\nUse PostgreSQL 16.";
      const result = piiDetector.shouldBlockIndexing(content);
      expect(result.blocked).toBe(false);
      expect(result.reason).toBeNull();
    });
  });
});
