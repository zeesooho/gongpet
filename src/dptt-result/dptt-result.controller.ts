import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DpttTestSheet } from './entity/dptt-test-sheet.entity';
import { DpttResultService } from './dptt-result.service';
import { CreateDpttResultDto } from './dto/create-dptt-result.dto';
import { UpdateDpttResultDto } from './dto/update-dptt-result.dto';
import { JwtAccessGuard } from 'src/auth/guard/jwt-access.guard';
import { User } from 'src/auth/decorator/user.decorator';

@Controller('dptt')
export class DpttResultController {
  constructor(private readonly dpttResultService: DpttResultService) {}

  @Get('test-sheet')
  async getTestSheet(): Promise<DpttTestSheet> {
    return this.dpttResultService.getTestSheet();
  }

  @UseGuards(JwtAccessGuard)
  @Post('results')
  async postResult(@User() user, @Body() data: CreateDpttResultDto) {
    return await this.dpttResultService.create(user.userId, data);
  }

  @UseGuards(JwtAccessGuard)
  @Patch('results/:id')
  async updateResult(@User() user, @Param('id') id: string, @Body() data: UpdateDpttResultDto) {
    return await this.dpttResultService.update(user.userId, parseInt(id), data);
  }
}
