import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from "class-validator";
import { FormTemplateStatus } from "../models/FormTemplate";

export class CreateFormTemplateDto {
  @IsString()
  @IsNotEmpty({ message: "O nome do template é obrigatório." })
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FormTemplateStatus, {
    message: "Status deve ser 'draft' ou 'published'.",
  })
  status?: FormTemplateStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  created_by?: string;
}

export class UpdateFormTemplateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "O nome não pode ser vazio." })
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FormTemplateStatus, {
    message: "Status deve ser 'draft' ou 'published'.",
  })
  status?: FormTemplateStatus;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;
}
