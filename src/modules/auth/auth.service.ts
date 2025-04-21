import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { ForgotPassDTO, ResetPassDTO, SignInDTO, SignUpDTO, VerifyOtpDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { JWTDecodedUserI } from 'src/interfaces';
import { UpdateProfileDTO } from '../user/dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async signToken(userId: string, email: string): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const jwtSecret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      secret: jwtSecret,
    });
    return { access_token: token };
  }

  async verifyToken(token: string): Promise<Partial<JWTDecodedUserI>> {
    try {
      const jwtSecret = await this.config.get('JWT_SECRET');
      const decoded = await this.jwt.verify(token, { secret: jwtSecret });

      if (!decoded) {
        throw new UnauthorizedException('Token is invalid or expired');
      }
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token is invalid');
    }
  }

  async signin(dto: SignInDTO): Promise<{ user: User; token: string }> {
    const user = await this.userService.findByEmail(dto.email);
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Either email or password is invalid');
    }

     if (user.isFirstSignIn) {
      // send verification mail
      await this.userService.findByIdandUpdate(user._id, { isFirstSignIn: false });
      user.isFirstSignIn = false; 
    }

    const token = await this.signToken(user._id, user.email);
    return { user, token: token.access_token };
  }

  async signup(dto: SignUpDTO): Promise<User> {
    return await this.userService.create(dto);
  }

  async forgotPassword(dto: ForgotPassDTO): Promise<{ result: string }> {
    return await this.userService.forgotPassword(dto.email);
  }

  async resetPassword(dto: ResetPassDTO): Promise<{ result: string }> {
    return await this.userService.resetPassword(dto.email, dto.authCode, dto.newPassword);
  }

  async verifyOtp(dto: VerifyOtpDTO) {
    const { email, authCode } = dto;

    const user = await this.userService.findByEmail(email);

    console.log(email, authCode)

    if (!user || !user.authCode || user.authCode !== authCode) {
      throw new BadRequestException('Invalid OTP');
    }

    // const isOtpExpired = new Date(user.otpExpires) < new Date();
    // if (isOtpExpired) {
    //   throw new BadRequestException('OTP has expired');
    // }

    // Optionally clear OTP once it's used
  user.authCode = null
    // user.otpExpires = null;
    // await user.save();

    return { message: 'OTP verified successfully' };
  }
}
