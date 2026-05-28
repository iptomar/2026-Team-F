import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
} from "typeorm";

export class Sprint2Consolidation1715000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasFormTemplates = await queryRunner.hasTable("form_templates");

    if (hasFormTemplates) {
      const hasFields = await queryRunner.hasColumn(
        "form_templates",
        "fields"
      );

      if (!hasFields) {
        await queryRunner.addColumn(
          "form_templates",
          new TableColumn({
            name: "fields",
            type: "text",
            isNullable: false,
            default: "'[]'",
          })
        );
      }

      const hasWorkflowId = await queryRunner.hasColumn(
        "form_templates",
        "workflow_id"
      );

      if (!hasWorkflowId) {
        await queryRunner.addColumn(
          "form_templates",
          new TableColumn({
            name: "workflow_id",
            type: "varchar",
            length: "36",
            isNullable: true,
          })
        );
      }
    }

    const hasWorkflows = await queryRunner.hasTable("workflows");

    if (!hasWorkflows) {
      await queryRunner.createTable(
        new Table({
          name: "workflows",
          columns: [
            {
              name: "id",
              type: "varchar",
              length: "36",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
            },
            {
              name: "name",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "description",
              type: "text",
              isNullable: true,
            },
            {
              name: "states",
              type: "text",
              isNullable: false,
              default: "'[]'",
            },
            {
              name: "is_active",
              type: "boolean",
              default: true,
            },
            {
              name: "created_at",
              type: "datetime",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "updated_at",
              type: "datetime",
              default: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true
      );
    }

    const hasFormSubmissions = await queryRunner.hasTable(
      "form_submissions"
    );

    if (!hasFormSubmissions) {
      await queryRunner.createTable(
        new Table({
          name: "form_submissions",
          columns: [
            {
              name: "id",
              type: "varchar",
              length: "36",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
            },
            {
              name: "form_template_id",
              type: "varchar",
              length: "36",
              isNullable: false,
            },
            {
              name: "data",
              type: "text",
              isNullable: false,
            },
            {
              name: "status",
              type: "varchar",
              length: "50",
              isNullable: false,
              default: "'submitted'",
            },
            {
              name: "workflow_id",
              type: "varchar",
              length: "36",
              isNullable: true,
            },
            {
              name: "submitted_by",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            {
              name: "submitted_at",
              type: "datetime",
              default: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasFormSubmissions = await queryRunner.hasTable(
      "form_submissions"
    );

    if (hasFormSubmissions) {
      await queryRunner.dropTable("form_submissions");
    }

    const hasWorkflows = await queryRunner.hasTable("workflows");

    if (hasWorkflows) {
      await queryRunner.dropTable("workflows");
    }

    const hasFormTemplates = await queryRunner.hasTable("form_templates");

    if (hasFormTemplates) {
      const hasWorkflowId = await queryRunner.hasColumn(
        "form_templates",
        "workflow_id"
      );

      if (hasWorkflowId) {
        await queryRunner.dropColumn("form_templates", "workflow_id");
      }

      const hasFields = await queryRunner.hasColumn(
        "form_templates",
        "fields"
      );

      if (hasFields) {
        await queryRunner.dropColumn("form_templates", "fields");
      }
    }
  }
}