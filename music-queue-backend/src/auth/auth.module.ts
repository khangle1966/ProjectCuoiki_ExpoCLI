import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategy';
import { UsersModule } from '../users/users.module';  // Giả sử bạn đã có UsersModule để quản lý người dùng

@Module({
  imports: [
    forwardRef(() => UsersModule), // Sử dụng forwardRef để phá vòng lặp
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secretKey',  // Sử dụng khóa bí mật cho JWT
      signOptions: {
        expiresIn: '60m',  // Thời gian hết hạn của token (1 giờ)
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
