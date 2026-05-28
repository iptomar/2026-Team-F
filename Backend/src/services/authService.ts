import { Repository, MoreThan } from "typeorm";
import { randomBytes, pbkdf2Sync, timingSafeEqual, createHash } from "crypto";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/User";
import { AuthSession } from "../models/AuthSession";

const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";
const SESSION_DURATION_DAYS = 7;

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
  expires_at: Date;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private get userRepository(): Repository<User> {
    return AppDataSource.getRepository(User);
  }

  private get sessionRepository(): Repository<AuthSession> {
    return AppDataSource.getRepository(AuthSession);
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    const email = this.normalizeEmail(data.email);

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const user = this.userRepository.create({
      name: data.name.trim(),
      email,
      password_hash: this.hashPassword(data.password),
      role: UserRole.USER,
      is_active: true,
    });

    const savedUser = await this.userRepository.save(user);

    return this.createSessionForUser(savedUser);
  }

  async login(data: LoginInput): Promise<AuthResult | null> {
    const email = this.normalizeEmail(data.email);

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.is_active) {
      return null;
    }

    const isPasswordValid = this.verifyPassword(
      data.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return null;
    }

    return this.createSessionForUser(user);
  }

  async findUserByToken(rawToken: string): Promise<AuthenticatedUser | null> {
    const tokenHash = this.hashToken(rawToken);

    const session = await this.sessionRepository.findOne({
      where: {
        token_hash: tokenHash,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!session) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: {
        id: session.user_id,
        is_active: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.toSafeUser(user);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);

    await this.sessionRepository.delete({
      token_hash: tokenHash,
    });
  }

  private async createSessionForUser(user: User): Promise<AuthResult> {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    const session = this.sessionRepository.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    await this.sessionRepository.save(session);

    return {
      user: this.toSafeUser(user),
      token: rawToken,
      expires_at: expiresAt,
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");

    const hash = pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST
    ).toString("hex");

    return `${PASSWORD_ITERATIONS}:${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(":");

    if (parts.length !== 3) {
      return false;
    }

    const [iterationsText, salt, originalHash] = parts;
    const iterations = Number(iterationsText);

    if (!Number.isInteger(iterations) || iterations <= 0) {
      return false;
    }

    const calculatedHash = pbkdf2Sync(
      password,
      salt,
      iterations,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST
    ).toString("hex");

    const originalBuffer = Buffer.from(originalHash, "hex");
    const calculatedBuffer = Buffer.from(calculatedHash, "hex");

    if (originalBuffer.length !== calculatedBuffer.length) {
      return false;
    }

    return timingSafeEqual(originalBuffer, calculatedBuffer);
  }

  private hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toSafeUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}