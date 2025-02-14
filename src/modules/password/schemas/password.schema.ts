import { BaseSchema } from 'src/common/schemas';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import * as Paginate from 'mongoose-paginate-v2';

@Schema()
export class Password extends BaseSchema {
  @Prop({ default: null })
  @IsNotEmpty()
  @IsString()
  type: string;

  @Prop({ default: null })
  @IsOptional()
  platform?: string;

  @Prop({ required: true })
  @IsNotEmpty()
  siteAddress: string;

  @Prop({ default: null })
  @IsOptional()
  username?: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  password: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export type PasswordDocument = HydratedDocument<Password>;
export const PasswordSchema = SchemaFactory.createForClass(Password).set('versionKey', false);

PasswordSchema.index(
  { siteAddress: 1 },
  { unique: true, partialFilterExpression: { siteAddress: { $exists: true, $ne: null } } },
);

PasswordSchema.plugin(Paginate);
