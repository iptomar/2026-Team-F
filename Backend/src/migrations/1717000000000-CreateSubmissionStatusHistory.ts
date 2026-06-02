import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from "typeorm";

export class CreateSubmissionStatusHistory1717000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("submission_status_history");

    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: "submission_status_history",
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
              name: "submission_id",
              type: "varchar",
              length: "36",
              isNullable: false,
            },
            {
              name: "previous_status",
              type: "varchar",
              length: "50",
              isNullable: false,
            },
            {
              name: "new_status",
              type: "varchar",
              length: "50",
              isNullable: false,
            },
            {
              name: "changed_by",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            {
              name: "changed_at",
              type: "datetime",
              default: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true
      );

      await queryRunner.createIndex(
        "submission_status_history",
        new TableIndex({
          name: "IDX_SUBMISSION_STATUS_HISTORY_SUBMISSION_ID",
          columnNames: ["submission_id"],
        })
      );

      await queryRunner.createIndex(
        "submission_status_history",
        new TableIndex({
          name: "IDX_SUBMISSION_STATUS_HISTORY_CHANGED_AT",
          columnNames: ["changed_at"],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("submission_status_history");

    if (hasTable) {
      await queryRunner.dropTable("submission_status_history");
    }
  }
}