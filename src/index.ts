import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import env from "./config";
import { ApiError } from "./utils/errors";

const app = new Hono();

// Middleware
// app.use('*', errorHandler);
app.onError((err, c) => {
  logger.error(err);
  if (err instanceof ApiError) {
    return c.json(
      { error: { message: err.message, code: err.code } },
      err.statusCode,
    );
  }

  return c.json(
    { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
    500,
  );
});

// Routes
app.route("/auth", authRoutes);
app.route("/api", protectedRoutes);

// OpenAPI documentation
app.get("/docs", (c) => {
  return c.json({
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version: "1.0.0",
    },
    paths: {
      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          email: { type: "string" },
                          role: { type: "string" },
                        },
                      },
                      tokens: {
                        type: "object",
                        properties: {
                          accessToken: { type: "string" },
                          refreshToken: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Add other endpoint documentation here
    },
  });
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Start server
serve(
  {
    fetch: app.fetch,
    port: parseInt(env.PORT),
  },
  (info) => {
    logger.info(`Server is running on port ${info.port}`);
  },
);
