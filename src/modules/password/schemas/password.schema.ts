import { BaseSchema } from 'src/common/schemas';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import * as Paginate from 'mongoose-paginate-v2';
import { Types } from 'mongoose';

@Schema()
export class Password extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'PasswordCategory', required: true })
  @IsNotEmpty()
  type: Types.ObjectId;

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

PasswordSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

PasswordSchema.plugin(Paginate);
