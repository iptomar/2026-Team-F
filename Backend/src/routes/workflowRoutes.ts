import { Router } from "express";
import { WorkflowController } from "../controllers/workflowController";

const router = Router();
const controller = new WorkflowController();

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.findAll(req, res));
router.get("/:id", (req, res) => controller.findById(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));

export default router;