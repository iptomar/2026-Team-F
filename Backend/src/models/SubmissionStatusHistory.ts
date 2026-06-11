import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { FormSubmissionStatus } from "./FormSubmission";

@Entity("submission_status_history")
export class SubmissionStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  submission_id!: string;

  @Column({
    type: "simple-enum",
    enum: FormSubmissionStatus,
  })
  previous_status!: FormSubmissionStatus;

  @Column({
    type: "simple-enum",
    enum: FormSubmissionStatus,
  })
  new_status!: FormSubmissionStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  changed_by?: string | null;

  @CreateDateColumn()
  changed_at!: Date;
}