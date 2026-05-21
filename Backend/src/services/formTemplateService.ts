import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  FormTemplate,
  FormTemplateStatus,
  FormFieldDefinition,
} from "../models/FormTemplate";

interface CreateFormTemplateInput {
  name: string;
  description?: string;
  status?: FormTemplateStatus;
  fields?: FormFieldDefinition[];
  workflow_id?: string | null;
  created_by?: string;
}

interface UpdateFormTemplateInput {
  name?: string;
  description?: string;
  status?: FormTemplateStatus;
  fields?: FormFieldDefinition[];
  workflow_id?: string | null;
  is_active?: boolean;
}

export class FormTemplateService {
  private get repository(): Repository<FormTemplate> {
    return AppDataSource.getRepository(FormTemplate);
  }

  async create(data: CreateFormTemplateInput): Promise<FormTemplate> {
    const template = this.repository.create({
      name: data.name,
      description: data.description,
      status: data.status ?? FormTemplateStatus.DRAFT,
      fields: data.fields ?? [],
      workflow_id: data.workflow_id ?? null,
      created_by: data.created_by,
    });

    return this.repository.save(template);
  }

  async findAll(): Promise<FormTemplate[]> {
    return this.repository.find({
      order: { created_at: "DESC" },
    });
  }

  async findById(id: string): Promise<FormTemplate | null> {
    return this.repository.findOneBy({ id });
  }

  async update(
    id: string,
    data: UpdateFormTemplateInput
  ): Promise<FormTemplate | null> {
    const template = await this.repository.findOneBy({ id });

    if (!template) {
      return null;
    }

    if (data.name !== undefined) {
      template.name = data.name;
    }

    if (data.description !== undefined) {
      template.description = data.description;
    }

    if (data.status !== undefined) {
      template.status = data.status;
    }

    if (data.fields !== undefined) {
      template.fields = data.fields;
    }

    if (data.workflow_id !== undefined) {
      template.workflow_id = data.workflow_id;
    }

    if (data.is_active !== undefined) {
      template.is_active = data.is_active;
    }

    return this.repository.save(template);
  }

  async associateWorkflow(
    id: string,
    workflowId: string | null
  ): Promise<FormTemplate | null> {
    const template = await this.repository.findOneBy({ id });

    if (!template) {
      return null;
    }

    template.workflow_id = workflowId;
    return this.repository.save(template);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === "number" && result.affected > 0;
  }
}