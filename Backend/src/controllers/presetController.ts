import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { PresetTemplate } from "../models/PresetTemplate";

const repo = () => AppDataSource.getRepository(PresetTemplate);

// GET /presets - listar todos os presets com contadores
export async function getPresets(req: Request, res: Response) {
  try {
    const presets = await repo().find({ order: { use_count: "DESC" } });
    res.json(presets);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar presets." });
  }
}

// POST /presets/:id/use - incrementar contador de utilizações
export async function usePreset(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const preset = await repo().findOne({ where: { id } });

    if (!preset) {
      return res.status(404).json({ error: "Preset não encontrado." });
    }

    preset.use_count += 1;
    await repo().save(preset);

    res.json({ id: preset.id, name: preset.name, use_count: preset.use_count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registar utilização." });
  }
}
