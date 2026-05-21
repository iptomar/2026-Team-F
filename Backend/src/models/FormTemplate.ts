import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum FormTemplateStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export type FormFieldType = "label" | "radio" | "checkbox" | "dropdown";

export interface FormFieldDefinition {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  options?: string[];
  order: number;
}

@Entity("form_templates")
export class FormTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "simple-enum",
    enum: FormTemplateStatus,
    default: FormTemplateStatus.DRAFT,
  })
  status!: FormTemplateStatus;

  /**
   * Estrutura dinâmica do formulário.
   * Exemplo:
   * [
   *   {
   *     id: "field_abc",
   *     type: "radio",
   *     label: "Escolha uma opção",
   *     required: true,
   *     options: ["Opção A", "Opção B"],
   *     order: 1
   *   }
   * ]
   */
  @Column({ type: "simple-json", default: "[]" })
  fields!: FormFieldDefinition[];

  /**
   * Preparado para futura associação entre formulário e workflow.
   * Nesta fase pode ficar null.
   */
  @Column({ type: "varchar", length: 36, nullable: true })
  workflow_id?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  created_by?: string;

  @Column({ type: "int", default: 1 })
  version!: number;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}