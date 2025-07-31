import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "src/config/jwt.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register(jwtConfig), // Подключаем JWT
    ],
    controllers: [AuthController],
    providers: [UserService],
})
export class AuthModule {}