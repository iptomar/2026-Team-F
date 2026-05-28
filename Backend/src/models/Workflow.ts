import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export interface WorkflowStateDefinition {
  id: string;
  name: string;
  order: number;
  is_initial?: boolean;
  is_final?: boolean;
}

@Entity("workflows")
export class Workflow {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  /**
   * Estrutura simples de estados parametrizáveis.
   * Exemplo:
   * [
   *   { id: "created", name: "Criado", order: 1, is_initial: true },
   *   { id: "analysis", name: "Em análise", order: 2 },
   *   { id: "completed", name: "Concluído", order: 3, is_final: true }
   * ]
   */
  @Column({ type: "simple-json", default: "[]" })
  states!: WorkflowStateDefinition[];

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}