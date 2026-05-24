import { defineConfig } from "@bradygaster/squad-sdk"

export default defineConfig({
  project: "OrthoPlus Enterprise",
  version: "1.0.0",
  language: "pt-BR",

  agents: [
    {
      name: "planner",
      role: "Arquiteto de Especificacao e Planejamento",
      status: "active",
      modelTier: "premium",
      capabilities: [
        { name: "Requirements Analysis", level: "expert" },
        { name: "Architecture Design", level: "expert" },
        { name: "Estimation & Sizing", level: "proficient" },
        { name: "Security Planning", level: "proficient" },
        { name: "Technical Writing", level: "expert" },
        { name: "Multi-Tenancy Design", level: "expert" },
      ],
    },
    {
      name: "implementer",
      role: "Desenvolvedor Full-Stack",
      status: "active",
      modelTier: "premium",
      capabilities: [
        { name: "React / TypeScript", level: "expert" },
        { name: "Node.js / Express", level: "expert" },
        { name: "Prisma / PostgreSQL", level: "proficient" },
        { name: "Python / FastAPI", level: "proficient" },
        { name: "Testing", level: "proficient" },
        { name: "API Design", level: "proficient" },
        { name: "State Management", level: "proficient" },
        { name: "DevOps", level: "basic" },
      ],
    },
    {
      name: "reviewer",
      role: "Revisor de Codigo e Seguranca",
      status: "active",
      modelTier: "standard",
      capabilities: [
        { name: "Code Review", level: "expert" },
        { name: "Security Review", level: "proficient" },
        { name: "Architecture Review", level: "proficient" },
        { name: "TypeScript Analysis", level: "proficient" },
        { name: "Performance Review", level: "proficient" },
        { name: "Constitution Enforcement", level: "expert" },
      ],
    },
    {
      name: "verifier",
      role: "QA Engineer e Quality Gate Keeper",
      status: "active",
      modelTier: "standard",
      capabilities: [
        { name: "Test Design", level: "expert" },
        { name: "Test Automation", level: "proficient" },
        { name: "Quality Gates", level: "expert" },
        { name: "Verification", level: "proficient" },
        { name: "Regression Testing", level: "proficient" },
        { name: "Observability", level: "proficient" },
      ],
    },
  ],

  routing: {
    defaultAgent: "implementer",
    rules: [
      { pattern: /\bspecify\b|\bplan\b|\btasks\b|\barchitecture\b|\bdesign\b|\bestimation\b/i, agent: "planner" },
      { pattern: /\bspec\.md\b|\bplan\.md\b|\btasks\.md\b|\bconstitution\b/i, agent: "planner" },
      { pattern: /\buser story\b|\bacceptance criteria\b|\brequirement\b/i, agent: "planner" },
      { pattern: /\bADR\b|\bdecision record\b|\btechnical context\b/i, agent: "planner" },
      { pattern: /\bimplement\b|\bcode\b|\bdevelop\b|\bbuild\b|\bcreate\b/i, agent: "implementer" },
      { pattern: /\bcontroller\b|\bservice\b|\brepository\b|\bcomponent\b|\bhook\b/i, agent: "implementer" },
      { pattern: /\bendpoint\b|\broute\b|\bAPI\b|\bmiddleware\b/i, agent: "implementer" },
      { pattern: /\bfrontend\b|\bbackend\b|\bagent-service\b/i, agent: "implementer" },
      { pattern: /\breview\b|\baudit\b|\binspect\b|\banalyze\b/i, agent: "reviewer" },
      { pattern: /\bsecurity\b|\bvulnerability\b|\bCVE\b|\binjection\b/i, agent: "reviewer" },
      { pattern: /\brefactor\b|\bextract\b|\brename\b|\bsplit\b/i, agent: "reviewer" },
      { pattern: /\bimpact analysis\b|\bblast radius\b|\bdependency\b/i, agent: "reviewer" },
      { pattern: /\bconstitution\b|\bprinciple\b|\bcompliance\b/i, agent: "reviewer" },
      { pattern: /\btest\b|\bspec\b|\bverify\b|\bvalidate\b|\bQA\b/i, agent: "verifier" },
      { pattern: /\bcoverage\b|\bthreshold\b|\bquality gate\b/i, agent: "verifier" },
      { pattern: /\be2e\b|\bplaywright\b|\bjest\b|\bvitest\b/i, agent: "verifier" },
      { pattern: /\bbuild\b|\blint\b|\btype-check\b/i, agent: "verifier" },
      { pattern: /\bhealth check\b|\bmetrics\b|\bobservability\b/i, agent: "verifier" },
    ],
  },

  modelTiers: {
    premium: { contextWindow: 128000, temperature: 0.2 },
    standard: { contextWindow: 64000, temperature: 0.3 },
    basic: { contextWindow: 32000, temperature: 0.4 },
  },
})
