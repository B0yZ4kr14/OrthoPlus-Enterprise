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
    console.log("[seed] SEED_ADMIN_PASSWORD not set or too short. Skipping admin user creation.");
    console.log("[seed] To create admin users, set SEED_ADMIN_PASSWORD env var (min 8 chars).");
    console.log("[seed] Seed completed.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  for (const admin of DEFAULT_ADMINS) {
    const existing = await prisma.users.findUnique({
      where: { email: admin.email },
    });

    if (existing) {
      console.log(`[seed] User already exists: ${admin.email} (${existing.id})`);
      continue;
    }

    const user = await prisma.users.create({
      data: {
        id: admin.id,
        email: admin.email,
        password_hash: passwordHash,
        role: admin.role,
        clinic_id: clinic.id,
        is_active: true,
      },
    });

    console.log(`[seed] User created: ${user.email} (${user.id}) — role: ${user.role}`);
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
