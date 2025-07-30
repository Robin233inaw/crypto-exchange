import { Controller, Post, Body } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) {}

    @Post('signup')
    async signUp(@Body() dto: SignUpDto) {
        const existingUser = await this.userService.findByEmail(dto.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = await this.userService.createUser(dto.email, dto.password);
        return { id: user.id, email: user.email };
    }
}