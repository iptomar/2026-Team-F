import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  FormSubmission,
  FormSubmissionData,
  FormSubmissionStatus,
} from "../models/FormSubmission";
import { FormTemplate } from "../models/FormTemplate";

interface CreateFormSubmissionInput {
  form_template_id: string;
  data: FormSubmissionData;
  submitted_by?: string | null;
}

interface FormFieldLike {
  id?: string;
  type?: string;
  label?: string;
  name?: string;
  fields?: FormFieldLike[];
  order?: number;
  required?: boolean;
}

interface ReadableSubmissionAnswer {
  field_id: string;
  label: string;
  type: string;
  section: string | null;
  value: unknown;
  required: boolean;
  order: number | null;
  has_answer: boolean;
}

interface FormSubmissionDetails {
  submission: FormSubmission;
  template: FormTemplate | null;
  answers: ReadableSubmissionAnswer[];
  metadata: {
    submission_id: string;
    form_template_id: string;
    form_template_name: string | null;
    status: string;
    submitted_by: string | null | undefined;
    submitted_at: Date;
  };
}

const STRUCTURAL_FIELD_TYPES = new Set<string>([
  "label",
  "section",
  "heading",
  "instruction",
  "divider",
  "text_block",
  "paragraph",
  "spacer",
]);

export class FormSubmissionService {
  private get submissionRepository(): Repository<FormSubmission> {
    return AppDataSource.getRepository(FormSubmission);
  }

  private get templateRepository(): Repository<FormTemplate> {
    return AppDataSource.getRepository(FormTemplate);
  }

  async create(data: CreateFormSubmissionInput): Promise<FormSubmission | null> {
    const template = await this.templateRepository.findOneBy({
      id: data.form_template_id,
    });

    if (!template) {
      return null;
    }

    const submission = this.submissionRepository.create({
      form_template_id: template.id,
      data: data.data,
      workflow_id: template.workflow_id ?? null,
      submitted_by: data.submitted_by ?? null,
      status: FormSubmissionStatus.SUBMITTED,
    });

    return this.submissionRepository.save(submission);
  }

  async findAll(): Promise<FormSubmission[]> {
    return this.submissionRepository.find({
      order: { submitted_at: "DESC" },
    });
  }

  async findById(id: string): Promise<FormSubmission | null> {
    return this.submissionRepository.findOneBy({ id });
  }

  async findByTemplateId(formTemplateId: string): Promise<FormSubmission[]> {
    return this.submissionRepository.find({
      where: { form_template_id: formTemplateId },
      order: { submitted_at: "DESC" },
    });
  }

  async findDetailsById(id: string): Promise<FormSubmissionDetails | null> {
    const submission = await this.findById(id);

    if (!submission) {
      return null;
    }

    const template = await this.templateRepository.findOneBy({
      id: submission.form_template_id,
    });

    const answers = template
      ? this.buildReadableAnswers(
          template.fields as unknown as FormFieldLike[],
          submission.data
        )
      : [];

    return {
      submission,
      template,
      answers,
      metadata: {
        submission_id: submission.id,
        form_template_id: submission.form_template_id,
        form_template_name: template?.name ?? null,
        status: submission.status,
        submitted_by: submission.submitted_by,
        submitted_at: submission.submitted_at,
      },
    };
  }

  private buildReadableAnswers(
    fields: FormFieldLike[] | undefined,
    data: FormSubmissionData
  ): ReadableSubmissionAnswer[] {
    if (!Array.isArray(fields)) {
      return [];
    }

    const answers: ReadableSubmissionAnswer[] = [];

    const walk = (fieldList: FormFieldLike[], sectionLabel: string | null) => {
      const orderedFields = [...fieldList].sort((a, b) => {
        const orderA = typeof a.order === "number" ? a.order : 0;
        const orderB = typeof b.order === "number" ? b.order : 0;

        return orderA - orderB;
      });

      for (const field of orderedFields) {
        const label = this.getFieldLabel(field);

        if (Array.isArray(field.fields)) {
          walk(field.fields, label || sectionLabel);
          continue;
        }

        if (!this.isAnswerableField(field)) {
          continue;
        }

        const fieldId = field.id as string;
        const value = data[fieldId];

        answers.push({
          field_id: fieldId,
          label: label || "Campo sem nome",
          type: field.type || "unknown",
          section: sectionLabel,
          value: value ?? null,
          required: Boolean(field.required),
          order: typeof field.order === "number" ? field.order : null,
          has_answer: this.hasAnswer(value),
        });
      }
    };

    walk(fields, null);

    return answers;
  }

  private getFieldLabel(field: FormFieldLike): string {
    if (typeof field.label === "string" && field.label.trim().length > 0) {
      return field.label.trim();
    }

    if (typeof field.name === "string" && field.name.trim().length > 0) {
      return field.name.trim();
    }

    return "";
  }

  private isAnswerableField(field: FormFieldLike): boolean {
    if (!field.id || typeof field.id !== "string") {
      return false;
    }

    if (!field.type || typeof field.type !== "string") {
      return false;
    }

    return !STRUCTURAL_FIELD_TYPES.has(field.type);
  }

  private hasAnswer(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  }
}