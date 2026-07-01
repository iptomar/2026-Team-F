import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePresetTemplates1718000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "preset_templates" (
        "id" varchar(36) PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "description" text,
        "categoria" varchar(100) NOT NULL,
        "complexidade" varchar(50) NOT NULL,
        "fields" text NOT NULL DEFAULT '[]',
        "use_count" int NOT NULL DEFAULT 0,
        "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "preset_templates"`);
  }
}
