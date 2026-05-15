import { AppDataSource } from "../config/database";
import { FormTemplate, FormTemplateStatus } from "../models/FormTemplate";
import { Repository } from "typeorm";

interface CreateFormTemplateInput {
  name: string;
  description?: string;
  status?: FormTemplateStatus;
}

interface UpdateFormTemplateInput {
  name?: string;
  description?: string;
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

  async update(id: string, data: UpdateFormTemplateInput): Promise<FormTemplate | null> {
    const template = await this.repository.findOneBy({ id });

    if (!template) return null;

    if (data.name !== undefined) {
      template.name = data.name;
    }

    if (data.description !== undefined) {
      template.description = data.description;
    }

    return this.repository.save(template);
  }
}
