import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService, // Inject trực tiếp UsersService
        private readonly authService: AuthService,   // Giữ AuthService cho việc đăng ký
    ) { }

    // Đăng ký người dùng mới
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto.username, createUserDto.password);
    }

    // Lấy thông tin người dùng theo username
    @Get(':username')
    async getUserByUsername(@Param('username') username: string) {
        return this.usersService.findOneByUsername(username);
    }

    // Lấy thông tin người dùng theo id
    @Get('id/:id')
    async getUserById(@Param('id') id: string) {
        return this.usersService.findOneById(id);
    }
}
