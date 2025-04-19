import { PaginateModel, PaginateOptions, PaginateResult, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Password, PasswordDocument } from './schemas/password.schema';
import { CreatePasswordDTO, UpdatePasswordDTO } from './dto';
import * as CryptoJS from 'crypto-js';
import { PasswordCategory, PasswordCategoryDocument } from '../passwordCategory/schemas/passwordCategory.schema';

@Injectable()
export class PasswordService {
  private readonly encryptionKey = process.env.ENCRYPTION_KEY 

  constructor(
    @InjectModel(Password.name) private passwordModel: PaginateModel<PasswordDocument>,
    @InjectModel(PasswordCategory.name) private passwordCategoryModel: PaginateModel<PasswordCategoryDocument>,
  ) {}

  private encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, this.encryptionKey).toString();
  }

  private decryptPassword(encryptedPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async getAllPasswords(userId: string, paginateOptions?: PaginateOptions): Promise<PaginateResult<PasswordDocument>> {
    const result = await this.passwordModel.paginate(
      { userId },
      {
        page: paginateOptions.page,
        limit: paginateOptions.limit,
        sort: { createdAt: -1 },
        populate: { path: 'type' },
        select: '+passwordText',
      },
    );

    const decryptedResult: PaginateResult<PasswordDocument> = {
      docs: result.docs.map(password => {
        const decryptedPassword = password.toObject();
        decryptedPassword.passwordText = this.decryptPassword(password.passwordText);
        return decryptedPassword as PasswordDocument;
      }),
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      offset: result.offset,
    };

    return decryptedResult;
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

    const encryptedPassword = this.encryptPassword(dto.passwordText);

    const newPassword = new this.passwordModel({
      ...dto,
      type: new Types.ObjectId(dto.type),
      passwordText: encryptedPassword,
      userId,
    });
    return await newPassword.save();
  }

  async getPasswordById(userId: string, passwordId: string): Promise<Password> {
    const cleanPasswordId = passwordId.replace(/"/g, '');

    if (!Types.ObjectId.isValid(cleanPasswordId)) {
      throw new BadRequestException('Invalid password ID format');
    }

    const password = await this.passwordModel
      .findOne({ _id: new Types.ObjectId(cleanPasswordId), userId })
      .select('+passwordText')
      .populate('type');

    if (!password) {
      throw new NotFoundException('Password not found');
    }

    const decryptedPassword = password.toObject();
    decryptedPassword.passwordText = this.decryptPassword(password.passwordText);
    return decryptedPassword;
  }

  async updatePasswordById(userId: string, passwordId: string, dto: UpdatePasswordDTO): Promise<Password> {
    if (dto.passwordText) {
      dto.passwordText = this.encryptPassword(dto.passwordText);
    }

    const password = await this.passwordModel
      .findOneAndUpdate({ _id: passwordId, userId }, { $set: dto }, { new: true })
      .populate('type');
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

  async getPasswordsGroupedByCategory(userId: string) {
    return await this.passwordModel.db
      .collection('passwordcategories')
      .aggregate([
        {
          $lookup: {
            from: 'passwords',
            let: { categoryId: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: '$type' }, { $toString: '$$categoryId' }] },
                  userId: userId.toString(),
                },
              },
              {
                $project: {
                  _id: { $toString: '$_id' },
                  siteAddress: 1,
                  username: 1,
                  password: 1,
                  userId: 1,
                },
              },
            ],
            as: 'passwords',
          },
        },
        {
          $project: {
            _id: { $toString: '$_id' },
            type: {
              id: '$_id',
              title: '$title',
              icon: '$icon',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
            },
            passwords: 1,
          },
        },
        { $sort: { 'type.title': 1 } },
      ])
      .toArray();
  }

  async searchPasswords(
    userId: string,
    searchTerm: string,
    paginateOptions?: PaginateOptions,
  ): Promise<PaginateResult<Password[]>> {
    const searchQuery = {
      userId,
      $or: [
        { siteAddress: { $regex: searchTerm, $options: 'i' } },
        { platform: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    return await this.passwordModel.paginate(searchQuery, {
      page: paginateOptions.page,
      limit: paginateOptions.limit,
      sort: { createdAt: -1 },
      populate: { path: 'type' },
    });
  }
}
