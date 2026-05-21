import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from "typeorm";

export class CreateUsersAndAuthSessions1716000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsers = await queryRunner.hasTable("users");

    if (!hasUsers) {
      await queryRunner.createTable(
        new Table({
          name: "users",
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
              name: "email",
              type: "varchar",
              length: "255",
              isNullable: false,
            },
            {
              name: "password_hash",
              type: "text",
              isNullable: false,
            },
            {
              name: "role",
              type: "varchar",
              length: "50",
              isNullable: false,
              default: "'user'",
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

      await queryRunner.createIndex(
        "users",
        new TableIndex({
          name: "IDX_USERS_EMAIL",
          columnNames: ["email"],
          isUnique: true,
        })
      );
    }

    const hasAuthSessions = await queryRunner.hasTable("auth_sessions");

    if (!hasAuthSessions) {
      await queryRunner.createTable(
        new Table({
          name: "auth_sessions",
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
              name: "user_id",
              type: "varchar",
              length: "36",
              isNullable: false,
            },
            {
              name: "token_hash",
              type: "varchar",
              length: "128",
              isNullable: false,
            },
            {
              name: "expires_at",
              type: "datetime",
              isNullable: false,
            },
            {
              name: "created_at",
              type: "datetime",
              default: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true
      );

      await queryRunner.createIndex(
        "auth_sessions",
        new TableIndex({
          name: "IDX_AUTH_SESSIONS_TOKEN_HASH",
          columnNames: ["token_hash"],
          isUnique: true,
        })
      );

      await queryRunner.createIndex(
        "auth_sessions",
        new TableIndex({
          name: "IDX_AUTH_SESSIONS_USER_ID",
          columnNames: ["user_id"],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAuthSessions = await queryRunner.hasTable("auth_sessions");

    if (hasAuthSessions) {
      await queryRunner.dropTable("auth_sessions");
    }

    const hasUsers = await queryRunner.hasTable("users");

    if (hasUsers) {
      await queryRunner.dropTable("users");
    }
  }
}