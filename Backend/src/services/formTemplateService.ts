import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  FormTemplate,
  FormTemplateStatus,
  FormFieldDefinition,
} from "../models/FormTemplate";
import { Workflow } from "../models/Workflow";

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

export const INVALID_WORKFLOW_ASSOCIATION_ERROR =
  "INVALID_WORKFLOW_ASSOCIATION";

export class FormTemplateService {
  private get repository(): Repository<FormTemplate> {
    return AppDataSource.getRepository(FormTemplate);
  }

  private get workflowRepository(): Repository<Workflow> {
    return AppDataSource.getRepository(Workflow);
  }

  // ---------------------------------------------------------------------------
  // Retrocompatibilidade — Grelha Visual Absoluta
  // ---------------------------------------------------------------------------

  /**
   * Garante que todos os campos possuem as propriedades de posicionamento
   * da grelha visual (page, x, y, width).
   *
   * Campos criados antes da introdução da grelha não contêm estas propriedades.
   * Esta função atribui-lhes valores padrão de forma não destrutiva:
   *   - page  → 1 (primeira página)
   *   - x     → 0 (alinhado à margem esquerda)
   *   - y     → index * 150 (empilhamento vertical automático)
   *   - width → 100 (largura total da grelha, em percentagem ou unidades)
   *
   * A função é aplicada:
   *   1. Em `findById`  — antes de devolver os dados ao cliente.
   *   2. Em `create`    — antes de persistir na base de dados.
   *   3. Em `update`    — antes de persistir na base de dados.
   *
   * @param fields Array de campos do formulário (pode conter `any` vindo de JSON legado).
   * @returns Novo array com as propriedades de grelha garantidas.
   */
  private applyRetrocompatibility(fields: any[]): FormFieldDefinition[] {
    return fields.map((field, index) => {
      const hasGridProperties =
        field.x !== undefined ||
        field.y !== undefined ||
        field.width !== undefined ||
        field.page !== undefined;

      if (hasGridProperties) {
        // O campo já tem pelo menos uma propriedade de grelha — respeitar os
        // valores existentes e completar apenas os que estiverem em falta.
        return {
          ...field,
          page: field.page ?? 1,
          x: field.x ?? 0,
          y: field.y ?? index * 150,
          width: field.width ?? 100,
        } as FormFieldDefinition;
      }

      // Campo legado — aplicar todos os valores padrão.
      return {
        ...field,
        page: 1,
        x: 0,
        y: index * 150,
        width: 100,
      } as FormFieldDefinition;
    });
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  async create(data: CreateFormTemplateInput): Promise<FormTemplate> {
    await this.ensureWorkflowCanBeAssociated(data.workflow_id);

    // Aplica retrocompatibilidade antes de persistir.
    const fields = this.applyRetrocompatibility(data.fields ?? []);

    const template = this.repository.create({
      name: data.name,
      description: data.description,
      status: data.status ?? FormTemplateStatus.DRAFT,
      fields,
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
    const template = await this.repository.findOneBy({ id });

    if (!template) {
      return null;
    }

    // Aplica retrocompatibilidade antes de devolver ao cliente.
    template.fields = this.applyRetrocompatibility(template.fields);

    return template;
  }

  async update(
    id: string,
    data: UpdateFormTemplateInput
  ): Promise<FormTemplate | null> {
    const template = await this.repository.findOneBy({ id });

    if (!template) {
      return null;
    }

    if (data.workflow_id !== undefined) {
      await this.ensureWorkflowCanBeAssociated(data.workflow_id);
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
      // Aplica retrocompatibilidade antes de persistir.
      template.fields = this.applyRetrocompatibility(data.fields);
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

    await this.ensureWorkflowCanBeAssociated(workflowId);

    template.workflow_id = workflowId;
    return this.repository.save(template);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return typeof result.affected === "number" && result.affected > 0;
  }

  private async ensureWorkflowCanBeAssociated(
    workflowId?: string | null
  ): Promise<void> {
    if (workflowId === undefined || workflowId === null) {
      return;
    }

    const workflow = await this.workflowRepository.findOneBy({
      id: workflowId,
      is_active: true,
    });

    if (!workflow) {
      throw new Error(INVALID_WORKFLOW_ASSOCIATION_ERROR);
    }
  }
}