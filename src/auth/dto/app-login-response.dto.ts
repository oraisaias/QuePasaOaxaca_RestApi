export class AppLoginResponseDto {
  access_token: string;
  user: {
    id: string;
    deviceId: string;
    role: string;
  };
  message: string;
}
