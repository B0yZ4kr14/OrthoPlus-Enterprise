import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEFAULT_CLINIC = {
  id: "cli-orthoplus-001",
  name: "OrthoPlus Principal",
};

const DEFAULT_ADMINS = [
  { id: "usr-admin-001", email: "admin@orthoplus.com", role: "ADMIN" },
  { id: "usr-admin-002", email: "Admin", role: "ADMIN" },
];

function getAdminPassword(): string | undefined {
  const envPassword = process.env.SEED_ADMIN_PASSWORD;
  if (envPassword && envPassword.length >= 8) {
    return envPassword;
  }
  return undefined;
}

async function upsertOrCreate(
  model: any,
  where: any,
  data: any,
  label: string,
) {
  try {
    const existing = await model.findUnique({ where });
    if (existing) {
      console.log(`[seed] ${label} already exists`);
      return existing;
    }
    const created = await model.create({ data });
    console.log(`[seed] ${label} created`);
    return created;
  } catch (e) {
    console.error(`[seed] Error with ${label}:`, e);
    throw e;
  }
}

async function main() {
  console.log("[seed] Starting database seed...");

  const clinic = await prisma.clinics.upsert({
    where: { id: DEFAULT_CLINIC.id },
    update: {},
    create: {
      id: DEFAULT_CLINIC.id,
      name: DEFAULT_CLINIC.name,
    },
  });
  console.log(`[seed] Clinic ensured: ${clinic.id} — ${clinic.name}`);

  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    console.log(
      "[seed] SEED_ADMIN_PASSWORD not set or too short. Skipping admin user creation.",
    );
    console.log(
      "[seed] To create admin users, set SEED_ADMIN_PASSWORD env var (min 8 chars).",
    );
    console.log("[seed] Seed completed.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  for (const admin of DEFAULT_ADMINS) {
    await upsertOrCreate(
      prisma.users,
      { email: admin.email },
      {
        id: admin.id,
        email: admin.email,
        password_hash: passwordHash,
        role: admin.role,
        clinic_id: clinic.id,
        is_active: true,
      },
      `User: ${admin.email}`,
    );
  }

  // ─── Seed Profiles (Dentists) ───
  const dentistProfiles = [
    {
      id: "prof-dentist-001",
      full_name: "Dr. João Silva",
      app_role: "DENTIST",
      clinic_id: clinic.id,
      is_active: true,
      phone: "(11) 99999-1111",
    },
    {
      id: "prof-dentist-002",
      full_name: "Dra. Maria Santos",
      app_role: "DENTIST",
      clinic_id: clinic.id,
      is_active: true,
      phone: "(11) 99999-2222",
    },
  ];

  for (const prof of dentistProfiles) {
    await upsertOrCreate(prisma.profiles, { id: prof.id }, prof, `Profile: ${prof.full_name}`);
  }

  // ─── Seed Patients ───
  const seedPatients = [
    {
      id: "pat-001",
      full_name: "Maria Oliveira",
      clinic_id: clinic.id,
      birth_date: "1985-03-15",
      cpf: "123.456.789-00",
      email: "maria@email.com",
      phone_primary: "(11) 98888-1111",
      gender: "F",
      address_street: "Rua das Flores",
      address_number: "123",
      address_neighborhood: "Jardim Paulista",
      address_city: "São Paulo",
      address_state: "SP",
      address_zipcode: "01415-000",
      address_country: "BR",
      emergency_contact_name: "João Oliveira",
      emergency_contact_relationship: "Esposo",
      created_by: DEFAULT_ADMINS[0].id,
    },
    {
      id: "pat-002",
      full_name: "Carlos Pereira",
      clinic_id: clinic.id,
      birth_date: "1990-07-22",
      cpf: "987.654.321-00",
      email: "carlos@email.com",
      phone_primary: "(11) 98888-2222",
      gender: "M",
      address_street: "Av. Paulista",
      address_number: "1000",
      address_neighborhood: "Bela Vista",
      address_city: "São Paulo",
      address_state: "SP",
      address_zipcode: "01310-100",
      address_country: "BR",
      emergency_contact_name: "Ana Pereira",
      emergency_contact_relationship: "Esposa",
      created_by: DEFAULT_ADMINS[0].id,
    },
    {
      id: "pat-003",
      full_name: "Ana Souza",
      clinic_id: clinic.id,
      birth_date: "1995-11-08",
      cpf: "456.789.123-00",
      email: "ana@email.com",
      phone_primary: "(11) 98888-3333",
      gender: "F",
      address_street: "Rua Augusta",
      address_number: "500",
      address_neighborhood: "Consolação",
      address_city: "São Paulo",
      address_state: "SP",
      address_zipcode: "01305-000",
      address_country: "BR",
      emergency_contact_name: "Pedro Souza",
      emergency_contact_relationship: "Irmão",
      created_by: DEFAULT_ADMINS[0].id,
    },
  ];

  for (const p of seedPatients) {
    await upsertOrCreate(prisma.patients, { id: p.id }, p as any, `Patient: ${p.full_name}`);
  }

  // ─── Seed Funcionários ───
  const seedFuncionarios = [
    {
      id: "func-001",
      nome: "Dr. João Silva",
      cargo: "Dentista",
      email: "joao.silva@orthoplus.com",
      cpf: "123.456.789-01",
      rg: "12.345.678-9",
      celular: "(11) 99999-1111",
      telefone: "(11) 3333-1111",
      data_nascimento: "1980-05-10",
      data_admissao: "2020-01-15",
      sexo: "M",
      salario: 15000,
      status: "ATIVO",
      clinic_id: clinic.id,
      dias_trabalho: [1, 2, 3, 4, 5],
      horario_trabalho: { inicio: "08:00", fim: "18:00" },
      endereco: {
        rua: "Rua dos Dentistas",
        numero: "100",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01000-000",
      },
      permissoes: { agenda: true, pacientes: true, financeiro: true },
    },
    {
      id: "func-002",
      nome: "Dra. Maria Santos",
      cargo: "Dentista",
      email: "maria.santos@orthoplus.com",
      cpf: "987.654.321-01",
      rg: "98.765.432-1",
      celular: "(11) 99999-2222",
      telefone: "(11) 3333-2222",
      data_nascimento: "1985-08-20",
      data_admissao: "2021-03-10",
      sexo: "F",
      salario: 14000,
      status: "ATIVO",
      clinic_id: clinic.id,
      dias_trabalho: [1, 2, 3, 4, 5],
      horario_trabalho: { inicio: "09:00", fim: "17:00" },
      endereco: {
        rua: "Av. Odontológica",
        numero: "200",
        bairro: "Jardins",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01400-000",
      },
      permissoes: { agenda: true, pacientes: true, financeiro: false },
    },
    {
      id: "func-003",
      nome: "Pedro Almeida",
      cargo: "Recepcionista",
      email: "pedro.almeida@orthoplus.com",
      cpf: "456.789.123-01",
      rg: "45.678.901-2",
      celular: "(11) 99999-3333",
      telefone: "(11) 3333-3333",
      data_nascimento: "1992-02-14",
      data_admissao: "2022-06-01",
      sexo: "M",
      salario: 5000,
      status: "ATIVO",
      clinic_id: clinic.id,
      dias_trabalho: [1, 2, 3, 4, 5, 6],
      horario_trabalho: { inicio: "07:00", fim: "19:00" },
      endereco: {
        rua: "Rua da Recepção",
        numero: "50",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01050-000",
      },
      permissoes: { agenda: true, pacientes: true, financeiro: false },
    },
  ];

  for (const f of seedFuncionarios) {
    await upsertOrCreate(prisma.funcionarios, { id: f.id }, f as any, `Funcionario: ${f.nome}`);
  }

  // ─── Seed Appointments ───
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const seedAppointments = [
    {
      id: "apt-001",
      patient_id: "pat-001",
      dentist_id: "prof-dentist-001",
      clinic_id: clinic.id,
      start_time: `${dateStr}T09:00:00Z`,
      end_time: `${dateStr}T09:30:00Z`,
      status: "CONFIRMED",
      title: "Consulta de Rotina",
      description: "Checkup periodontal",
      created_by: DEFAULT_ADMINS[0].id,
    },
    {
      id: "apt-002",
      patient_id: "pat-002",
      dentist_id: "prof-dentist-002",
      clinic_id: clinic.id,
      start_time: `${dateStr}T10:00:00Z`,
      end_time: `${dateStr}T10:30:00Z`,
      status: "SCHEDULED",
      title: "Limpeza",
      description: "Profilaxia",
      created_by: DEFAULT_ADMINS[0].id,
    },
    {
      id: "apt-003",
      patient_id: "pat-003",
      dentist_id: "prof-dentist-001",
      clinic_id: clinic.id,
      start_time: `${dateStr}T14:00:00Z`,
      end_time: `${dateStr}T14:30:00Z`,
      status: "PENDING",
      title: "Avaliação Ortodôntica",
      description: "Avaliação para aparelho",
      created_by: DEFAULT_ADMINS[0].id,
    },
  ];

  for (const apt of seedAppointments) {
    await upsertOrCreate(prisma.appointments, { id: apt.id }, apt as any, `Appointment: ${apt.title}`);
  }

  // ─── Seed Leads (CRM) ───
  const seedLeads = [
    {
      id: "lead-001",
      nome: "Fernanda Lima",
      email: "fernanda@email.com",
      telefone: "(11) 97777-1111",
      whatsapp: "(11) 97777-1111",
      status_funil: "NOVO",
      temperatura: "MORNA",
      interesse: "Clareamento Dental",
      origem: "Instagram",
      clinic_id: clinic.id,
      created_by: DEFAULT_ADMINS[0].id,
    },
    {
      id: "lead-002",
      nome: "Ricardo Gomes",
      email: "ricardo@email.com",
      telefone: "(11) 97777-2222",
      whatsapp: "(11) 97777-2222",
      status_funil: "CONTATO",
      temperatura: "QUENTE",
      interesse: "Implante Dentário",
      origem: "Google",
      clinic_id: clinic.id,
      created_by: DEFAULT_ADMINS[0].id,
    },
    {
      id: "lead-003",
      nome: "Juliana Costa",
      email: "juliana@email.com",
      telefone: "(11) 97777-3333",
      whatsapp: "(11) 97777-3333",
      status_funil: "PROPOSTA",
      temperatura: "QUENTE",
      interesse: "Aparelho Ortodôntico",
      origem: "Indicação",
      clinic_id: clinic.id,
      created_by: DEFAULT_ADMINS[0].id,
    },
  ];

  for (const lead of seedLeads) {
    await upsertOrCreate(prisma.leads, { id: lead.id }, lead as any, `Lead: ${lead.nome}`);
  }

  // ─── Seed Produtos (Estoque) ───
  const seedProdutos = [
    {
      id: "prod-001",
      nome: "Luva de Látex",
      descricao: "Luva estéril descartável",
      categoria: "Consumíveis",
      quantidade_atual: 500,
      quantidade_minima: 50,
      valor_unitario: 250,
      unidade_medida: "caixa",
      ativo: true,
      clinic_id: clinic.id,
    },
    {
      id: "prod-002",
      nome: "Resina Composta",
      descricao: "Resina para restaurações",
      categoria: "Materiais",
      quantidade_atual: 30,
      quantidade_minima: 5,
      valor_unitario: 15000,
      unidade_medida: "unidade",
      ativo: true,
      clinic_id: clinic.id,
    },
    {
      id: "prod-003",
      nome: "Anestésico Lidocaína",
      descricao: "Anestésico local 2%",
      categoria: "Medicamentos",
      quantidade_atual: 100,
      quantidade_minima: 10,
      valor_unitario: 1800,
      unidade_medida: "ampola",
      ativo: true,
      clinic_id: clinic.id,
    },
  ];

  for (const prod of seedProdutos) {
    await upsertOrCreate(prisma.produtos, { id: prod.id }, prod as any, `Produto: ${prod.nome}`);
  }

  console.log("[seed] Database seed completed.");
}

main()
  .catch((e) => {
    console.error("[seed] Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
