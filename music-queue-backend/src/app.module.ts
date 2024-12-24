import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicModule } from './music/music.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://trungkhang223:khangle15@musicqueue.iv37r.mongodb.net/?retryWrites=true&w=majority&appName=MusicQueue'),
    MusicModule,
    AuthModule,
    UsersModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
