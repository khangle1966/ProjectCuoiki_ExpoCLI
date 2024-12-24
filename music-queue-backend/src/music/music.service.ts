import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMusicDto } from './dto/create-music.dto';
import { Music } from './interfaces/music.interface';
import axios from 'axios';
import { Server } from 'socket.io';

@Injectable()
export class MusicService {
  private server: Server;  // Lưu trữ WebSocket server
  private ipLimits: Record<string, { count: number; lastAdded: number }> = {};  // Lưu thông tin giới hạn IP

  constructor(@InjectModel('Music') private musicModel: Model<Music>) { }

  // Hàm này được gọi từ MusicGateway để thiết lập server
  setSocketServer(server: Server) {
    this.server = server;
  }

  // Thêm bài hát
  async addSong(createMusicDto: CreateMusicDto, ip: string): Promise<Music> {
    // Lấy thông tin video từ YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY;
    const videoId = createMusicDto.videoId;

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: apiKey,
      },
    });

    // Kiểm tra xem video có tồn tại không
    if (!response.data.items.length) {
      throw new HttpException('Video không tồn tại!', HttpStatus.NOT_FOUND);
    }

    // Kiểm tra xem bài hát đã tồn tại trong database hay chưa
    const existingSong = await this.musicModel.findOne({ videoId });
    if (existingSong) {
      throw new HttpException(
        'Bài hát đã tồn tại trong danh sách chờ!',
        HttpStatus.CONFLICT,
      );
    }

    // Lấy thông tin thumbnail và duration
    const video = response.data.items[0];
    const thumbnail = video.snippet.thumbnails.default.url;
    const duration = this.convertDurationToSeconds(video.contentDetails.duration);

    // Kiểm tra giới hạn số bài hát cho IP trong 5 giây
    if (this.isRateLimited(ip)) {
      throw new HttpException(
        'Bạn đã thêm quá 2 bài hát trong 5000ms, vui lòng thử lại sau!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cập nhật thông tin lịch sử bài hát đã thêm
    this.updateIpLimit(ip);

    // Tạo đối tượng bài hát mới với thumbnail và duration
    const newSong = new this.musicModel({
      ...createMusicDto,
      thumbnail,
      duration,
    });

    const savedSong = await newSong.save();

    // Phát sự kiện WebSocket nếu server tồn tại
    if (this.server) {
      this.server.emit('songAdded', savedSong);
    }

    return savedSong;
  }

  emitSongAdded(song: any) {
    if (this.server) {
      console.log('Emitting songAdded event:', song); // Log kiểm tra
      this.server.emit('songAdded', song);
    } else {
      console.error('WebSocket server not initialized.');
    }
  }
  // Kiểm tra nếu IP đã đạt giới hạn thêm bài hát
  private isRateLimited(ip: string): boolean {
    const limit = this.ipLimits[ip];
    if (!limit) return false;

    // Kiểm tra xem đã 5 giây chưa
    if (Date.now() - limit.lastAdded > 5000) {
      // Reset nếu đã qua 5 giây
      this.ipLimits[ip] = { count: 0, lastAdded: Date.now() };
      return false;
    }

    // Nếu đã thêm 2 bài hát trong 5 giây thì hạn chế thêm bài hát mới
    return limit.count >= 2;
  }

  // Cập nhật thông tin số bài hát đã thêm và thời gian cho IP
  private updateIpLimit(ip: string): void {
    const currentTime = Date.now();

    if (!this.ipLimits[ip]) {
      this.ipLimits[ip] = { count: 0, lastAdded: currentTime };
    }

    const limit = this.ipLimits[ip];
    if (currentTime - limit.lastAdded > 5000) {
      // Nếu đã qua 5 giây thì reset số bài hát
      this.ipLimits[ip] = { count: 1, lastAdded: currentTime };
    } else {
      // Nếu chưa quá 5 giây thì tăng số bài hát
      limit.count += 1;
      limit.lastAdded = currentTime;
    }
  }

  // Chuyển đổi thời gian ISO 8601 (YouTube API trả về) thành giây
  private convertDurationToSeconds(duration: string): number {
    const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
    const matches = duration.match(regex);

    const hours = matches[1] ? parseInt(matches[1].replace('H', '')) : 0;
    const minutes = matches[2] ? parseInt(matches[2].replace('M', '')) : 0;
    const seconds = matches[3] ? parseInt(matches[3].replace('S', '')) : 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Lấy danh sách hàng chờ
  async getQueue(): Promise<Music[]> {
    return this.musicModel.find().exec();
  }

  // Xóa bài hát
  async deleteSong(videoId: string): Promise<any> {
    const deletedSong = await this.musicModel.findOneAndDelete({ videoId }).exec();
    if (this.server) {
      this.server.emit('songDeleted', deletedSong);  // Phát sự kiện khi bài hát bị xóa
    }
    return deletedSong;
  }

  // Tìm kiếm bài hát
  async searchMusic(query: string): Promise<any> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Tìm kiếm video trên YouTube
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        key: apiKey,
        type: 'video',
        maxResults: 10,
      },
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId);

    if (!videoIds.length) {
      return [];
    }

    // Lấy thông tin chi tiết video bao gồm duration
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: videoIds.join(','),
        key: apiKey,
      },
    });

    // Tạo một mảng kết quả kết hợp giữa thông tin video và duration
    const results = searchResponse.data.items.map((item, index) => {
      const videoDetails = videoDetailsResponse.data.items[index];
      const duration = videoDetails.contentDetails.duration;

      // Chuyển đổi ISO 8601 duration thành giây
      const durationInSeconds = this.convertDurationToSeconds(duration);

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        duration: durationInSeconds, // Thêm duration vào kết quả
      };
    });

    return results;
  }
  emitSongDeleted(song: Music) {
    if (this.server) {
      console.log('Emitting songDeleted event:', song);
      this.server.emit('songDeleted', song);
    }
  }
}
