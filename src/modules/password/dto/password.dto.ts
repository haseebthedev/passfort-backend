import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePasswordDTO {
  @IsNotEmpty()
  type: Types.ObjectId;

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
  passwordText: string;
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
  passwordText?: string;
}
