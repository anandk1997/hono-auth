import { Hono } from "hono";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = new Hono();

router.use("*", authenticate);

router.get("/user-info", async (c: any) => {
  return c.json({ user: c.user });
});

router.get("/admin-only", requireRole("admin"), async (c) => {
  return c.json({ message: "Admin access granted" });
});

export default router;
