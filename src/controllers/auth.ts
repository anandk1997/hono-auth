import { Context } from "hono";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
import { hashPassword, comparePasswords, generateTokens } from "../utils/auth";
import { logger } from "../utils/logger";
import env from "../config/index";
import jwt from "hono/jwt";

// In-memory user store (replace with a proper database in production)
const users = new Map();

export async function register(c: Context) {
  const body = await c.req.json();
  const validatedData = registerSchema.parse(body);

  if (users.has(validatedData.email)) {
    throw new BadRequestError("Email already registered");
  }

  const hashedPassword = await hashPassword(validatedData.password);
  const user = {
    id: crypto.randomUUID(),
    email: validatedData.email,
    password: hashedPassword,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.set(validatedData.email, user);
  logger.info({ userId: user.id }, "New user registered");

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return c.json({
    user: { id: user.id, email: user.email, role: user.role },
    tokens,
  });
}

export async function login(c: Context) {
  const body = await c.req.json();
  const validatedData = loginSchema.parse(body);

  const user = users.get(validatedData.email);
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValidPassword = await comparePasswords(
    validatedData.password,
    user.password,
  );
  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info({ userId: user.id }, "User logged in");
  return c.json({
    user: { id: user.id, email: user.email, role: user.role },
    tokens,
  });
}

export async function refresh(c: Context) {
  const body = await c.req.json();
  const validatedData = refreshTokenSchema.parse(body);

  try {
    const decoded = jwt.verify(
      validatedData.refreshToken,
      env.JWT_REFRESH_SECRET,
    ) as any;
    const user = Array.from(users.values()).find(
      (u) => u.id === decoded.userId,
    );

    if (!user) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({ tokens });
  } catch (error) {
    throw new UnauthorizedError("Invalid refresh token");
  }
}
