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

export type FormFieldType =
  | "label"
  | "radio"
  | "checkbox"
  | "dropdown"
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "section"
  | "heading"
  | "instruction"
  | "divider"
  | "text_block"
  | "paragraph"
  | "number_label"
  | "spacer";

export type FormFieldDefaultValue = string | number | boolean | string[] | null;

export type FormFieldValidationLimit = string | number;

export interface FormFieldDefinition {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  options?: string[];
  order: number;

  /**
   * Propriedades opcionais para campos avançados.
   * Estas propriedades permitem ao frontend representar formulários mais ricos
   * sem obrigar a novas colunas na base de dados.
   */
  description?: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: FormFieldDefaultValue;

    /**
   * Regras opcionais de validação.
   *
   * min/max:
   * - number: valores numéricos mínimos/máximos;
   * - date: datas mínimas/máximas em string.
   *
   * minLength/maxLength/pattern:
   * - text, textarea e email.
   */
  min?: FormFieldValidationLimit;
  max?: FormFieldValidationLimit;
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  /**
   * Suporte opcional a secções/grupos com subcampos.
   * Mantém compatibilidade com a estrutura atual, mas permite modelos mais
   * próximos de formulários reais com várias secções.
   */
  fields?: FormFieldDefinition[];
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
   *
   * Exemplos de campos suportados:
   * - label / heading / instruction / section
   * - radio / checkbox / dropdown
   * - text / textarea / number / email / date
   *
   * A estrutura é guardada em JSON para permitir formulários parametrizados
   * adaptáveis a vários contextos.
   */
  @Column({ type: "simple-json", default: "[]" })
  fields!: FormFieldDefinition[];

  /**
   * Associação opcional entre formulário e workflow.
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