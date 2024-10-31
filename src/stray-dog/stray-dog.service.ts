import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ApiResponse, KindItem, SidoItem, SigunguItem, StrayDog } from './entities/stray-dog.entity';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class StrayDogService {
  private readonly baseUrl: string;
  private readonly serviceKey: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.STRAY_DOG_API_URL;
    this.serviceKey = process.env.STRAY_DOG_SERVICE_KEY;
  }
  
  async getSido(): Promise<SidoItem[]> {
    const response = await lastValueFrom(
      this.httpService.get<ApiResponse<SidoItem>>(`${this.baseUrl}/sido`, {
        params: {
          serviceKey: this.serviceKey,
          numOfRows: '100',
          pageNo: '1',
          _type: 'json',
        },
      }),
    );
    return response.data.response.body.items.item;
  }

  async getSigungu(uprCd: string): Promise<SigunguItem[]> {
    const response = await lastValueFrom(
      this.httpService.get<ApiResponse<SigunguItem>>(`${this.baseUrl}/sigungu`, {
        params: {
          serviceKey: this.serviceKey,
          upr_cd: uprCd,
          _type: 'json',
        },
      }),
    );
    return response.data.response.body.items.item;
  }

  async getKind(upKindCd: string): Promise<KindItem[]> {
    const response = await lastValueFrom(
      this.httpService.get<ApiResponse<KindItem>>(`${this.baseUrl}/kind`, {
        params: {
          serviceKey: this.serviceKey,
          up_kind_cd: upKindCd,
          _type: 'json',
        },
      }),
    );
    return response.data.response.body.items.item;
  }

  async getStrayDogs(params: {
    upr_cd?: string;
    org_cd?: string;
    care_reg_no?: string;
    state?: string;
    bgnde?: string;
    endde?: string;
    upkind?: string;
    kind?: string;
    neuter_yn?: string;
    pageNo?: string;
    numOfRows?: string;
  }): Promise<StrayDog[]> {
    const response = await lastValueFrom(
      this.httpService.get<ApiResponse<StrayDog>>(`${this.baseUrl}/abandonmentPublic`, {
        params: {
          serviceKey: this.serviceKey,
          _type: 'json',
          ...params,
        },
      }),
    );
    return response.data.response.body.items.item;
  }
}
