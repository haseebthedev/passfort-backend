import { PaginateModel, PaginateOptions, PaginateResult } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Password, PasswordDocument } from './schemas/password.schema';
import { CreatePasswordDTO, UpdatePasswordDTO } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor(@InjectModel(Password.name) private passwordModel: PaginateModel<PasswordDocument>) {}

  async getAllPasswords(userId: string, paginateOptions?: PaginateOptions): Promise<PaginateResult<Password[]>> {
    return await this.passwordModel.paginate(
      { userId },
      {
        page: paginateOptions.page,
        limit: paginateOptions.limit,
        sort: { createdAt: -1 },
      },
    );
  }

  async createPassword(userId: string, dto: CreatePasswordDTO): Promise<Password> {
    if (dto.siteAddress) {
      const existingPassword = await this.passwordModel.findOne({
        siteAddress: dto.siteAddress,
        userId,
      });

      if (existingPassword) {
        throw new ConflictException('The site address is already associated with a password.');
      }
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const newPassword = new this.passwordModel({
      ...dto,
      password: hashedPassword,
      userId,
    });
    return await newPassword.save();
  }

  async getPasswordById(userId: string, passwordId: string): Promise<Password> {
    const password = await this.passwordModel.findOne({ _id: passwordId, userId });
    if (!password) {
      throw new NotFoundException('Password not found');
    }
    return password;
  }

  async updatePasswordById(userId: string, passwordId: string, dto: UpdatePasswordDTO): Promise<Password> {
    const password = await this.passwordModel.findOneAndUpdate(
      { _id: passwordId, userId },
      { $set: dto },
      { new: true },
    );
    if (!password) {
      throw new NotFoundException('Password not found');
    }
    return password;
  }

  async deletePasswordById(userId: string, passwordId: string): Promise<{ result: string }> {
    const result = await this.passwordModel.deleteOne({ _id: passwordId, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Password not found');
    }

    return { result: 'Password has been deleted successfully!' };
  }
}
