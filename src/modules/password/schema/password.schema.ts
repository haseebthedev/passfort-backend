import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDateString, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import { transformSchema } from 'src/common/utils/apiResponse';
import * as Paginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcrypt';

@Schema()
export class Password extends BaseSchema {
  @Prop({ default: null })
  @IsString()
  type: string;

  @Prop({ default: null, lowercase: true })
  @IsString()
  platform: string;

  @Prop({ lowercase: true })
  @IsString()
  @IsUrl()
  siteAddress: string;

  @Prop({ default: null })
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string;

  @Prop()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export type PasswordDocument = HydratedDocument<Password>;
export const PasswordSchema = SchemaFactory.createForClass(Password)
  .set('toJSON', { 
    transform: (doc, ret, opt) => transformSchema(doc, ret, opt, ['password']),
   })
  .set('versionKey', false);

// If password is changed or this is a new user, generate hash
PasswordSchema.pre('save', async function (next) {
  const passObj = this as PasswordDocument;
  if (passObj.isModified('password') || passObj.isNew) {
    const hash = await bcrypt.hash(passObj.password, 10);
    passObj.password = hash;
  }
  next();
});

PasswordSchema.plugin(Paginate);
