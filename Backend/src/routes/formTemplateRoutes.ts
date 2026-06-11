import { Router } from "express";
import { FormTemplateController } from "../controllers/formTemplateController";

const router = Router();
const controller = new FormTemplateController();

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.findAll(req, res));
router.get("/:id", (req, res) => controller.findById(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

router.patch("/:id/workflow", (req, res) =>
  controller.associateWorkflow(req, res)
);

export default router;