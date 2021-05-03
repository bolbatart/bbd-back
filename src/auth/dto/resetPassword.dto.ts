import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Match } from 'common/decorators/password-match.decorator';

export class ResetPasswordDto {
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
    readonly password: string;

    @ApiProperty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Match('password')
    readonly passwordConfirm: string;
}