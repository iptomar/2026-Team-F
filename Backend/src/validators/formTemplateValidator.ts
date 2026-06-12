import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { FormTemplateStatus } from "../models/FormTemplate";

/**
 * Representa as propriedades de posicionamento absoluto de um campo
 * na grelha visual (X, Y, Largura, Altura, Página).
 */
export class FieldGridLayout {
  /** Página em que o campo é renderizado (começa em 1). */
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  /** Posição horizontal em píxeis (ou unidades da grelha) a partir da origem. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  x?: number;

  /** Posição vertical em píxeis (ou unidades da grelha) a partir da origem. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  y?: number;

  /** Largura do campo em píxeis (ou unidades da grelha). */
  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  /** Altura do campo em píxeis (ou unidades da grelha). */
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;
}

/**
 * DTO de criação de um FormTemplate.
 * O array `fields` é validado superficialmente — a validação profunda
 * das propriedades de cada campo (tipo, label, etc.) é da responsabilidade
 * do frontend e do modelo de domínio. Aqui garantimos apenas que as
 * propriedades de grelha, quando presentes, têm tipos numéricos válidos.
 */
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

  /**
   * Lista de campos com suporte opcional a propriedades de grelha visual.
   * Cada elemento pode conter: page, x, y, width e height (todos opcionais).
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldGridLayout)
  fields?: FieldGridLayout[];
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

  /**
   * Lista de campos com suporte opcional a propriedades de grelha visual.
   * Cada elemento pode conter: page, x, y, width e height (todos opcionais).
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldGridLayout)
  fields?: FieldGridLayout[];
}
