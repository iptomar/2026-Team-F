import { Router } from "express";
import { FormTemplateController } from "../controllers/formTemplateController";

const router = Router();
const controller = new FormTemplateController();

// POST /form-templates — Criar novo template
router.post("/", (req, res) => controller.create(req, res));

// GET /form-templates — Listar todos os templates
router.get("/", (req, res) => controller.findAll(req, res));

// GET /form-templates/:id — Obter template por ID
router.get("/:id", (req, res) => controller.findById(req, res));

// PATCH /form-templates/:id — Atualizar name/description de um template
router.patch("/:id", (req, res) => controller.update(req, res));

export default router;
