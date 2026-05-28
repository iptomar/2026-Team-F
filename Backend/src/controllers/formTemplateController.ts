import { Request, Response } from "express";
import { FormTemplateService } from "../services/formTemplateService";
import {
  FormFieldDefinition,
  FormFieldType,
  FormTemplateStatus,
} from "../models/FormTemplate";

const service = new FormTemplateService();

const allowedStatuses = Object.values(FormTemplateStatus);
const allowedFieldTypes: FormFieldType[] = [
  "label",
  "radio",
  "checkbox",
  "dropdown",
];

function validateName(name: unknown): string | null {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "O campo 'name' é obrigatório.";
  }

  if (name.trim().length > 255) {
    return "O campo 'name' não pode exceder 255 caracteres.";
  }

  return null;
}

function validateStatus(status: unknown): string | null {
  if (status === undefined) {
    return null;
  }

  if (typeof status !== "string" || !allowedStatuses.includes(status as FormTemplateStatus)) {
    return "Status deve ser 'draft' ou 'published'.";
  }

  return null;
}

function validateFields(fields: unknown): string | null {
  if (fields === undefined) {
    return null;
  }

  if (!Array.isArray(fields)) {
    return "O campo 'fields' deve ser uma lista.";
  }

  for (const field of fields as FormFieldDefinition[]) {
    if (!field.id || typeof field.id !== "string") {
      return "Cada campo deve ter um 'id' válido.";
    }

    if (!field.type || !allowedFieldTypes.includes(field.type)) {
      return "Cada campo deve ter um 'type' válido: label, radio, checkbox ou dropdown.";
    }

    if (!field.label || typeof field.label !== "string") {
      return "Cada campo deve ter uma 'label' válida.";
    }

    if (typeof field.order !== "number") {
      return "Cada campo deve ter uma propriedade 'order' numérica.";
    }

    if (
      (field.type === "radio" || field.type === "dropdown") &&
      field.options !== undefined &&
      !Array.isArray(field.options)
    ) {
      return "Campos do tipo radio ou dropdown devem ter 'options' como lista.";
    }
  }

  return null;
}

export class FormTemplateController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        status,
        fields,
        workflow_id,
        created_by,
      } = req.body;

      const nameError = validateName(name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }

      const statusError = validateStatus(status);
      if (statusError) {
        res.status(400).json({ error: statusError });
        return;
      }

      const fieldsError = validateFields(fields);
      if (fieldsError) {
        res.status(400).json({ error: fieldsError });
        return;
      }

      const template = await service.create({
        name: name.trim(),
        description: description ?? undefined,
        status,
        fields: fields ?? [],
        workflow_id: workflow_id ?? null,
        created_by: created_by ?? undefined,
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
      const {
        name,
        description,
        status,
        fields,
        workflow_id,
        is_active,
      } = req.body;

      if (
        name === undefined &&
        description === undefined &&
        status === undefined &&
        fields === undefined &&
        workflow_id === undefined &&
        is_active === undefined
      ) {
        res.status(400).json({
          error:
            "É necessário fornecer pelo menos um campo para atualização.",
        });
        return;
      }

      if (name !== undefined) {
        const nameError = validateName(name);
        if (nameError) {
          res.status(400).json({ error: nameError });
          return;
        }
      }

      const statusError = validateStatus(status);
      if (statusError) {
        res.status(400).json({ error: statusError });
        return;
      }

      const fieldsError = validateFields(fields);
      if (fieldsError) {
        res.status(400).json({ error: fieldsError });
        return;
      }

      const updated = await service.update(id, {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        status,
        fields,
        workflow_id,
        is_active,
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

  async associateWorkflow(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { workflow_id } = req.body;

      if (workflow_id !== null && typeof workflow_id !== "string") {
        res.status(400).json({
          error: "O campo 'workflow_id' deve ser string ou null.",
        });
        return;
      }

      const updated = await service.associateWorkflow(id, workflow_id);

      if (!updated) {
        res.status(404).json({ error: "Template não encontrado." });
        return;
      }

      res.json(updated);
    } catch (error) {
      console.error("Erro ao associar workflow:", error);
      res.status(500).json({ error: "Erro interno ao associar workflow." });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await service.delete(id);

      if (!deleted) {
        res.status(404).json({ error: "Template não encontrado." });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao remover template:", error);
      res.status(500).json({ error: "Erro interno ao remover template." });
    }
  }
}