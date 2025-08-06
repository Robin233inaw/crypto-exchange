import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignUpDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Пароль (мин. 8 символов)'})
    @IsString()
    @MinLength(8)
    password: string;
}