import { Controller, Get, Query } from '@nestjs/common';
import { StrayDogService } from './stray-dog.service';
import { KindItem, SidoItem, SigunguItem, StrayDog } from './entities/stray-dog.entity';

@Controller('stray-dog')
export class StrayDogController {
  constructor(private readonly strayDogService: StrayDogService) {}

  @Get('sido')
  getSido(): Promise<SidoItem[]> {
    return this.strayDogService.getSido();
  }

  @Get('sigungu')
  getSigungu(@Query('upr_cd') uprCd: string): Promise<SigunguItem[]> {
    return this.strayDogService.getSigungu(uprCd);
  }

  @Get('kind')
  getKind(@Query('up_kind_cd') upKindCd: string): Promise<KindItem[]> {
    return this.strayDogService.getKind(upKindCd);
  }

  @Get()
  getStrayDogs(
    @Query('upr_cd') uprCd?: string,
    @Query('org_cd') orgCd?: string,
    @Query('care_reg_no') careRegNo?: string,
    @Query('state') state?: string,
    @Query('bgnde') bgnde?: string,
    @Query('endde') endde?: string,
    @Query('kind') kind?: string,
    @Query('neuter_yn') neuterYn?: string,
    @Query('pageNo') pageNo?: string,
    @Query('numOfRows') numOfRows?: string,
  ): Promise<StrayDog[]> {
    return this.strayDogService.getStrayDogs({
      upr_cd: uprCd,
      org_cd: orgCd,
      care_reg_no: careRegNo,
      state,
      bgnde,
      endde,
      upkind: '417000',
      kind,
      neuter_yn: neuterYn,
      pageNo,
      numOfRows,
    });
  }
}
