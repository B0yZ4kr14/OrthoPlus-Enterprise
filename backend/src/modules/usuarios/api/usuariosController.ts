import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import bcrypt from "bcrypt";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { randomBytes } = require('crypto') as { randomBytes: (n: number) => Buffer };
import { Request, Response } from "express";


export class UsuariosController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const profiles = await prisma.profiles.findMany({
        where: { clinic_id: user?.clinicId },
      });

      // Filter auth.users by the profile IDs scoped to this clinic — prevents leaking other clinics' user data
      const profileIds = profiles.map((p: { id: string }) => p.id);
      const authUsers = profileIds.length > 0
        ? await (prisma as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            .$queryRaw`SELECT id, email, last_sign_in_at FROM auth.users WHERE id = ANY(${profileIds}::uuid[])`
        : [];

      const usersWithEmail = profiles.map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const authUser = (authUsers as { email: string; id: string; last_sign_in_at?: string }[]).find((u) => u.id === p.id);
        return {
          id: p.id,
          email: authUser?.email || "N/A",
          full_name: p.full_name,
          app_role: p.app_role || "MEMBER",
          clinic_id: p.clinic_id,
          avatar_url: p.avatar_url,
          is_active: p.is_active ?? true,
          last_sign_in_at: authUser?.last_sign_in_at,
          created_at: p.created_at,
        };
      });

      res.json(usersWithEmail);
    } catch (error) {
      logger.error("Error listing users", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { email, password, full_name, app_role, is_active } = req.body;

      if (!user?.clinicId) { res.status(401).json({ error: "Auth required" }); return; }

      // Use a cryptographically secure random password if none provided
      const effectivePassword = password || randomBytes(24).toString("base64url");
      const hashedPassword = await bcrypt.hash(effectivePassword, 12);

      const userResult = await prisma.$queryRaw`
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), ${email}, ${hashedPassword}, NOW(), NOW(), NOW())
        RETURNING id, email
      `;

      const newUserId = (userResult as any[])[0].id; // eslint-disable-line @typescript-eslint/no-explicit-any

      await prisma.profiles.create({
        data: {
          id: newUserId,
          clinic_id: user.clinicId,
          full_name,
          app_role,
          is_active,
        },
      });

      res.status(201).json({ id: newUserId });
    } catch (error) {
      logger.error("Error creating user", { error });
      res.status(400).json({ error: "Failed to create user" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { full_name, app_role, is_active, password } = req.body;

      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Auth required" }); return; }

      const profile = await prisma.profiles.findFirst({ where: { id, clinic_id: clinicId } });
      if (!profile) { res.status(404).json({ error: "User not found" }); return; }

      await prisma.profiles.updateMany({
        where: { id, clinic_id: clinicId },
        data: {
          ...(full_name !== undefined && { full_name }),
          ...(app_role !== undefined && { app_role }),
          ...(is_active !== undefined && { is_active }),
        },
      });

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.$executeRaw`
          UPDATE auth.users SET encrypted_password = ${hashedPassword}, updated_at = NOW() WHERE id = ${id}::uuid
        `;
      }

      res.json({ success: true });
    } catch (error) {
      logger.error("Error updating user", { error });
      res.status(400).json({ error: "Failed to update user" });
    }
  }

  async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Auth required" }); return; }

      const profile = await prisma.profiles.findFirst({ where: { id, clinic_id: clinicId } });
      if (!profile) { res.status(404).json({ error: "User not found" }); return; }

      await prisma.profiles.updateMany({
        where: { id, clinic_id: clinicId },
        data: { is_active },
      });

      res.json({ success: true });
    } catch (error) {
      logger.error("Error toggling user status", { error });
      res.status(400).json({ error: "Failed to update user status" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Auth required" }); return; }

      const profile = await prisma.profiles.findFirst({ where: { id, clinic_id: clinicId } });
      if (!profile) { res.status(404).json({ error: "User not found" }); return; }

      await prisma.profiles.deleteMany({ where: { id, clinic_id: clinicId } });
      await (prisma as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .$executeRaw`DELETE FROM auth.users WHERE id = ${id}::uuid`;

      res.json({ success: true });
    } catch (error) {
      logger.error("Error deleting user", { error });
      res.status(400).json({ error: "Failed to delete user" });
    }
  }

  // Perfil próprio
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { full_name, avatar_url } = req.body;

      await prisma.profiles.update({
        where: { id: user?.id },
        data: {
          ...(full_name !== undefined && { full_name }),
          ...(avatar_url !== undefined && { avatar_url }),
        },
      });

      res.json({ success: true });
    } catch (error) {
      logger.error("Error updating profile", { error });
      res.status(400).json({ error: "Failed to update profile" });
    }
  }
}
