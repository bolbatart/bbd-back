import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login.dto';

export class RegistreDto extends LoginDto {
    @ApiProperty()
    readonly firstName: string;

    @ApiProperty()
    readonly lastName: string;
}