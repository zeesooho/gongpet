import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { KakaoUser } from './entity/kakao-user.entity';
import { UserService } from 'src/user/user.service';
import { From, Role, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CreateUserFromKakaoDto } from 'src/user/dto/create-user-from-kakao.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async getKakaoAccessToken(authCode: string): Promise<string> {
    // 카카오 토큰 얻어오기
    const kakaoTokenUrl = process.env.KAKAO_TOKEN_URL;
    const client_id = process.env.KAKAO_CLIENT_ID;
    const redirect_uri = process.env.KAKAO_REDIRECT_URL_DEVELOP;
    const grant_type = process.env.KAKAO_GRANT_TYPE;
    const response = await lastValueFrom(
      this.httpService.post(
        kakaoTokenUrl,
        {
          grant_type,
          client_id,
          redirect_uri,
          code: authCode,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );
    const accessToken = response.data.access_token;
    return accessToken;
  }

  async getKakaoUserInfo(kakaoAccessToken: string): Promise<KakaoUser | null> {
    const kakaoUserInfoUrl = process.env.KAKAO_USER_INFO_URL;
    const headers = {
      Authorization: `Bearer ${kakaoAccessToken}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const response = await lastValueFrom(
      this.httpService.get(kakaoUserInfoUrl, {
        headers: headers,
      }),
    );

    const data: KakaoUser = response.data;
    if (data) {
      return data;
    } else {
      return null;
    }
  }

  // Access Token 생성
  async signAccessToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME),
    });
  }

  // Refresh Token 생성
  async signRefreshToken(user: User, deviceInfo: string): Promise<string> {
    const payload = {
      sub: user.id,
      deviceInfo,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
    });

    // RefreshToken을 DB에 저장
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId: user.id,
        deviceInfo,
        expiresAt: new Date(Date.now() + parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME) * 1000),
      },
    });

    return token;
  }

  // AccessToken과 RefreshToken을 모두 발급
  async signToken(user: User, deviceInfo: string): Promise<LoginResponseDto> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user, deviceInfo);

    return new LoginResponseDto(accessToken, refreshToken);
  }

  // 로그인 처리
  async loginWithKakao(kakaoUser: KakaoUser): Promise<LoginResponseDto> {
    let user = await this.userService.getUserByEmail(kakaoUser.kakao_account.email, From.KAKAO);

    if (!user) {
      // 새로운 카카오 사용자를 생성하는 DTO로 변환
      const createUserDto = plainToInstance(CreateUserFromKakaoDto, {
        nickname: kakaoUser.kakao_account.profile.nickname,
        email: kakaoUser.kakao_account.email,
        age_range: kakaoUser.kakao_account.age_range,
        gender: kakaoUser.kakao_account.gender,
        birthday: kakaoUser.kakao_account.birthday,
        role: Role.USER,
        from: From.KAKAO,
      });

      user = await this.userService.createFromKakao(createUserDto);
    }

    // 토큰 생성
    const tokens = await this.signToken(user, 'mobile');
    return tokens;
  }

  // Refresh Token으로 새로운 Access Token 발급
  async getNewAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const accessToken = await this.signAccessToken(storedToken.user);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Access Token으로 새로운 Refresh Token 발급
  async getNewRefreshToken(oldRefreshToken: string): Promise<{ refreshToken: string }> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 기존 RefreshToken 삭제
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // 새로운 RefreshToken 발급
    const refreshToken = await this.signRefreshToken(storedToken.user, storedToken.deviceInfo);

    return { refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
  }

  async logoutAllDevices(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getActiveDevices(userId: number): Promise<string[]> {
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: { deviceInfo: true },
    });

    return activeTokens.map((token) => token.deviceInfo);
  }
}
