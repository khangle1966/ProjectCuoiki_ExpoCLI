import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService)) // Inject UsersService với forwardRef

        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // Đăng nhập
    async login(username: string, password: string) {
        const user = await this.usersService.findOneByUsername(username);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const payload = { username: user.username, sub: user._id };
        return {
            message: 'Login successful',
            access_token: this.jwtService.sign(payload),
            user: { id: user._id, username: user.username },
        };
    }

    // Đăng ký người dùng mới
    async register(username: string, password: string) {
        let existingUser = null;

        // Kiểm tra xem username đã tồn tại hay chưa
        try {
            existingUser = await this.usersService.findOneByUsername(username);
        } catch (error) {
            // Nếu user không tồn tại, chúng ta sẽ tiếp tục tạo user
            if (error.status !== 404) {
                throw error; // Nếu lỗi khác 404, ném lỗi
            }
        }

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const user = await this.usersService.createUser({ username, password: hashedPassword });

        return {
            message: 'Registration successful',
            user: { id: user._id, username: user.username },
        };
    }

}
