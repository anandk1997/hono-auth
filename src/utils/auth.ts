import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/index.js";
import type { JWTPayload, AuthTokens } from "../types/index.js";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateTokens(payload: JWTPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    // expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    // expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}
