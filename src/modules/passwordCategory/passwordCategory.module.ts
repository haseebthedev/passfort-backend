import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordCategoryService } from './passwordCategory.service';
import { PasswordCategoryController } from './passwordCategory.controller';
import { PasswordCategory, PasswordCategorySchema } from './schemas/passwordCategory.schema';
import { PasswordModule } from '../password/password.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PasswordCategory.name, schema: PasswordCategorySchema }]),
    PasswordModule,
    FileModule,
  ],
  controllers: [PasswordCategoryController],
  providers: [PasswordCategoryService],
  exports: [PasswordCategoryService],
})
export class PasswordCategoryModule {}
