import { Hono } from "hono";
import { register, login, refresh } from "../controllers/auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const auth = new Hono();

auth.post("/register", rateLimiter, register);
auth.post("/login", rateLimiter, login);
auth.post("/refresh", rateLimiter, refresh);

export default auth;
