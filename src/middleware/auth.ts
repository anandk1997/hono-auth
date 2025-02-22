import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import env from "../config";
import { CustomContext } from "../types";
import { UnauthorizedError } from "../utils/errors";

export async function authenticate(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    (c as CustomContext).user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw error;
  }
}

export function requireRole(role: string) {
  return async (c: CustomContext, next: Next) => {
    if (c.user?.role !== role) {
      throw new UnauthorizedError("Insufficient permissions");
    }
    await next();
  };
}
