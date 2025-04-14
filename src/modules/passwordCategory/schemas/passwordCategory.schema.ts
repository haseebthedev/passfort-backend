import { BaseSchema } from 'src/common/schemas';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import * as Paginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class PasswordCategory extends BaseSchema {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Prop({ type: String })
  icon: string;
}

export type PasswordCategoryDocument = HydratedDocument<PasswordCategory>;
export const PasswordCategorySchema = SchemaFactory.createForClass(PasswordCategory).set('versionKey', false);

PasswordCategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

PasswordCategorySchema.plugin(Paginate);
