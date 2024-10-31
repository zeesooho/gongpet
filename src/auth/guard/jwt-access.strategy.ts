import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
      ignoreExpiration: false,
    });
  }

  // payload 검증 및 변환
  async validate(payload) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 검증된 사용자 정보 반환 (req.user로 사용)
    return { userId: payload.id, role: payload.role };
  }
}
