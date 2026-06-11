import { Request, Response } from "express";
import { FormSubmissionStatus } from "../models/FormSubmission";
import {
  FindSubmissionsFilters,
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

function getQueryStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (Array.isArray(value)) {
    const firstStringValue = value.find(
      (item): item is string => typeof item === "string"
    );

    if (!firstStringValue) {
      return undefined;
    }

    const trimmedValue = firstStringValue.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  return undefined;
}

function parseDateFilter(
  value: string | undefined,
  fieldName: string,
  useEndOfDay = false
): { date?: Date; error?: string } {
  if (!value) {
    return {};
  }

  const isSimpleDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsedDate = isSimpleDate
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      error: `O parâmetro '${fieldName}' deve ser uma data válida.`,
    };
  }

  if (isSimpleDate && useEndOfDay) {
    parsedDate.setUTCHours(23, 59, 59, 999);
  }

  return { date: parsedDate };
}

function buildFindSubmissionsFilters(
  req: Request
): { filters?: FindSubmissionsFilters; error?: string } {
  const formTemplateId = getQueryStringValue(req.query.form_template_id);
  const status = getQueryStringValue(req.query.status);

  const submittedFromValue =
    getQueryStringValue(req.query.submitted_from) ||
    getQueryStringValue(req.query.date_from);

  const submittedToValue =
    getQueryStringValue(req.query.submitted_to) ||
    getQueryStringValue(req.query.date_to);

  if (
    status !== undefined &&
    !allowedSubmissionStatuses.includes(status as FormSubmissionStatus)
  ) {
    return {
      error: "Status inválido. Use: submitted, in_progress, completed ou rejected.",
    };
  }

  const submittedFromResult = parseDateFilter(
    submittedFromValue,
    submittedFromValue ? "submitted_from/date_from" : "submitted_from"
  );

  if (submittedFromResult.error) {
    return { error: submittedFromResult.error };
  }

  const submittedToResult = parseDateFilter(
    submittedToValue,
    submittedToValue ? "submitted_to/date_to" : "submitted_to",
    true
  );

  if (submittedToResult.error) {
    return { error: submittedToResult.error };
  }

  if (
    submittedFromResult.date &&
    submittedToResult.date &&
    submittedFromResult.date > submittedToResult.date
  ) {
    return {
      error: "A data inicial não pode ser superior à data final.",
    };
  }

  return {
    filters: {
      form_template_id: formTemplateId,
      status: status as FormSubmissionStatus | undefined,
      submitted_from: submittedFromResult.date,
      submitted_to: submittedToResult.date,
    },
  };
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

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { filters, error } = buildFindSubmissionsFilters(req);

      if (error) {
        res.status(400).json({ error });
        return;
      }

      const submissions = await service.findAll(filters);
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

  async findHistoryBySubmissionId(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await service.findById(id);

      if (!submission) {
        res.status(404).json({ error: "Submissão não encontrada." });
        return;
      }

      const history = await service.findHistoryBySubmissionId(id);

      res.json(history);
    } catch (error) {
      console.error("Erro ao consultar histórico da submissão:", error);
      res.status(500).json({
        error: "Erro interno ao consultar histórico da submissão.",
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