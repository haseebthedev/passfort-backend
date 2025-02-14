import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordService } from './password.service';
import { PasswordController } from './password.controller';
import { Password, PasswordSchema } from './schemas/password.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Password.name, schema: PasswordSchema }])],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
