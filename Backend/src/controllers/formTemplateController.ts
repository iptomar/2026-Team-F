import { Request, Response } from "express";
import {
  FormTemplateService,
  INVALID_WORKFLOW_ASSOCIATION_ERROR,
} from "../services/formTemplateService";
import {
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
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "section",
  "heading",
  "instruction",
  "divider",
  "text_block",
  "paragraph",
  "spacer",
];

const fieldTypesWithOptions: FormFieldType[] = ["radio", "dropdown", "checkbox"];

const fieldTypesWithRangeValidation: FormFieldType[] = ["number", "date"];

const fieldTypesWithTextValidation: FormFieldType[] = [
  "text",
  "textarea",
  "email",
];

const allowedFieldTypesMessage = allowedFieldTypes.join(", ");

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

  if (
    typeof status !== "string" ||
    !allowedStatuses.includes(status as FormTemplateStatus)
  ) {
    return "Status deve ser 'draft' ou 'published'.";
  }

  return null;
}

function parseWorkflowId(
  workflowId: unknown,
  allowUndefined = true
): { workflowId?: string | null; error?: string } {
  if (workflowId === undefined) {
    if (allowUndefined) {
      return { workflowId: undefined };
    }

    return {
      error: "O campo 'workflow_id' é obrigatório.",
    };
  }

  if (workflowId === null) {
    return { workflowId: null };
  }

  if (typeof workflowId !== "string") {
    return {
      error: "O campo 'workflow_id' deve ser string ou null.",
    };
  }

  const trimmedWorkflowId = workflowId.trim();

  if (trimmedWorkflowId.length === 0) {
    return {
      error: "O campo 'workflow_id' não pode ser vazio.",
    };
  }

  return { workflowId: trimmedWorkflowId };
}

function isInvalidWorkflowAssociationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === INVALID_WORKFLOW_ASSOCIATION_ERROR
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((option) => typeof option === "string");
}

function validateStringArray(value: unknown, propertyName: string): string | null {
  if (!Array.isArray(value)) {
    return `A propriedade '${propertyName}' deve ser uma lista.`;
  }

  if (!isStringArray(value)) {
    return `Todos os valores de '${propertyName}' devem ser strings.`;
  }

  return null;
}

function validateOptionalString(
  value: unknown,
  propertyName: string
): string | null {
  if (value !== undefined && value !== null && typeof value !== "string") {
    return `A propriedade '${propertyName}' deve ser uma string.`;
  }

  return null;
}

function validateOptionalBoolean(
  value: unknown,
  propertyName: string
): string | null {
  if (value !== undefined && typeof value !== "boolean") {
    return `A propriedade '${propertyName}' deve ser booleana.`;
  }

  return null;
}

function validateDefaultValue(value: unknown): string | null {
  if (
    value !== undefined &&
    value !== null &&
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean" &&
    !isStringArray(value)
  ) {
    return "A propriedade 'defaultValue' deve ser string, number, boolean, lista de strings ou null.";
  }

  return null;
}

function isValidDateString(value: string): boolean {
  if (value.trim().length === 0) {
    return false;
  }

  const parsedDate = new Date(value);

  return !Number.isNaN(parsedDate.getTime());
}

function validateOptionalNonNegativeInteger(
  value: unknown,
  propertyName: string
): string | null {
  if (value === undefined) {
    return null;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return `A propriedade '${propertyName}' deve ser um número inteiro maior ou igual a zero.`;
  }

  return null;
}

function validatePattern(value: unknown): string | null {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return "A propriedade 'pattern' deve ser uma string não vazia.";
  }

  try {
    new RegExp(value);
  } catch {
    return "A propriedade 'pattern' deve conter uma expressão regular válida.";
  }

  return null;
}

function validateMinMaxValue(
  value: unknown,
  propertyName: string,
  fieldType: FormFieldType
): string | null {
  if (value === undefined) {
    return null;
  }

  if (fieldType === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return `A propriedade '${propertyName}' deve ser numérica em campos do tipo number.`;
    }

    return null;
  }

  if (fieldType === "date") {
    if (typeof value !== "string" || !isValidDateString(value)) {
      return `A propriedade '${propertyName}' deve ser uma data válida em campos do tipo date.`;
    }

    return null;
  }

  return `A propriedade '${propertyName}' só deve ser usada em campos do tipo number ou date.`;
}

function validateValidationRules(
  field: Record<string, unknown>,
  fieldType: FormFieldType,
  currentPath: string
): string | null {
  const min = field.min;
  const max = field.max;
  const minLength = field.minLength;
  const maxLength = field.maxLength;
  const pattern = field.pattern;

  const hasRangeValidation = min !== undefined || max !== undefined;

  if (
    hasRangeValidation &&
    !fieldTypesWithRangeValidation.includes(fieldType)
  ) {
    return `${currentPath}: As propriedades 'min' e 'max' só devem ser usadas em campos do tipo number ou date.`;
  }

  const minError = validateMinMaxValue(min, "min", fieldType);
  if (minError) {
    return `${currentPath}: ${minError}`;
  }

  const maxError = validateMinMaxValue(max, "max", fieldType);
  if (maxError) {
    return `${currentPath}: ${maxError}`;
  }

  if (
    fieldType === "number" &&
    typeof min === "number" &&
    typeof max === "number" &&
    min > max
  ) {
    return `${currentPath}: A propriedade 'min' não pode ser superior à propriedade 'max'.`;
  }

  if (
    fieldType === "date" &&
    typeof min === "string" &&
    typeof max === "string" &&
    new Date(min) > new Date(max)
  ) {
    return `${currentPath}: A data em 'min' não pode ser posterior à data em 'max'.`;
  }

  const hasTextValidation =
    minLength !== undefined ||
    maxLength !== undefined ||
    pattern !== undefined;

  if (
    hasTextValidation &&
    !fieldTypesWithTextValidation.includes(fieldType)
  ) {
    return `${currentPath}: As propriedades 'minLength', 'maxLength' e 'pattern' só devem ser usadas em campos do tipo text, textarea ou email.`;
  }

  const minLengthError = validateOptionalNonNegativeInteger(
    minLength,
    "minLength"
  );

  if (minLengthError) {
    return `${currentPath}: ${minLengthError}`;
  }

  const maxLengthError = validateOptionalNonNegativeInteger(
    maxLength,
    "maxLength"
  );

  if (maxLengthError) {
    return `${currentPath}: ${maxLengthError}`;
  }

  if (
    typeof minLength === "number" &&
    typeof maxLength === "number" &&
    minLength > maxLength
  ) {
    return `${currentPath}: A propriedade 'minLength' não pode ser superior à propriedade 'maxLength'.`;
  }

  const patternError = validatePattern(pattern);

  if (patternError) {
    return `${currentPath}: ${patternError}`;
  }

  return null;
}

function validateField(
  field: unknown,
  index: number,
  parentPath = "fields"
): string | null {
  const currentPath = `${parentPath}[${index}]`;

  if (!isObjectRecord(field)) {
    return `O campo ${currentPath} deve ser um objeto.`;
  }

  const id = field.id;
  const type = field.type;
  const label = field.label;
  const order = field.order;
  const required = field.required;
  const options = field.options;
  const description = field.description;
  const placeholder = field.placeholder;
  const helpText = field.helpText;
  const defaultValue = field.defaultValue;
  const fields = field.fields;

  if (!id || typeof id !== "string") {
    return `O campo ${currentPath} deve ter um 'id' válido.`;
  }

  if (
    !type ||
    typeof type !== "string" ||
    !allowedFieldTypes.includes(type as FormFieldType)
  ) {
    return `O campo ${currentPath} deve ter um 'type' válido: ${allowedFieldTypesMessage}.`;
  }

  if (!label || typeof label !== "string" || label.trim().length === 0) {
    return `O campo ${currentPath} deve ter uma 'label' válida.`;
  }

  if (typeof order !== "number") {
    return `O campo ${currentPath} deve ter uma propriedade 'order' numérica.`;
  }

  const requiredError = validateOptionalBoolean(required, "required");
  if (requiredError) {
    return `${currentPath}: ${requiredError}`;
  }

  const descriptionError = validateOptionalString(description, "description");
  if (descriptionError) {
    return `${currentPath}: ${descriptionError}`;
  }

  const placeholderError = validateOptionalString(placeholder, "placeholder");
  if (placeholderError) {
    return `${currentPath}: ${placeholderError}`;
  }

  const helpTextError = validateOptionalString(helpText, "helpText");
  if (helpTextError) {
    return `${currentPath}: ${helpTextError}`;
  }

  const defaultValueError = validateDefaultValue(defaultValue);
  if (defaultValueError) {
    return `${currentPath}: ${defaultValueError}`;
  }

    const validationRulesError = validateValidationRules(
    field,
    type as FormFieldType,
    currentPath
  );

  if (validationRulesError) {
    return validationRulesError;
  }

  if (options !== undefined) {
    const optionsError = validateStringArray(options, "options");

    if (optionsError) {
      return `${currentPath}: ${optionsError}`;
    }

    if (
      isStringArray(options) &&
      !fieldTypesWithOptions.includes(type as FormFieldType) &&
      options.length > 0
    ) {
      return `${currentPath}: A propriedade 'options' só deve ter valores em campos do tipo radio ou dropdown.`;
    }
  }

  if (fields !== undefined) {
    if (!Array.isArray(fields)) {
      return `A propriedade 'fields' de ${currentPath} deve ser uma lista.`;
    }

    for (let childIndex = 0; childIndex < fields.length; childIndex += 1) {
      const childError = validateField(
        fields[childIndex],
        childIndex,
        `${currentPath}.fields`
      );

      if (childError) {
        return childError;
      }
    }
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

  for (let index = 0; index < fields.length; index += 1) {
    const fieldError = validateField(fields[index], index);

    if (fieldError) {
      return fieldError;
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

      const workflowIdResult = parseWorkflowId(workflow_id);
      if (workflowIdResult.error) {
        res.status(400).json({ error: workflowIdResult.error });
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
        workflow_id: workflowIdResult.workflowId ?? null,
        created_by: created_by ?? undefined,
      });

      res.status(201).json(template);
    } catch (error) {
      if (isInvalidWorkflowAssociationError(error)) {
        res.status(400).json({
          error: "Workflow indicado não existe ou está inativo.",
        });
        return;
      }

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

      const workflowIdResult = parseWorkflowId(workflow_id);
      if (workflowIdResult.error) {
        res.status(400).json({ error: workflowIdResult.error });
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
        workflow_id:
          workflow_id !== undefined ? workflowIdResult.workflowId : undefined,
        is_active,
      });

      if (!updated) {
        res.status(404).json({ error: "Template não encontrado." });
        return;
      }

      res.json(updated);
    } catch (error) {
      if (isInvalidWorkflowAssociationError(error)) {
        res.status(400).json({
          error: "Workflow indicado não existe ou está inativo.",
        });
        return;
      }

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

      const workflowIdResult = parseWorkflowId(workflow_id, false);
      if (workflowIdResult.error) {
        res.status(400).json({ error: workflowIdResult.error });
        return;
      }

      const updated = await service.associateWorkflow(
        id,
        workflowIdResult.workflowId ?? null
      );

      if (!updated) {
        res.status(404).json({ error: "Template não encontrado." });
        return;
      }

      res.json(updated);
    } catch (error) {
      if (isInvalidWorkflowAssociationError(error)) {
        res.status(400).json({
          error: "Workflow indicado não existe ou está inativo.",
        });
        return;
      }

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