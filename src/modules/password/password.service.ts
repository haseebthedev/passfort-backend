import { PaginateModel, PaginateOptions, PaginateResult, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Password, PasswordDocument } from './schemas/password.schema';
import { CreatePasswordDTO, UpdatePasswordDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { PasswordCategory, PasswordCategoryDocument } from '../passwordCategory/schemas/passwordCategory.schema';

@Injectable()
export class PasswordService {
  constructor(
    @InjectModel(Password.name) private passwordModel: PaginateModel<PasswordDocument>,
    @InjectModel(PasswordCategory.name) private passwordCategoryModel: PaginateModel<PasswordCategoryDocument>,
  ) {}

  async getAllPasswords(userId: string, paginateOptions?: PaginateOptions): Promise<PaginateResult<Password[]>> {
    return await this.passwordModel.paginate(
      { userId },
      {
        page: paginateOptions.page,
        limit: paginateOptions.limit,
        sort: { createdAt: -1 },
        populate: { path: 'type' },
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
      type: new Types.ObjectId(dto.type),
      password: hashedPassword,
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
      .populate('type');

    if (!password) {
      throw new NotFoundException('Password not found');
    }

    return password;
  }

  async updatePasswordById(userId: string, passwordId: string, dto: UpdatePasswordDTO): Promise<Password> {
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

  // async getPasswordsGroupedByCategory(userId: string) {
  //   return await this.passwordModel.aggregate([
  //     { $match: { userId: userId.toString() } },
  //     {
  //       $lookup: {
  //         from: 'passwordcategories',
  //         let: { typeId: { $toObjectId: '$type' } },
  //         pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$typeId'] } } }],
  //         as: 'type',
  //       },
  //     },
  //     { $unwind: '$type' },
  //     {
  //       $group: {
  //         _id: '$type._id',
  //         type: { $first: '$type' },
  //         passwords: { $push: '$$ROOT' },
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //         type: {
  //           id: '$_id',
  //           title: '$type.title',
  //           createdAt: '$type.createdAt',
  //           updatedAt: '$type.updatedAt',
  //         },
  //         passwords: {
  //           siteAddress: 1,
  //           username: 1,
  //           password: 1,
  //           userId: 1,
  //         },
  //       },
  //     },
  //   ]);
  // }

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
