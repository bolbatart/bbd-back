import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional, ValidateIf } from 'class-validator';
import { Match } from 'common/decorators/password-match.decorator';

export class UpdateUserDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    readonly firstName: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    readonly lastName: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    readonly jobPosition: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    readonly location: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    readonly website: string[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    readonly bio: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    @Match('passwordConfirm')
    readonly password?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Match('password')
    readonly passwordConfirm?: string;
}
