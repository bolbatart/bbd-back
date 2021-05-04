import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Match } from 'common/decorators/password-match.decorator';

export class RegistreDto {
    @ApiProperty()
    @IsString()
    @IsEmail()
    @MinLength(4)
    @MaxLength(20)
    readonly email: string;

    @ApiProperty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    @Match('passwordConfirm')
    readonly password: string;

    @ApiProperty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Match('password')
    readonly passwordConfirm: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly lastName: string;
}