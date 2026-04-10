import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Base de dados conectada com sucesso.");

    app.listen(PORT, () => {
      console.log(`Servidor a correr na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar à base de dados:", error);
    process.exit(1);
  });

export default app;
