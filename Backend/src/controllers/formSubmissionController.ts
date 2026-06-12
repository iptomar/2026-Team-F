import { Request, Response } from "express";
import {
  FormSubmissionData,
  FormSubmissionStatus,
} from "../models/FormSubmission";
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

function getTrimmedStringValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function validateFormTemplateId(
  formTemplateId: unknown
): { value?: string; error?: string } {
  const trimmedFormTemplateId = getTrimmedStringValue(formTemplateId);

  if (!trimmedFormTemplateId) {
    return {
      error: "O campo 'form_template_id' é obrigatório.",
    };
  }

  if (trimmedFormTemplateId.length > 36) {
    return {
      error: "O campo 'form_template_id' não pode exceder 36 caracteres.",
    };
  }

  return {
    value: trimmedFormTemplateId,
  };
}

function validateSubmittedBy(
  submittedBy: unknown
): { value?: string | null; error?: string } {
  if (submittedBy === undefined || submittedBy === null) {
    return {
      value: null,
    };
  }

  if (typeof submittedBy !== "string") {
    return {
      error: "O campo 'submitted_by' deve ser uma string ou null.",
    };
  }

  const trimmedSubmittedBy = submittedBy.trim();

  if (trimmedSubmittedBy.length === 0) {
    return {
      value: null,
    };
  }

  if (trimmedSubmittedBy.length > 255) {
    return {
      error: "O campo 'submitted_by' não pode exceder 255 caracteres.",
    };
  }

  return {
    value: trimmedSubmittedBy,
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSubmissionArrayValue(value: unknown[]): value is string[] {
  return value.every((item) => typeof item === "string");
}

function validateAndNormalizeSubmissionData(
  data: unknown
): { value?: FormSubmissionData; error?: string } {
  if (!isObjectRecord(data)) {
    return {
      error: "O campo 'data' deve ser um objeto com as respostas.",
    };
  }

  const normalizedData: FormSubmissionData = {};

  for (const [fieldId, fieldValue] of Object.entries(data)) {
    const trimmedFieldId = fieldId.trim();

    if (trimmedFieldId.length === 0) {
      return {
        error: "O campo 'data' contém um identificador de campo inválido.",
      };
    }

    if (fieldValue === undefined) {
      return {
        error: `A resposta do campo '${trimmedFieldId}' não pode ser undefined.`,
      };
    }

    if (fieldValue === null) {
      normalizedData[trimmedFieldId] = null;
      continue;
    }

    if (typeof fieldValue === "string") {
      normalizedData[trimmedFieldId] = fieldValue;
      continue;
    }

    if (typeof fieldValue === "boolean") {
      normalizedData[trimmedFieldId] = fieldValue;
      continue;
    }

    if (typeof fieldValue === "number") {
      if (!Number.isFinite(fieldValue)) {
        return {
          error: `A resposta do campo '${trimmedFieldId}' deve ser um número válido.`,
        };
      }

      normalizedData[trimmedFieldId] = fieldValue;
      continue;
    }

    if (Array.isArray(fieldValue)) {
      if (!isValidSubmissionArrayValue(fieldValue)) {
        return {
          error: `A resposta do campo '${trimmedFieldId}' deve ser uma lista de strings.`,
        };
      }

      normalizedData[trimmedFieldId] = fieldValue;
      continue;
    }

    return {
      error:
        `A resposta do campo '${trimmedFieldId}' deve ser string, number, boolean, lista de strings ou null.`,
    };
  }

  return {
    value: normalizedData,
  };
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

      const formTemplateIdResult = validateFormTemplateId(form_template_id);

      if (formTemplateIdResult.error || !formTemplateIdResult.value) {
        res.status(400).json({ error: formTemplateIdResult.error });
        return;
      }

      const dataResult = validateAndNormalizeSubmissionData(data);

      if (dataResult.error || !dataResult.value) {
        res.status(400).json({ error: dataResult.error });
        return;
      }

      const submittedByResult = validateSubmittedBy(submitted_by);

      if (submittedByResult.error) {
        res.status(400).json({ error: submittedByResult.error });
        return;
      }

      const submission = await service.create({
        form_template_id: formTemplateIdResult.value,
        data: dataResult.value,
        submitted_by: submittedByResult.value ?? null,
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