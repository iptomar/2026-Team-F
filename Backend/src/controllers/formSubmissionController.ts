import { Request, Response } from "express";
import { FormSubmissionStatus } from "../models/FormSubmission";
import {
  FormSubmissionService,
  INVALID_STATUS_TRANSITION_ERROR,
} from "../services/formSubmissionService";

const service = new FormSubmissionService();

const allowedSubmissionStatuses = Object.values(FormSubmissionStatus);

function validateSubmissionStatus(status: unknown): string | null {
  if (!status || typeof status !== "string") {
    return "O campo 'status' é obrigatório.";
  }

  if (!allowedSubmissionStatuses.includes(status as FormSubmissionStatus)) {
    return "Status inválido. Use: submitted, in_progress, completed ou rejected.";
  }

  return null;
}

function validateChangedBy(changedBy: unknown): string | null {
  if (
    changedBy !== undefined &&
    changedBy !== null &&
    typeof changedBy !== "string"
  ) {
    return "O campo 'changed_by' deve ser uma string ou null.";
  }

  return null;
}

export class FormSubmissionController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { form_template_id, data, submitted_by } = req.body;

      if (!form_template_id || typeof form_template_id !== "string") {
        res.status(400).json({
          error: "O campo 'form_template_id' é obrigatório.",
        });
        return;
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        res.status(400).json({
          error: "O campo 'data' deve ser um objeto com as respostas.",
        });
        return;
      }

      const submission = await service.create({
        form_template_id,
        data,
        submitted_by: submitted_by ?? null,
      });

      if (!submission) {
        res.status(404).json({
          error: "Template de formulário não encontrado.",
        });
        return;
      }

      res.status(201).json(submission);
    } catch (error) {
      console.error("Erro ao criar submissão:", error);
      res.status(500).json({ error: "Erro interno ao criar submissão." });
    }
  }

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const submissions = await service.findAll();
      res.json(submissions);
    } catch (error) {
      console.error("Erro ao listar submissões:", error);
      res.status(500).json({ error: "Erro interno ao listar submissões." });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await service.findById(id);

      if (!submission) {
        res.status(404).json({ error: "Submissão não encontrada." });
        return;
      }

      res.json(submission);
    } catch (error) {
      console.error("Erro ao consultar submissão:", error);
      res.status(500).json({ error: "Erro interno ao consultar submissão." });
    }
  }

  async findDetailsById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const details = await service.findDetailsById(id);

      if (!details) {
        res.status(404).json({ error: "Submissão não encontrada." });
        return;
      }

      res.json(details);
    } catch (error) {
      console.error("Erro ao consultar detalhe da submissão:", error);
      res.status(500).json({
        error: "Erro interno ao consultar detalhe da submissão.",
      });
    }
  }

  async findByTemplateId(
    req: Request<{ formTemplateId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { formTemplateId } = req.params;

      const submissions = await service.findByTemplateId(formTemplateId);
      res.json(submissions);
    } catch (error) {
      console.error("Erro ao listar submissões por template:", error);
      res.status(500).json({
        error: "Erro interno ao listar submissões por template.",
      });
    }
  }

  async updateStatus(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, changed_by } = req.body;

      const statusError = validateSubmissionStatus(status);

      if (statusError) {
        res.status(400).json({ error: statusError });
        return;
      }

      const changedByError = validateChangedBy(changed_by);

      if (changedByError) {
        res.status(400).json({ error: changedByError });
        return;
      }

      const updatedSubmission = await service.updateStatus(id, {
        status: status as FormSubmissionStatus,
        changed_by: changed_by ?? null,
      });

      if (!updatedSubmission) {
        res.status(404).json({ error: "Submissão não encontrada." });
        return;
      }

      res.json({
        message: "Estado da submissão atualizado com sucesso.",
        submission: updatedSubmission,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === INVALID_STATUS_TRANSITION_ERROR
      ) {
        res.status(400).json({
          error: "Transição de estado inválida para esta submissão.",
        });
        return;
      }

      console.error("Erro ao atualizar estado da submissão:", error);
      res.status(500).json({
        error: "Erro interno ao atualizar estado da submissão.",
      });
    }
  }
}