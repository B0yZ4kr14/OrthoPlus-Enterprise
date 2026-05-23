#!/usr/bin/env node
/**
 * OrthoPlus Style Guard v1
 * Detecta cores Tailwind nativas e hardcoded colors em arquivos de UI.
 * Fase 1 (scaffolding): detecta violacoes, nao falha o build.
 * Conforme spec 20260509-token-first-tailwind.
 */

const { readFileSync, readdirSync, statSync } = require("fs");
const { join, relative } = require("path");

const ROOT = process.cwd();
const EXIT_OK = 0;

const DEFAULT_TAILWIND_COLOR_RE =
  /\b(?:text|bg|border|from|to|via|ring|shadow|outline|decoration|fill|stroke|caret|accent|divide|placeholder|selection)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/;

const HARDCODED_COLOR_RE =
  /(?<!\w)(?:#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([0-9\s%deg,./-]+\)|hsla\([0-9\s%deg,./-]+\))(?![-\w])/;

const CSS_WIDE_KEYWORDS = new Set([
  "transparent", "currentcolor", "inherit", "initial", "unset", "revert",
  "currentColor", "none", "auto",
]);

const UTILITY_EXEMPT_COLORS = new Set(["white", "black"]);

const NAMED_COLORS = new Set([
  "aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen",
]);

const ALLOWLIST = [
  { pattern: /BitcoinInfoCard\.tsx$/, reason: "Bitcoin brand color" },
  { pattern: /crypto\//, reason: "Crypto components (brand colors)" },
  { pattern: /EventIcon\.tsx$/, reason: "Webhook status icons" },
  { pattern: /PasswordStrengthIndicator/, reason: "Security indicator colors" },
  { pattern: /password-strength-indicator\//, reason: "Password strength utilities" },
  { pattern: /AtividadeList\.tsx$/, reason: "CRM status colors (legacy)" },
  { pattern: /atividade-list\//, reason: "CRM activity list" },
  { pattern: /LeadCard\.tsx$/, reason: "CRM lead card colors" },
  { pattern: /lead-card\//, reason: "CRM lead card" },
  { pattern: /KanbanBoard\.tsx$/, reason: "Kanban column colors (legacy)" },
  { pattern: /SketchEditor/, reason: "User drawing colors" },
  { pattern: /AgentIcon/, reason: "Brand icon gradients" },
  { pattern: /BarcodeScanner/, reason: "Canvas/video scanning UI" },
  { pattern: /ScanningOverlay/, reason: "Scanner overlay" },
  { pattern: /ThemePreview/, reason: "Theme preview component" },
  { pattern: /CryptoRatesWidget/, reason: "Crypto price indicators" },
  { pattern: /PerformanceMonitor/, reason: "Performance metrics" },
  { pattern: /dashboard\//, reason: "Dashboard components (legacy colors)" },
  { pattern: /ActionCardMemo\.tsx$/, reason: "Dashboard action cards" },
  { pattern: /StatCardMemo\.tsx$/, reason: "Dashboard stat cards" },
  { pattern: /DashboardQuickStats\.tsx$/, reason: "Dashboard quick stats" },
  { pattern: /MarketRatesWidget\.tsx$/, reason: "Dashboard market rates" },
  { pattern: /DashboardSkeleton\.tsx$/, reason: "Dashboard skeleton" },
  { pattern: /crypto-rates-widget\//, reason: "Crypto rates widget" },
  { pattern: /DraggableAppointment\.tsx$/, reason: "Agenda color coding" },
  { pattern: /ErrorBoundary\.tsx$/, reason: "Error fallback UI" },
  { pattern: /ModuleCard\.tsx$/, reason: "Module card icons" },
  { pattern: /WebhookManager\.tsx$/, reason: "Admin webhook status" },
  { pattern: /ForgotPassword/, reason: "Auth pages (legacy colors)" },
  { pattern: /forgot-password\//, reason: "Forgot password flow" },
  { pattern: /SkipLink\.tsx$/, reason: "Accessibility skip link" },
  { pattern: /patient-status\.ts$/, reason: "Patient status type definitions" },
  { pattern: /toast\.tsx$/, reason: "Toast component (legacy colors)" },
  { pattern: /tokens-v3\.ts$/, reason: "Token definitions" },
  { pattern: /semantic-colors\.ts$/, reason: "Semantic color utilities" },
  { pattern: /\.test\.(tsx|ts)$/, reason: "Test fixtures" },
  { pattern: /__tests__\//, reason: "Test directory" },
  { pattern: /scripts\/guard\.(ts|js|cjs)$/, reason: "Guard script" },
  { pattern: /patients\//, reason: "Patient components (legacy colors)" },
  { pattern: /onboarding\//, reason: "Onboarding flow (legacy colors)" },
  { pattern: /settings\//, reason: "Settings components (legacy colors)" },
  { pattern: /admin\//, reason: "Admin components (legacy colors)" },
  { pattern: /crm\//, reason: "CRM components (legacy colors)" },
  { pattern: /financeiro\//, reason: "Finance components (legacy colors)" },
  { pattern: /agenda\//, reason: "Agenda components (legacy colors)" },
  { pattern: /estoque\//, reason: "Estoque components (legacy colors)" },
  { pattern: /pep\//, reason: "PEP components (legacy colors)" },
  { pattern: /pdv\//, reason: "PDV components (legacy colors)" },
  { pattern: /lgpd\//, reason: "LGPD components (legacy colors)" },
  { pattern: /bi\//, reason: "BI components (legacy colors)" },
  { pattern: /dashboards\//, reason: "Dashboards components (legacy colors)" },
  { pattern: /portal-paciente\//, reason: "Portal paciente components (legacy colors)" },
  { pattern: /marketing-auto\//, reason: "Marketing auto components (legacy colors)" },
  { pattern: /teleodonto\//, reason: "Teleodonto components (legacy colors)" },
  { pattern: /tiss\//, reason: "TISS components (legacy colors)" },
  { pattern: /inventario\//, reason: "Inventario components (legacy colors)" },
  { pattern: /split-pagamento\//, reason: "Split pagamento components (legacy colors)" },
  { pattern: /files\//, reason: "Files components (legacy colors)" },
  { pattern: /cobranca\//, reason: "Cobranca components (legacy colors)" },
  { pattern: /contratos\//, reason: "Contratos components (legacy colors)" },
  { pattern: /orcamentos\//, reason: "Orcamentos components (legacy colors)" },
  { pattern: /procedimentos\//, reason: "Procedimentos components (legacy colors)" },
  { pattern: /dentistas\//, reason: "Dentistas components (legacy colors)" },
  { pattern: /funcionarios\//, reason: "Funcionarios components (legacy colors)" },
  { pattern: /odontograma\//, reason: "Odontograma components (legacy colors)" },
  { pattern: /tratamentos\//, reason: "Tratamentos components (legacy colors)" },
  { pattern: /ia-radiografia\//, reason: "IA radiografia components (legacy colors)" },
  { pattern: /landpage\//, reason: "Landpage components (legacy colors)" },
  { pattern: /core\/layout\//, reason: "Core layout components (legacy colors)" },
  { pattern: /core\/ui\//, reason: "Core UI components (legacy colors)" },
  { pattern: /modules\//, reason: "Module components (legacy colors)" },
  { pattern: /shared\/form-field\//, reason: "Form field components (legacy colors)" },
  { pattern: /shared\/module-tooltip\//, reason: "Module tooltip components (legacy colors)" },
  { pattern: /shared\//, reason: "Shared components (legacy colors)" },
  { pattern: /error-boundary\//, reason: "Error boundary components" },
  { pattern: /imaging\//, reason: "Imaging components" },
  { pattern: /performance-monitor\//, reason: "Performance monitor components" },
  { pattern: /hooks\/api\/useBackups\.ts$/, reason: "Backup hooks (false positive)" },
  { pattern: /lib\/utils\/status\.utils\.ts$/, reason: "Status utilities (legacy colors)" },
];

function isAllowlisted(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  for (const entry of ALLOWLIST) {
    if (entry.pattern.test(normalized)) return { allowed: true, reason: entry.reason };
  }
  return { allowed: false };
}

function* walk(dir, base = dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(base, full).replace(/\\/g, "/");
    const st = statSync(full);
    if (st.isDirectory()) {
      if (
        entry === "node_modules" || entry === ".git" || entry === "dist" ||
        entry === "build" || entry === ".turbo" || entry === ".specify-backups" ||
        entry === ".omk" || entry === ".sisyphus" || entry === "playwright-report" ||
        entry === "graphify-out" || entry === "agent-service"
      )
        continue;
      yield* walk(full, base);
    } else if (st.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry)) {
      yield full;
    }
  }
}

function checkFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  if (isAllowlisted(rel).allowed) return [];

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const codeLine = line.replace(/\/\/.*$/, "").replace(/\/\*.*\*\//, "");

    const twMatch = codeLine.match(DEFAULT_TAILWIND_COLOR_RE);
    if (twMatch) {
      violations.push({ file: rel, line: lineNum, col: codeLine.indexOf(twMatch[0]) + 1, text: twMatch[0], rule: "tailwind-default-color" });
    }

    if (codeLine.includes("className=") || codeLine.includes("style=") || codeLine.includes("class=")) {
      const cleanLine = codeLine.replace(/hsl\(var\(--[\w-]+\)\)/g, "");
      const hcMatch = cleanLine.match(HARDCODED_COLOR_RE);
      if (hcMatch) {
        violations.push({ file: rel, line: lineNum, col: cleanLine.indexOf(hcMatch[0]) + 1, text: hcMatch[0], rule: "hardcoded-color" });
      }
    }

    const words = codeLine.split(/[^a-zA-Z]+/);
    for (const word of words) {
      const lower = word.toLowerCase();
      if (NAMED_COLORS.has(lower) && !CSS_WIDE_KEYWORDS.has(lower)) {
        const idx = codeLine.toLowerCase().indexOf(lower);
        const before = codeLine.slice(Math.max(0, idx - 5), idx).toLowerCase();
        if (UTILITY_EXEMPT_COLORS.has(lower) && /(?:text|bg|border|fill|stroke)-$/.test(before)) continue;
        violations.push({ file: rel, line: lineNum, col: idx + 1, text: word, rule: "named-color" });
      }
    }
  }

  return violations;
}

function main() {
  const scanDirs = ["apps/web/src", "categories/@orthoplus"];
  const allViolations = [];

  for (const dir of scanDirs) {
    const fullDir = join(ROOT, dir);
    try {
      for (const file of walk(fullDir)) {
        allViolations.push(...checkFile(file));
      }
    } catch (e) {
      console.error(`Error scanning ${dir}:`, e.message);
    }
  }

  if (allViolations.length === 0) {
    console.log("✅ Style Guard PASS — no violations found.");
    process.exit(EXIT_OK);
  }

  console.warn(`⚠️  Style Guard REPORT — ${allViolations.length} violation(s) found:\n`);
  for (const v of allViolations.slice(0, 50)) {
    console.warn(`  ${v.file}:${v.line}:${v.col}  [${v.rule}]  "${v.text}"`);
  }
  if (allViolations.length > 50) {
    console.warn(`  ... and ${allViolations.length - 50} more`);
  }
  console.warn("\nUse project semantic tokens (e.g., bg-success, text-interactive, shadow-card) or add an allowlist entry.");
  console.warn("\nPhase 1 (scaffolding): violations are reported but do not fail the build.");
  process.exit(EXIT_OK);
}

main();
