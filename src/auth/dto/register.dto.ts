import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Match } from 'common/decorators/password-match.decorator';

export class RegistreDto {
    @ApiProperty()
    @IsString()
    @IsEmail()
    @MinLength(4, { message: 'Email must be valid' })
    // @MaxLength(20)
    readonly email: string;

    @ApiProperty()
    @IsString()
    @MinLength(4, { message: 'The passowrd is to weak.' })
    // @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'The passowrd is to weak.' })
    @Match('passwordConfirm', { message: 'Your passwords did not match. Please retype them.' })
    readonly password: string;

    @ApiProperty()
    @IsString()
    @MinLength(4, { message: 'The passowrd is to weak.' })
    // @MaxLength(20)
    @Match('password', { message: 'Your passwords did not match. Please retype them.' })
    readonly passwordConfirm: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(2, { message: 'First name can consist of no less than 2 and no more than 200 characters long' })
    @MaxLength(200, { message: 'First name can consist of no less than 2 and no more than 200 characters long' })
    readonly firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(2, { message: 'Last name can consist of no less than 2 and no more than 200 characters long' })
    @MaxLength(200, { message: 'Last name can consist of no less than 2 and no more than 200 characters long' })
    readonly lastName: string;
}