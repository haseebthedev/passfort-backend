import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordService } from './password.service';
import { PasswordController } from './password.controller';
import { Password, PasswordSchema } from './schemas/password.schema';
import { PasswordCategory, PasswordCategorySchema } from '../passwordCategory/schemas/passwordCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Password.name, schema: PasswordSchema },
      { name: PasswordCategory.name, schema: PasswordCategorySchema },
    ]),
  ],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService, MongooseModule],
})
export class PasswordModule {}
