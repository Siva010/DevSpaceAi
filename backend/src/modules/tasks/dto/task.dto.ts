import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
  IsInt,
  MaxLength,
  Min,
  Max,
  IsNumber,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'])
  status?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(4)
  priority?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'])
  status?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(4)
  priority?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'])
  status: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
