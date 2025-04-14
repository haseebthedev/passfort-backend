import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePasswordCategoryDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  icon: string;
}
