import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Đăng nhập
    @Post('login')
    async login(@Body() createUserDto: CreateUserDto) {
        return this.authService.login(createUserDto.username, createUserDto.password);
    }

    // Đăng ký
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto.username, createUserDto.password);
    }
}
