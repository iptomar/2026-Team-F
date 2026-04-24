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
