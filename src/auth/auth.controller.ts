import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { User } from './decorator/user.decorator';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('kakao/code')
  async kakaoLoginWithCode(@Query('code') code: string): Promise<LoginResponseDto> {
    const kakaoAccessToken = await this.authService.getKakaoAccessToken(code);
    // 토큰 -> 사용자 정보
    const userInfo = await this.authService.getKakaoUserInfo(kakaoAccessToken);
    // 사용자 정보 -> jwt 발급
    const jwtTokens = await this.authService.loginWithKakao(userInfo);
    // return refresh, access
    return jwtTokens;
  }

  @Post('kakao/token')
  async kakaoLoginWithToken(@Body('token') kakaoAccessToken: string): Promise<LoginResponseDto> {
    // 토큰 -> 사용자 정보
    const userInfo = await this.authService.getKakaoUserInfo(kakaoAccessToken);
    // 사용자 정보 -> jwt 발급
    const jwtTokens = await this.authService.loginWithKakao(userInfo);
    // return refresh, access
    return jwtTokens;
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    return await this.authService.getNewAccessToken(refreshToken);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto.refreshToken);
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout-all')
  async logoutAll(@User('userId') userId: number) {
    await this.authService.logoutAllDevices(userId);
    return { message: 'Logged out from all devices' };
  }

  @UseGuards(JwtRefreshGuard)
  @Get('devices')
  async getActiveDevices(@User() req) {
    return await this.authService.getActiveDevices(req.userId);
  }
}
