import { Request, Response } from "express";
import { FormTemplateService } from "../services/formTemplateService";

const service = new FormTemplateService();

export class FormTemplateController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, status } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ error: "O campo 'name' é obrigatório." });
        return;
      }

      if (name.length > 255) {
        res
          .status(400)
          .json({ error: "O campo 'name' não pode exceder 255 caracteres." });
        return;
      }

      if (status && !["draft", "published"].includes(status)) {
        res
          .status(400)
          .json({ error: "Status deve ser 'draft' ou 'published'." });
        return;
      }

      const template = await service.create({
        name: name.trim(),
        description: description ?? undefined,
        status,
      });

      res.status(201).json(template);
    } catch (error) {
      console.error("Erro ao criar template:", error);
      res.status(500).json({ error: "Erro interno ao criar template." });
    }
  }

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const templates = await service.findAll();
      res.json(templates);
    } catch (error) {
      console.error("Erro ao listar templates:", error);
      res.status(500).json({ error: "Erro interno ao listar templates." });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const template = await service.findById(id);

      if (!template) {
        res.status(404).json({ error: "Template não encontrado." });
        return;
      }

      res.json(template);
    } catch (error) {
      console.error("Erro ao buscar template:", error);
      res.status(500).json({ error: "Erro interno ao buscar template." });
    }
  }

  async update(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (name === undefined && description === undefined) {
        res.status(400).json({
          error: "É necessário fornecer pelo menos 'name' ou 'description'.",
        });
        return;
      }

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
          res.status(400).json({ error: "O campo 'name' não pode ser vazio." });
          return;
        }

        if (name.trim().length > 255) {
          res.status(400).json({
            error: "O campo 'name' não pode exceder 255 caracteres.",
          });
          return;
        }
      }

      const updated = await service.update(id, {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
      });

      if (!updated) {
        res.status(404).json({ error: "Template não encontrado." });
        return;
      }

      res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      res.status(500).json({ error: "Erro interno ao atualizar template." });
    }
  }
}
