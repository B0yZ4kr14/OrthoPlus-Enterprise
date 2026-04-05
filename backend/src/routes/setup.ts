import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router: Router = Router();

/**
 * POST /setup/create-first-admin
 * Creates the first admin user when system has no users.
 * This endpoint is meant to be used only once during initial setup.
 */
router.post("/create-first-admin", async (req, res): Promise<any> => {
  try {
    // Check if any users already exist
    const userCount = await prisma.user_clinic_access.count();
    if (userCount > 0) {
      return res.status(400).json({
        error: "Setup already completed",
        message: "Users already exist in the system. This endpoint can only be used for initial setup."
      });
    }

    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Email, password, and fullName are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password too weak",
        message: "Password must be at least 8 characters long"
      });
    }

    // Create default clinic
    const clinic = await prisma.clinics.create({
      data: {
        name: "Clínica Principal",
      }
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        role: "ADMIN",
        clinic_id: clinic.id,
      }
    });

    // Grant clinic access
    await prisma.user_clinic_access.create({
      data: {
        user_id: user.id,
        clinic_id: clinic.id,
        is_default: true,
      }
    });

    res.status(201).json({
      success: true,
      message: "First admin user created successfully",
      data: {
        userId: user.id,
        clinicId: clinic.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error creating first admin:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create admin user"
    });
  }
});

export default router;
