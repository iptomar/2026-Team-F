import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new AuthController();

router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));

router.get("/me", authMiddleware, (req, res) => controller.me(req, res));
router.post("/logout", authMiddleware, (req, res) =>
  controller.logout(req, res)
);

export default router;