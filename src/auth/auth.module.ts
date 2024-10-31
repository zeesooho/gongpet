import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { JwtRefreshTokenStrategy } from './guard/jwt-refresh.strategy';
import { JwtAccessTokenStrategy } from './guard/jwt-access.strategy';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({}),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshTokenStrategy, JwtAccessTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
