import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("preset_templates")
export class PresetTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 100 })
  categoria!: string;

  @Column({ type: "varchar", length: 50 })
  complexidade!: string;

  @Column({ type: "simple-json", default: "[]" })
  fields!: object[];

  @Column({ type: "int", default: 0 })
  use_count!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
