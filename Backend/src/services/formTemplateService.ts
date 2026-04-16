import { AppDataSource } from "../config/database";
import { FormTemplate, FormTemplateStatus } from "../models/FormTemplate";
import { Repository } from "typeorm";

interface CreateFormTemplateInput {
  name: string;
  description?: string;
  status?: FormTemplateStatus;
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
}
