import { Request, Response } from "express";
import { WorkflowService } from "../services/workflowService";
import { WorkflowStateDefinition } from "../models/Workflow";

const service = new WorkflowService();

function validateWorkflowName(name: unknown): string | null {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "O campo 'name' é obrigatório.";
  }

  if (name.trim().length > 255) {
    return "O campo 'name' não pode exceder 255 caracteres.";
  }

  return null;
}

function validateStates(states: unknown): string | null {
  if (states === undefined) {
    return null;
  }

  if (!Array.isArray(states)) {
    return "O campo 'states' deve ser uma lista.";
  }

  for (const state of states as WorkflowStateDefinition[]) {
    if (!state.id || typeof state.id !== "string") {
      return "Cada estado deve ter um 'id' válido.";
    }

    if (!state.name || typeof state.name !== "string") {
      return "Cada estado deve ter um 'name' válido.";
    }

    if (typeof state.order !== "number") {
      return "Cada estado deve ter uma propriedade 'order' numérica.";
    }
  }

  return null;
}

export class WorkflowController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, states } = req.body;

      const nameError = validateWorkflowName(name);
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }

      const statesError = validateStates(states);
      if (statesError) {
        res.status(400).json({ error: statesError });
        return;
      }

      const workflow = await service.create({
        name: name.trim(),
        description: description ?? undefined,
        states: states ?? [],
      });

      res.status(201).json(workflow);
    } catch (error) {
      console.error("Erro ao criar workflow:", error);
      res.status(500).json({ error: "Erro interno ao criar workflow." });
    }
  }

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const workflows = await service.findAll();
      res.json(workflows);
    } catch (error) {
      console.error("Erro ao listar workflows:", error);
      res.status(500).json({ error: "Erro interno ao listar workflows." });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const workflow = await service.findById(id);

      if (!workflow) {
        res.status(404).json({ error: "Workflow não encontrado." });
        return;
      }

      res.json(workflow);
    } catch (error) {
      console.error("Erro ao consultar workflow:", error);
      res.status(500).json({ error: "Erro interno ao consultar workflow." });
    }
  }

  async update(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, states, is_active } = req.body;

      if (
        name === undefined &&
        description === undefined &&
        states === undefined &&
        is_active === undefined
      ) {
        res.status(400).json({
          error: "É necessário fornecer pelo menos um campo para atualização.",
        });
        return;
      }

      if (name !== undefined) {
        const nameError = validateWorkflowName(name);
        if (nameError) {
          res.status(400).json({ error: nameError });
          return;
        }
      }

      const statesError = validateStates(states);
      if (statesError) {
        res.status(400).json({ error: statesError });
        return;
      }

      const workflow = await service.update(id, {
        name: name !== undefined ? name.trim() : undefined,
        description,
        states,
        is_active,
      });

      if (!workflow) {
        res.status(404).json({ error: "Workflow não encontrado." });
        return;
      }

      res.json(workflow);
    } catch (error) {
      console.error("Erro ao atualizar workflow:", error);
      res.status(500).json({ error: "Erro interno ao atualizar workflow." });
    }
  }
}