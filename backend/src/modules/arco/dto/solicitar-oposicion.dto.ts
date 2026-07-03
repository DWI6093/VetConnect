import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SolicitarOposicionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
