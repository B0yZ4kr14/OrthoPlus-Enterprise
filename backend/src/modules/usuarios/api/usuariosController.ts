import { IUsuariosRepository } from "@/modules/usuarios/domain/repositories/IUsuariosRepository";
import { logger } from "@/infrastructure/logger";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto"
import { Request, Response } from "express";

import { UsuariosRepository } from "@/modules/usuarios/infrastructure/UsuariosRepository"

export class UsuariosController {
  private repo: IUsuariosRepository

  constructor(repo?: IUsuariosRepository) {
    this.repo = repo ?? new UsuariosRepository()
  }
  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const profiles = await this.repo.findProfilesByClinic(user?.clinicId as string);

      const profileIds = profiles.map((p: { id: string }) => p.id);
      const users = await this.repo.findUsersByIds(profileIds);

      const usersWithEmail = profiles.map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const u = users.find((u) => u.id === p.id);
        return {
          id: p.id,
          email: u?.email || "N/A",
          full_name: p.full_name,
          app_role: p.app_role || "MEMBER",
          clinic_id: p.clinic_id,
          avatar_url: p.avatar_url,
          is_active: p.is_active ?? true,
          last_sign_in_at: u?.last_sign_in_at,
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

      const effectivePassword = password || randomBytes(24).toString("base64url");
      const hashedPassword = await bcrypt.hash(effectivePassword, 12);

      const newUser = await this.repo.createUser({
        email,
        password_hash: hashedPassword,
        role: app_role || "MEMBER",
        clinic_id: user.clinicId,
        is_active: is_active ?? true,
      });

      await this.repo.createProfile({
        id: newUser.id,
        clinic_id: user.clinicId,
        full_name,
        app_role: app_role || "MEMBER",
        is_active: is_active ?? true,
      });

      res.status(201).json({ id: newUser.id });
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

      const profile = await this.repo.findProfileByIdAndClinic(id, clinicId);
      if (!profile) { res.status(404).json({ error: "User not found" }); return; }

      await this.repo.updateProfile(id, clinicId, {
        ...(full_name !== undefined && { full_name }),
        ...(app_role !== undefined && { app_role }),
        ...(is_active !== undefined && { is_active }),
      });

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await this.repo.updateUser(id, { password_hash: hashedPassword });
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

      const profile = await this.repo.findProfileByIdAndClinic(id, clinicId);
      if (!profile) { res.status(404).json({ error: "User not found" }); return; }

      await this.repo.updateProfile(id, clinicId, { is_active });
      await this.repo.updateUser(id, { is_active });

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

      const profile = await this.repo.findProfileByIdAndClinic(id, clinicId);
      if (!profile) { res.status(404).json({ error: "User not found" }); return; }

      await this.repo.deleteProfilesByIdAndClinic(id, clinicId);
      await this.repo.deleteUser(id);

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

      await this.repo.updateOwnProfile(user?.id as string, {
        ...(full_name !== undefined && { full_name }),
        ...(avatar_url !== undefined && { avatar_url }),
      });

      res.json({ success: true });
    } catch (error) {
      logger.error("Error updating profile", { error });
      res.status(400).json({ error: "Failed to update profile" });
    }
  }
}
