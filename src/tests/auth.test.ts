import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, comparePasswords, generateTokens } from "../utils/auth";

describe("Authentication Utils", () => {
  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$/);
    });

    it("should verify password correctly", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      const isValid = await comparePasswords(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hashedPassword = await hashPassword(password);

      const isValid = await comparePasswords(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe("Token Generation", () => {
    it("should generate both access and refresh tokens", () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        role: "user",
      };

      const tokens = generateTokens(payload);

      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });
  });
});
