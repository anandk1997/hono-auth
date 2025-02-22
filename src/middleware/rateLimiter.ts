import { Context, Next } from "hono";
import { RateLimiterMemory } from "rate-limiter-flexible";
import env from "../config";
import { TooManyRequestsError } from "../utils/errors";

const limiter = new RateLimiterMemory({
  points: env.RATE_LIMIT_MAX,
  duration: env.RATE_LIMIT_WINDOW,
});

export async function rateLimiter(c: Context, next: Next) {
  try {
    const ip = c.req.header("x-forwarded-for") || "unknown";
    await limiter.consume(ip);
    await next();
  } catch (error) {
    throw new TooManyRequestsError();
  }
}
