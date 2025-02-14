import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators';
import { User } from '../user/schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards';
import { PasswordService } from './password.service';
import { CreatePasswordDTO, UpdatePasswordDTO } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('password')
export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  @Get('passwords')
  async getAllPasswords(
    @GetUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.passwordService.getAllPasswords(user._id, { page, limit });
  }

  @Post('create-password')
  async createPassword(@GetUser() user: User, @Body() dto: CreatePasswordDTO) {
    return await this.passwordService.createPassword(user._id, dto);
  }

  @Get(':id')
  async getPasswordById(@GetUser() user: User, @Param('id') passwordId: string) {
    return await this.passwordService.getPasswordById(user._id, passwordId);
  }

  @Patch(':id')
  async updatePasswordById(
    @GetUser() user: User,
    @Param('id') passwordId: string,
    @Body() updatePasswordDTO: UpdatePasswordDTO,
  ) {
    return await this.passwordService.updatePasswordById(user._id, passwordId, updatePasswordDTO);
  }

  @Delete(':id')
  async deletePasswordById(@GetUser() user: User, @Param('id') passwordId: string) {
    return await this.passwordService.deletePasswordById(user._id, passwordId);
  }
}
