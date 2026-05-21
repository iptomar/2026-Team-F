import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Workflow, WorkflowStateDefinition } from "../models/Workflow";

interface CreateWorkflowInput {
  name: string;
  description?: string;
  states?: WorkflowStateDefinition[];
}

interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  states?: WorkflowStateDefinition[];
  is_active?: boolean;
}

export class WorkflowService {
  private get repository(): Repository<Workflow> {
    return AppDataSource.getRepository(Workflow);
  }

  async create(data: CreateWorkflowInput): Promise<Workflow> {
    const workflow = this.repository.create({
      name: data.name,
      description: data.description,
      states: data.states ?? [],
      is_active: true,
    });

    return this.repository.save(workflow);
  }

  async findAll(): Promise<Workflow[]> {
    return this.repository.find({
      order: { created_at: "DESC" },
    });
  }

  async findById(id: string): Promise<Workflow | null> {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, data: UpdateWorkflowInput): Promise<Workflow | null> {
    const workflow = await this.repository.findOneBy({ id });

    if (!workflow) {
      return null;
    }

    if (data.name !== undefined) {
      workflow.name = data.name;
    }

    if (data.description !== undefined) {
      workflow.description = data.description;
    }

    if (data.states !== undefined) {
      workflow.states = data.states;
    }

    if (data.is_active !== undefined) {
      workflow.is_active = data.is_active;
    }

    return this.repository.save(workflow);
  }
}