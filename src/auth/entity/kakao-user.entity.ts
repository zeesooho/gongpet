export class KakaoUser {
  id: number;
  kakao_account: KakaoAccount;
}

export class KakaoAccount {
  profile_nickname_needs_agreement: boolean;
  profile: KakaoAccountProfile;

  has_email: boolean;
  email_needs_agreement: boolean;
  is_email_valid: boolean;
  is_email_verified: boolean;
  email: string;

  has_age_range: boolean;
  age_range_needs_agreement: boolean;
  age_range: string;

  has_birthday: boolean;
  birthday_needs_agreement: boolean;
  birthday: string;
  birthday_type: string;

  has_gender: boolean;
  gender_needs_agreement: boolean;
  gender: string;
}

export class KakaoAccountProfile {
  nickname: string;
  is_default_nickname: boolean;
}
