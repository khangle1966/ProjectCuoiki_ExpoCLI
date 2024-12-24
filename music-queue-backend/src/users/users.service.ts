import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @Inject(forwardRef(() => AuthService)) // Inject AuthService nếu cần
        private readonly authService: AuthService,
    ) { }

    // Tạo người dùng mới
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { username, password } = createUserDto;

        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            throw new BadRequestException('Username already exists');
        }

        const newUser = new this.userModel({
            username,
            password,
        });

        return newUser.save();
    }

    // Tìm người dùng theo username
    async findOneByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    // Tìm người dùng theo ID
    async findOneById(id: string): Promise<User> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
