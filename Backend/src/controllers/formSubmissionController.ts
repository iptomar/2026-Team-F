import { Request, Response } from "express";
import { FormSubmissionService } from "../services/formSubmissionService"

const service = new FormSubmissionService();

export class FormSubmissionController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { form_template_id, data, submitted_by } = req.body;

      if (!form_template_id || typeof form_template_id !== "string") {
        res.status(400).json({
          error: "O campo 'form_template_id' é obrigatório.",
        });
        return;
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        res.status(400).json({
          error: "O campo 'data' deve ser um objeto com as respostas.",
        });
        return;
      }

      const submission = await service.create({
        form_template_id,
        data,
        submitted_by: submitted_by ?? null,
      });

      if (!submission) {
        res.status(404).json({
          error: "Template de formulário não encontrado.",
        });
        return;
      }

      res.status(201).json(submission);
    } catch (error) {
      console.error("Erro ao criar submissão:", error);
      res.status(500).json({ error: "Erro interno ao criar submissão." });
    }
  }

  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const submissions = await service.findAll();
      res.json(submissions);
    } catch (error) {
      console.error("Erro ao listar submissões:", error);
      res.status(500).json({ error: "Erro interno ao listar submissões." });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await service.findById(id);

      if (!submission) {
        res.status(404).json({ error: "Submissão não encontrada." });
        return;
      }

      res.json(submission);
    } catch (error) {
      console.error("Erro ao consultar submissão:", error);
      res.status(500).json({ error: "Erro interno ao consultar submissão." });
    }
  }

  async findByTemplateId(
    req: Request<{ formTemplateId: string }>,
    res: Response
  ): Promise<void> {
    try {
      const { formTemplateId } = req.params;

      const submissions = await service.findByTemplateId(formTemplateId);
      res.json(submissions);
    } catch (error) {
      console.error("Erro ao listar submissões por template:", error);
      res.status(500).json({
        error: "Erro interno ao listar submissões por template.",
      });
    }
  }
  async updateStatus(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || typeof status !== "string") {
        res.status(400).json({
          error: "O campo 'status' é obrigatório.",
        });
        return;
      }

      // Chama o serviço para atualizar o estado na base de dados
      const updatedSubmission = await service.updateStatus(id, status);

      if (!updatedSubmission) {
        res.status(404).json({ error: "Submissão não encontrada." });
        return;
      }

      res.json(updatedSubmission);
    } catch (error) {
      console.error("Erro ao atualizar estado da submissão:", error);
      res.status(500).json({ error: "Erro interno ao atualizar o estado." });
    }
  }

} 