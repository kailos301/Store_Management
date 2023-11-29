export interface SocialAccountLoginDetails {
    provider: string;
    accessToken: string;
    countryId: string;
}

export interface CustomerSocialLoginResponse {
    userId: number;
    userName: string;
    phoneNumber: string;
    tokens: Tokens;
    email: string;
    floorNumber: string;
    streetAddress: string;
    city: string;
    postCode: string;
}

export interface CustomerDetailsUpdateRequest {
    tokens: Tokens;
    userName?: string;
    phoneNumber?: string;
    floorNumber?: string;
    streetAddress?: string;
    city?: string;
    postCode?: string;
}

export class Tokens {
    jwt: string;
    refreshToken: string;
}
