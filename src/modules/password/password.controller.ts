import { User } from '../user/schemas/user.schema';
import { GetUser } from 'src/common/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { PasswordService } from './password.service';
import { CreatePasswordDTO, UpdatePasswordDTO } from './dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('password')
export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  @Get('passwords')
  async getAllPasswords(@GetUser() user: User) {
    return await this.passwordService.getAllPasswords(user._id);
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
