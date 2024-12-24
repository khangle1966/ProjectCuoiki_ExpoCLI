import { Controller, Get, Post, Delete, Body, Query, Param, Request } from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';

@Controller('music')
export class MusicController {
    constructor(private readonly musicService: MusicService) {}

    @Post('add')
    async addToQueue(@Body() createMusicDto: CreateMusicDto, @Request() req) {
        // Thêm bài hát vào hàng chờ qua HTTP
        const savedSong = await this.musicService.addSong(createMusicDto, req.ip);

        // Phát sự kiện WebSocket `songAdded`
        this.musicService.emitSongAdded(savedSong);

        return savedSong;
    }

    @Get('queue')
    async getQueue() {
        // Lấy danh sách hàng chờ
        return this.musicService.getQueue();
    }

    @Get('search')
    async searchMusic(@Query('q') query: string) {
        // Tìm kiếm bài hát qua YouTube API
        return this.musicService.searchMusic(query);
    }

    @Delete('delete/:videoId')
    async deleteSong(@Param('videoId') videoId: string) {
        // Xóa bài hát khỏi hàng chờ
        const deletedSong = await this.musicService.deleteSong(videoId);

        // Phát sự kiện WebSocket `songDeleted`
        this.musicService.emitSongDeleted(deletedSong);

        return deletedSong;
    }
}
