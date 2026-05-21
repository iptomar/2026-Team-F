import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegisterInput(body: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}): string | null {
  const { name, email, password } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "O campo 'name' é obrigatório.";
  }

  if (name.trim().length > 255) {
    return "O campo 'name' não pode exceder 255 caracteres.";
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return "O campo 'email' é obrigatório.";
  }

  if (!isValidEmail(email.trim())) {
    return "O campo 'email' deve conter um email válido.";
  }

  if (!password || typeof password !== "string") {
    return "O campo 'password' é obrigatório.";
  }

  if (password.length < 6) {
    return "A palavra-passe deve ter pelo menos 6 caracteres.";
  }

  return null;
}

function validateLoginInput(body: {
  email?: unknown;
  password?: unknown;
}): string | null {
  const { email, password } = body;

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return "O campo 'email' é obrigatório.";
  }

  if (!isValidEmail(email.trim())) {
    return "O campo 'email' deve conter um email válido.";
  }

  if (!password || typeof password !== "string") {
    return "O campo 'password' é obrigatório.";
  }

  return null;
}

function extractBearerToken(req: Request): string | null {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return null;
  }

  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validationError = validateRegisterInput(req.body);

      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const { name, email, password } = req.body;

      const result = await authService.register({
        name,
        email,
        password,
      });

      res.status(201).json({
        message: "Utilizador registado com sucesso.",
        user: result.user,
        token: result.token,
        expires_at: result.expires_at,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({
          error: "Já existe uma conta registada com este email.",
        });
        return;
      }

      console.error("Erro ao registar utilizador:", error);
      res.status(500).json({
        error: "Erro interno ao registar utilizador.",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validationError = validateLoginInput(req.body);

      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const { email, password } = req.body;

      const result = await authService.login({
        email,
        password,
      });

      if (!result) {
        res.status(401).json({
          error: "Credenciais inválidas.",
        });
        return;
      }

      res.json({
        message: "Login efetuado com sucesso.",
        user: result.user,
        token: result.token,
        expires_at: result.expires_at,
      });
    } catch (error) {
      console.error("Erro ao iniciar sessão:", error);
      res.status(500).json({
        error: "Erro interno ao iniciar sessão.",
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    if (!req.authUser) {
      res.status(401).json({
        error: "Utilizador não autenticado.",
      });
      return;
    }

    res.json({
      user: req.authUser,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.authToken ?? extractBearerToken(req);

      if (!token) {
        res.status(401).json({
          error: "Token de autenticação em falta.",
        });
        return;
      }

      await authService.logout(token);

      res.json({
        message: "Sessão terminada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao terminar sessão:", error);
      res.status(500).json({
        error: "Erro interno ao terminar sessão.",
      });
    }
  }
}