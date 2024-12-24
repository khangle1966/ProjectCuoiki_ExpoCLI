import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicSchema } from './entities/music.schema';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MusicGateway } from './music.gateway';  // Thêm MusicGateway vào đây

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Music', schema: MusicSchema }])],
  providers: [MusicService, MusicGateway],  
  controllers: [MusicController],
})
export class MusicModule { }
