import { Controller, Post, Get, Request, Body } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { InvalidCredentialsException, UserAlreadyExistsException } from './exceptions/auth.exceptions';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { timestamp } from 'rxjs';
import { error } from 'console';

@ApiTags('Auth') // Группировка в Swagger UI
@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService, // Инжектируем JwtService
    ) {}

    @Post('signup')
    @ApiOperation({ summary: 'Регистрация пользователя' })
    @ApiResponse({
        status: 201,
        description: 'Успешная регистрация',
        schema: {
            example: {id: 'uuid', email: 'user@example.com'}
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Некорректные данные',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'email must be an email',
                    'password must be longer than or equal to 6 characters',
                ],
                error: 'Bad Request'
            }
        }
    })
    @ApiResponse({
        status: 409,
        description: 'Пользователь уже существует',
        schema: {
            example: {
                statusCode: 409,
                message: 'User with this email already exists',
                timestamp: '2024-08-15T12:00:00.000Z'
            }
        }
    })
    @ApiBody({ type: SignUpDto })
    async signUp(@Body() dto: SignUpDto) {
        const existingUser = await this.userService.findByEmail(dto.email);
        if (existingUser) {
            throw new UserAlreadyExistsException();
        }

        const user = await this.userService.createUser(dto.email, dto.password);
        return { id: user.id, email: user.email };
    }

    @Post('login')
    @ApiOperation({ summary: 'Вход в систему' })
    @ApiResponse({
        status: 200,
        description: 'Успешный вход',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Некорректные данные',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'email must be an email',
                    'password must be a string'
                ],
                error: 'Bad Request'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Неверные email/пароль',
        schema: {
            example: {
                statusCode: 401,
                message: 'Invalid credentials',
                timestamp: '2024-08-15T12:00:00.000Z'
            }
        }
    })
    @ApiBody({ type: LoginDto })
    async login(@Body() dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            throw new InvalidCredentialsException();
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new InvalidCredentialsException();
        }

        const payload = { id: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return { access_token: token };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить данные текущего пользователя' })
    @ApiResponse({
        status: 200,
        description: 'Данные пользователя',
        schema: {
            example: { id: 'uuid', email: 'user@example.com' }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Неавторизованный доступ',
        schema: {
            example: {
                statusCode: 401,
                message: 'Unauthorized',
                timestamp: '2024-08-15T12:00:00.000Z'
            }
        }
    })
    async getMe(@Request() req) {
        return req.user; // Вернёт { id, email } из токена
    }
}