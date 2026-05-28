import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum FormSubmissionStatus {
  SUBMITTED = "submitted",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export interface FormSubmissionData {
  [fieldId: string]: string | string[] | boolean | number | null;
}

@Entity("form_submissions")
export class FormSubmission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  form_template_id!: string;

  @Column({ type: "simple-json" })
  data!: FormSubmissionData;

  @Column({
    type: "simple-enum",
    enum: FormSubmissionStatus,
    default: FormSubmissionStatus.SUBMITTED,
  })
  status!: FormSubmissionStatus;

  @Column({ type: "varchar", length: 36, nullable: true })
  workflow_id?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  submitted_by?: string | null;

  @CreateDateColumn()
  submitted_at!: Date;
}