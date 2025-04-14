import { InjectModel } from '@nestjs/mongoose';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordCategory, PasswordCategoryDocument } from './schemas/passwordCategory.schema';
import { CreatePasswordCategoryDTO } from './dto';
import { PaginateModel } from 'mongoose';
import { Password, PasswordDocument } from '../password/schemas/password.schema';

@Injectable()
export class PasswordCategoryService {
  constructor(
    @InjectModel(PasswordCategory.name)
    private passwordCategoryModel: PaginateModel<PasswordCategoryDocument>,

    @InjectModel(Password.name)
    private passwordModelRef: PaginateModel<PasswordDocument>,
  ) {}

  async createPasswordCategory(dto: CreatePasswordCategoryDTO): Promise<PasswordCategoryDocument> {
    const existingCategory = await this.passwordCategoryModel.findOne({ title: dto.title });
    if (existingCategory) {
      throw new ConflictException('Category with this title already exists');
    }

    const newCategory = new this.passwordCategoryModel(dto);
    return await newCategory.save();
  }

  async getAllCategories(): Promise<PasswordCategoryDocument[]> {
    return await this.passwordCategoryModel.find().exec();
  }

  async getCategoryById(id: string): Promise<PasswordCategoryDocument> {
    const category = await this.passwordCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const deleted = await this.passwordCategoryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return { message: 'Category deleted successfully' };
  }

  async updatePasswordCategory(
    id: string,
    updateData: Partial<CreatePasswordCategoryDTO>,
  ): Promise<PasswordCategoryDocument> {
    const category = await this.passwordCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.passwordCategoryModel.findByIdAndUpdate(id, updateData, { new: true });
  }
}
