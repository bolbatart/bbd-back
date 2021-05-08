import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches} from 'class-validator';


export class CreateProjectDto {
    @ApiProperty()
    @IsNotEmpty()
    readonly area: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly location: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly shortDescription: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly description: string;

    @ApiProperty()
    readonly availablePositions: string[];
   
    @ApiProperty()
    readonly budgetGoal: number;
}