import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("auth_sessions")
export class AuthSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 36 })
  user_id!: string;

  @Column({ type: "varchar", length: 128, unique: true })
  token_hash!: string;

  @Column({ type: "datetime" })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;
}