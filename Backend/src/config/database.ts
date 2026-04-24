import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_DATABASE || "database.sqlite",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: ["src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
});
