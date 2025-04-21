import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPassDTO, ResetPassDTO, SignInDTO, SignUpDTO, VerifyOtpDTO } from './dto';
import { GetUser } from 'src/common/decorators';
import { User } from '../user/schemas/user.schema';
import { UpdateProfileDTO } from '../user/dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signin(@Body() dto: SignInDTO) {
    return this.authService.signin(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignUpDTO) {
    return this.authService.signup(dto);
  }

  @Post('forget-password')
  forgotPassword(@Body() dto: ForgotPassDTO) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPassDTO) {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDTO) {
    return this.authService.verifyOtp(dto);
  }

}
