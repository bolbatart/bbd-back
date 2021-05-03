import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;
}