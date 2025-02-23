import type { Context, Next } from "hono";
import { logger } from "../utils/logger.js";
import { ApiError } from "../utils/errors.js";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    logger.error(error);

    if (error instanceof ApiError) {
      return c.json(
        {
          error: {
            message: error.message,
            code: error.code,
          },
        },
        error.statusCode,
      );
    }

    return c.json(
      {
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      500,
    );
  }
}
