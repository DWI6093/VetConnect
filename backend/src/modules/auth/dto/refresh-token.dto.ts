import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'El token de refresco es obligatorio.' })
  @IsString({ message: 'El token de refresco debe ser una cadena de texto.' })
  refresh_token: string;
}
