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
}