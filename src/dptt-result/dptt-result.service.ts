import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DpttTestSheet } from './entity/dptt-test-sheet.entity';
import { CreateDpttResultDto } from './dto/create-dptt-result.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DpttType } from '@prisma/client';
import { UpdateDpttResultDto } from './dto/update-dptt-result.dto';
import { UserService } from 'src/user/user.service';
import { removeNullValues } from 'src/util/utils';

@Injectable()
export class DpttResultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  private readonly filePath = path.join(__dirname, '..\\..', 'assets', 'dptt-data.json');

  getTestSheet(): DpttTestSheet {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const testSheet: DpttTestSheet = JSON.parse(data);
      return testSheet;
    } catch (error) {
      console.error(error);
      throw new NotFoundException('Dptt data not found');
    }
  }

  async create(userId: number, dto: CreateDpttResultDto) {
    const user = await this.userService.getUserByid(userId);
    if (!user) throw new NotFoundException('User not found');

    const currentTime = new Date();

    const type = this.getPersonalType(
      dto.introversionExtroversion,
      dto.dependenceLeadership,
      dto.rationalityEmotionality,
    );

    const data = {
      userId: userId,
      petId: dto.petId,
      type: type,
      introversionExtroversion: dto.introversionExtroversion,
      dependenceLeadership: dto.dependenceLeadership,
      rationalityEmotionality: dto.rationalityEmotionality,
      createdAt: currentTime,
    };

    return await this.prisma.dpttResult.create({ data });
  }

  async update(userId: number, id: number, dto: UpdateDpttResultDto) {
    const currentTime = new Date();

    const type = dto.retest
      ? this.getPersonalType(dto.introversionExtroversion, dto.dependenceLeadership, dto.rationalityEmotionality)
      : null;

    const data = removeNullValues({
      petId: dto.petId,
      type: type,
      introversionExtroversion: dto.introversionExtroversion,
      dependenceLeadership: dto.dependenceLeadership,
      rationalityEmotionality: dto.rationalityEmotionality,
      createdAt: currentTime,
    });

    return await this.prisma.dpttResult.update({
      data: data,
      where: {
        userId,
        id,
      },
    });
  }

  async delete(id: number) {
    return await this.prisma.dpttResult.delete({ where: { id } });
  }

  getPersonalType(ie: number, dl: number, re: number): DpttType {
    const types = Object.values(DpttType);
    let myType = 0;

    if (ie > 50) myType += 4; // introversion_extroversion flag
    if (dl > 50) myType += 2; // dependence_leadership flag
    if (re > 50) myType += 1; // rationality_emotionality flag

    return types[myType];
  }
}
