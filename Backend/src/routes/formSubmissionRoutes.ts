import { Router } from "express";
import { FormSubmissionController } from "../controllers/formSubmissionController";

const router = Router();
const controller = new FormSubmissionController();

router.post("/", (req, res) => controller.create(req, res));

router.get("/", (req, res) => controller.findAll(req, res));

router.get("/template/:formTemplateId", (req, res) =>
  controller.findByTemplateId(req, res)
);

router.get("/:id/details", (req, res) =>
  controller.findDetailsById(req, res)
);

router.get("/:id", (req, res) => controller.findById(req, res));

export default router;