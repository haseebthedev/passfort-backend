import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsNotEmpty()
  @IsString()
  siteAddress: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdatePasswordDTO {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  siteAddress?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
