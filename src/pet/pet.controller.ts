import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PetService } from './pet.service';
import { User } from 'src/auth/decorator/user.decorator';
import { JwtAccessGuard } from 'src/auth/guard/jwt-access.guard';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @UseGuards(JwtAccessGuard)
  @Post('register')
  async register(@User() user, @Body() data: any) {
    console.log(data);
    return await this.petService.create(user.userId, data);
  }
}
