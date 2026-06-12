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

function validateOptionalDescription(description: unknown): string | null {
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return "O campo 'description' deve ser uma string ou null.";
  }

  return null;
}

function validateOptionalBoolean(
  value: unknown,
  propertyName: string
): string | null {
  if (value !== undefined && typeof value !== "boolean") {
    return `O campo '${propertyName}' deve ser booleano.`;
  }

  return null;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateStates(
  states: unknown
): { states?: WorkflowStateDefinition[]; error?: string } {
  if (states === undefined) {
    return {};
  }

  if (!Array.isArray(states)) {
    return {
      error: "O campo 'states' deve ser uma lista.",
    };
  }

  const normalizedStates: WorkflowStateDefinition[] = [];
  const usedIds = new Set<string>();
  const usedOrders = new Set<number>();

  let initialStateCount = 0;

  for (let index = 0; index < states.length; index += 1) {
    const state = states[index];
    const currentPath = `states[${index}]`;

    if (!isObjectRecord(state)) {
      return {
        error: `O estado ${currentPath} deve ser um objeto.`,
      };
    }

    const id = state.id;
    const name = state.name;
    const order = state.order;
    const isInitial = state.is_initial;
    const isFinal = state.is_final;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return {
        error: `O estado ${currentPath} deve ter um 'id' válido.`,
      };
    }

    const trimmedId = id.trim();

    if (usedIds.has(trimmedId)) {
      return {
        error: `O estado ${currentPath} tem um 'id' duplicado.`,
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedId)) {
      return {
        error:
          `O estado ${currentPath} deve ter um 'id' apenas com letras, números, hífen ou underscore.`,
      };
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        error: `O estado ${currentPath} deve ter um 'name' válido.`,
      };
    }

    if (name.trim().length > 255) {
      return {
        error: `O estado ${currentPath} não pode ter um 'name' com mais de 255 caracteres.`,
      };
    }

    if (
      typeof order !== "number" ||
      !Number.isFinite(order) ||
      !Number.isInteger(order) ||
      order < 1
    ) {
      return {
        error: `O estado ${currentPath} deve ter uma propriedade 'order' numérica inteira e superior a zero.`,
      };
    }

    if (usedOrders.has(order)) {
      return {
        error: `O estado ${currentPath} tem uma propriedade 'order' duplicada.`,
      };
    }

    const initialError = validateOptionalBoolean(isInitial, "is_initial");
    if (initialError) {
      return {
        error: `${currentPath}: ${initialError}`,
      };
    }

    const finalError = validateOptionalBoolean(isFinal, "is_final");
    if (finalError) {
      return {
        error: `${currentPath}: ${finalError}`,
      };
    }

    if (isInitial === true) {
      initialStateCount += 1;
    }

    if (initialStateCount > 1) {
      return {
        error: "O workflow só pode ter um estado inicial.",
      };
    }

    usedIds.add(trimmedId);
    usedOrders.add(order);

    normalizedStates.push({
      id: trimmedId,
      name: name.trim(),
      order,
      is_initial: isInitial === true,
      is_final: isFinal === true,
    });
  }

  normalizedStates.sort((a, b) => a.order - b.order);

  return {
    states: normalizedStates,
  };
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

      const descriptionError = validateOptionalDescription(description);
      if (descriptionError) {
        res.status(400).json({ error: descriptionError });
        return;
      }

      const statesResult = validateStates(states);
      if (statesResult.error) {
        res.status(400).json({ error: statesResult.error });
        return;
      }

      const workflow = await service.create({
        name: name.trim(),
        description: description ?? undefined,
        states: statesResult.states ?? [],
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

      const descriptionError = validateOptionalDescription(description);
      if (descriptionError) {
        res.status(400).json({ error: descriptionError });
        return;
      }

      const activeError = validateOptionalBoolean(is_active, "is_active");
      if (activeError) {
        res.status(400).json({ error: activeError });
        return;
      }

      const statesResult = validateStates(states);
      if (statesResult.error) {
        res.status(400).json({ error: statesResult.error });
        return;
      }

      const workflow = await service.update(id, {
        name: name !== undefined ? name.trim() : undefined,
        description,
        states: states !== undefined ? statesResult.states : undefined,
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