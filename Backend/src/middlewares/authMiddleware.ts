import { Request, Response, NextFunction } from "express";
import { AuthenticatedUser, AuthService } from "../services/authService";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
      authToken?: string;
    }
  }
}

const authService = new AuthService();

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

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      res.status(401).json({
        error: "Token de autenticação em falta.",
      });
      return;
    }

    const user = await authService.findUserByToken(token);

    if (!user) {
      res.status(401).json({
        error: "Token de autenticação inválido ou expirado.",
      });
      return;
    }

    req.authUser = user;
    req.authToken = token;

    next();
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    res.status(500).json({
      error: "Erro interno na autenticação.",
    });
  }
}