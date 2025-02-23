import type { Context } from "hono";

export interface User {
  id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CustomContext extends Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
