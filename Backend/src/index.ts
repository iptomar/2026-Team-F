import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import formTemplateRoutes from "./routes/formTemplateRoutes";
import formSubmissionRoutes from "./routes/formSubmissionRoutes";
import workflowRoutes from "./routes/workflowRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Backend da ferramenta de formulários parametrizados.",
    status: "ok",
  });
});

app.use("/form-templates", formTemplateRoutes);
app.use("/form-submissions", formSubmissionRoutes);
app.use("/workflows", workflowRoutes);

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