import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Password, PasswordSchema } from './schema/password.schema';
import { PasswordService } from './password.service';
import { PasswordController } from './password.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Password.name, schema: PasswordSchema }])],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
