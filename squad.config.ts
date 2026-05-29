import { defineConfig } from "@bradygaster/squad-sdk";

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
      modelTier: "premium",
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
    {
      name: "ai-engineer",
      role: "Engenheiro de Inteligencia Artificial e Machine Learning",
      status: "active",
      modelTier: "premium",
      capabilities: [
        { name: "LLM Integration", level: "expert" },
        { name: "Computer Vision", level: "proficient" },
        { name: "Embedding Models", level: "proficient" },
        { name: "Prompt Engineering", level: "expert" },
        { name: "AI Safety & Bias", level: "proficient" },
        { name: "Agent Frameworks", level: "proficient" },
        { name: "Model Fine-tuning", level: "basic" },
      ],
    },
    {
      name: "devops-engineer",
      role: "Engenheiro de DevOps, Deploy e Infraestrutura",
      status: "active",
      modelTier: "standard",
      capabilities: [
        { name: "VPS Deployment", level: "expert" },
        { name: "Docker & Compose", level: "proficient" },
        { name: "CI/CD Pipelines", level: "proficient" },
        { name: "Reverse Proxy", level: "expert" },
        { name: "Database Ops", level: "proficient" },
        { name: "Monitoring", level: "proficient" },
        { name: "Infrastructure as Code", level: "basic" },
      ],
    },
    {
      name: "data-engineer",
      role: "Engenheiro de Dados, BI e Analytics",
      status: "active",
      modelTier: "standard",
      capabilities: [
        { name: "SQL & Analytics", level: "expert" },
        { name: "BI Dashboards", level: "proficient" },
        { name: "Data Pipelines", level: "proficient" },
        { name: "ETL / ELT", level: "proficient" },
        { name: "Data Modeling", level: "proficient" },
        { name: "Reporting", level: "expert" },
        { name: "Metrics & KPIs", level: "proficient" },
      ],
    },
  ],

  skillMapping: {
    aiEngineer: [
      "speckit-aide-create-item",
      "speckit-aide-feedback-loop",
      "omk-flow-feature-dev",
      "omk-flow-bugfix",
      "speckit-memory-md-capture",
    ],
    devopsEngineer: [
      "speckit-deploy",
      "speckit-sf-deploy",
      "speckit-ship-run",
      "omk-flow-release",
      "speckit-maqa-ci-check",
    ],
    dataEngineer: [
      "speckit-spec-validate-analytics",
      "speckit-token-analyzer-report",
      "speckit-cost-report",
      "speckit-brownkit-report",
    ],
    shared: [
      "speckit-verify-run",
      "speckit-sync-analyze",
      "speckit-status",
      "omk-quality-gate",
      "gitnexus-impact-analysis",
      "gitnexus-exploring",
    ],
  },

  routing: {
    defaultAgent: "implementer",
    rules: [
      {
        pattern:
          /\bspecify\b|\bplan\b|\btasks\b|\barchitecture\b|\bdesign\b|\bestimation\b/i,
        agent: "planner",
      },
      {
        pattern: /\bspec\.md\b|\bplan\.md\b|\btasks\.md\b|\bconstitution\b/i,
        agent: "planner",
      },
      {
        pattern: /\buser story\b|\bacceptance criteria\b|\brequirement\b/i,
        agent: "planner",
      },
      {
        pattern: /\bADR\b|\bdecision record\b|\btechnical context\b/i,
        agent: "planner",
      },
      {
        pattern: /\bimplement\b|\bcode\b|\bdevelop\b|\bbuild\b|\bcreate\b/i,
        agent: "implementer",
      },
      {
        pattern:
          /\bcontroller\b|\bservice\b|\brepository\b|\bcomponent\b|\bhook\b/i,
        agent: "implementer",
      },
      {
        pattern: /\bendpoint\b|\broute\b|\bAPI\b|\bmiddleware\b/i,
        agent: "implementer",
      },
      {
        pattern: /\bfrontend\b|\bbackend\b|\bagent-service\b/i,
        agent: "implementer",
      },
      {
        pattern: /\breview\b|\baudit\b|\binspect\b|\banalyze\b/i,
        agent: "reviewer",
      },
      {
        pattern: /\bsecurity\b|\bvulnerability\b|\bCVE\b|\binjection\b/i,
        agent: "reviewer",
      },
      {
        pattern: /\brefactor\b|\bextract\b|\brename\b|\bsplit\b/i,
        agent: "reviewer",
      },
      {
        pattern: /\bimpact analysis\b|\bblast radius\b|\bdependency\b/i,
        agent: "reviewer",
      },
      {
        pattern: /\bconstitution\b|\bprinciple\b|\bcompliance\b/i,
        agent: "reviewer",
      },
      {
        pattern: /\btest\b|\bspec\b|\bverify\b|\bvalidate\b|\bQA\b/i,
        agent: "verifier",
      },
      {
        pattern: /\bcoverage\b|\bthreshold\b|\bquality gate\b/i,
        agent: "verifier",
      },
      {
        pattern: /\be2e\b|\bplaywright\b|\bjest\b|\bvitest\b/i,
        agent: "verifier",
      },
      { pattern: /\bbuild\b|\blint\b|\btype-check\b/i, agent: "verifier" },
      {
        pattern: /\bhealth check\b|\bmetrics\b|\bobservability\b/i,
        agent: "verifier",
      },
      {
        pattern:
          /\bai\b|\bllm\b|\bmodel\b|\bembedding\b|\bvision\b|\bradiografia\b|\bgenai\b|\bprompt\b/i,
        agent: "ai-engineer",
      },
      {
        pattern:
          /\bollama\b|\bopenai\b|\banthropic\b|\bvector\b|\brag\b|\bsemantic search\b/i,
        agent: "ai-engineer",
      },
      {
        pattern: /\bia-radiografia\b|\bmemory_hub\b|\bembedding\b/i,
        agent: "ai-engineer",
      },
      {
        pattern:
          /\bdeploy\b|\brelease\b|\bship\b|\bdocker\b|\bnginx\b|\bpm2\b|\bci\/cd\b|\bbackup\b/i,
        agent: "devops-engineer",
      },
      {
        pattern:
          /\bssl\b|\btls\b|\bcertificate\b|\bworkflow\b|\bpipeline\b|\bdeploy-vps\b/i,
        agent: "devops-engineer",
      },
      {
        pattern:
          /\bdockerfile\b|\bdocker-compose\b|\bcontainer\b|\binfrastructure\b/i,
        agent: "devops-engineer",
      },
      {
        pattern:
          /\bdashboard\b|\banalytics\b|\bbi\b|\breport\b|\bsql\b|\bquery\b|\bmetric\b|\bkpi\b/i,
        agent: "data-engineer",
      },
      {
        pattern:
          /\betl\b|\bpipeline\b|\bdata flow\b|\bimport\b|\bexport\b|\bcsv\b|\bexcel\b/i,
        agent: "data-engineer",
      },
      {
        pattern:
          /\bchart\b|\bgraph\b|\bvisualization\b|\brecharts\b|\btimeline\b/i,
        agent: "data-engineer",
      },
      {
        pattern:
          /\bdre\b|\bcash flow\b|\bconciliation\b|\bofx\b|\bfinancial report\b/i,
        agent: "data-engineer",
      },
    ],
  },

  modelTiers: {
    premium: { contextWindow: 128000, temperature: 0.2 },
    standard: { contextWindow: 64000, temperature: 0.3 },
    basic: { contextWindow: 32000, temperature: 0.4 },
  },
});
