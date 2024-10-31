export interface SidoItem {
  orgCd: string;
  orgdownNm: string;
}

export interface SigunguItem {
  uprCd: string;
  orgCd: string;
  orgdownNm: string;
}

export interface KindItem {
  kindCd: string;
  knm: string;
}

export interface StrayDog {
  desertionNo: string;
  filename: string;
  happenDt: string;
  happenPlace: string;
  kindCd: string;
  colorCd: string;
  age: string;
  weight: string;
  noticeNo: string;
  noticeSdt: string;
  noticeEdt: string;
  popfile: string;
  processState: string;
  sexCd: string;
  neuterYn: string;
  specialMark: string;
  careNm: string;
  careTel: string;
  careAddr: string;
  orgNm: string;
  chargeNm: string;
  officetel: string;
}

// API 응답을 위한 공통 인터페이스
export interface ApiResponse<T> {
  response: {
    header: {
      reqNo: number;
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}
