import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10, { message: 'Project key must be under 10 characters' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Project key must contain only uppercase letters and numbers' })
  key: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;
}
