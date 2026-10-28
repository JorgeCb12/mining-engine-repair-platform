import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["administrador", "operativo"]).optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "El usuario ya existe" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: role || "operativo" },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos", details: error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res
        .status(401)
        .json({ error: "Credenciales inválidas o usuario inactivo" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    );

    res.json({
      access_token: token,
      token_type: "Bearer",
      user: { id: user.id, role: user.role },
    });
  } catch (error) {
    res.status(400).json({ error: "Error en el login" });
  }
};
