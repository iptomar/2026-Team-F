import { Router } from "express";
import { getPresets, usePreset } from "../controllers/presetController";

const router = Router();

// GET /presets
router.get("/", getPresets);

// POST /presets/:id/use
router.post("/:id/use", usePreset);

export default router;
