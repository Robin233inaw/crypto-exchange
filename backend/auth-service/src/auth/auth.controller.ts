import { Controller, Post, Get, Request, Body } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { InvalidCredentialsException, UserAlreadyExistsException } from './exceptions/auth.exceptions';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService, // Инжектируем JwtService
    ) {}

    @Post('signup')
    async signUp(@Body() dto: SignUpDto) {
        const existingUser = await this.userService.findByEmail(dto.email);
        if (existingUser) {
            throw new UserAlreadyExistsException();
        }

        const user = await this.userService.createUser(dto.email, dto.password);
        return { id: user.id, email: user.email };
    }

    @Post('login')
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
    async getMe(@Request() req) {
        return req.user; // Вернёт { id, email } из токена
    }
}