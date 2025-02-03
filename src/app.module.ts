import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AppController } from './app.controller';
import { PasswordModule } from './modules/password/password.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ObjectIdInterceptor, ResultInterceptor } from './common/interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGO_LOCAL_URL),
    AuthModule,
    UserModule,
    PasswordModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ObjectIdInterceptor,
    },
  ],
})
export class AppModule {}
