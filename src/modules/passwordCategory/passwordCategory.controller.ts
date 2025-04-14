import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/common/decorators';
import { User } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards';
import { PasswordCategoryService } from './passwordCategory.service';
import { CreatePasswordCategoryDTO } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('passwordCategory')
export class PasswordCategoryController {
  constructor(private passwordCategoryService: PasswordCategoryService) {}

  @Post('create-category')
  async createPassword(@Body() dto: CreatePasswordCategoryDTO) {
    return await this.passwordCategoryService.createPasswordCategory(dto);
  }

  @Get()
  async getAllCategories() {
    return await this.passwordCategoryService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return await this.passwordCategoryService.getCategoryById(id);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.passwordCategoryService.deleteCategory(id);
  }

  @Patch(':id')
  async updatePasswordCategory(@Param('id') id: string, @Body() updateData: Partial<CreatePasswordCategoryDTO>) {
    return await this.passwordCategoryService.updatePasswordCategory(id, updateData);
  }
}
