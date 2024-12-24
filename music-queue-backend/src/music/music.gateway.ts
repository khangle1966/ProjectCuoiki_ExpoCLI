import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MusicService } from './music.service';

@WebSocketGateway({
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
})
export class MusicGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private musicService: MusicService) { }

    // Khởi tạo WebSocket
    afterInit() {
        this.musicService.setSocketServer(this.server);
        console.log('WebSocket Gateway initialized');
    }

    // Xử lý khi client kết nối
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.server.emit('clientConnected', { clientId: client.id });
    }

    // Xử lý khi client ngắt kết nối
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.server.emit('clientDisconnected', { clientId: client.id });
    }

    // 1. Thêm bài hát (WebSocket event)
    @SubscribeMessage('addSong')
    async handleAddSong(client: Socket, payload: any): Promise<void> {
        try {
            const ip = this.getClientIp(client);
            const savedSong = await this.musicService.addSong(payload, ip);
            this.server.emit('songAdded', savedSong); // Phát sự kiện songAdded
        } catch (error) {
            console.error('Error adding song:', error);
            client.emit('error', { message: error.message });
        }
    }

    // 2. Lấy danh sách hàng chờ (WebSocket event)
    @SubscribeMessage('getQueue')
    async handleGetQueue(client: Socket): Promise<void> {
        try {
            const queue = await this.musicService.getQueue();
            client.emit('queue', queue); // Gửi danh sách hàng chờ về client
        } catch (error) {
            console.error('Error getting queue:', error);
            client.emit('error', { message: error.message });
        }
    }

    // 3. Xóa bài hát (WebSocket event)
    @SubscribeMessage('deleteSong')
    async handleDeleteSong(client: Socket, payload: { videoId: string }): Promise<void> {
        try {
            const deletedSong = await this.musicService.deleteSong(payload.videoId);
            this.server.emit('songDeleted', deletedSong); // Phát sự kiện songDeleted
        } catch (error) {
            console.error('Error deleting song:', error);
            client.emit('error', { message: error.message });
        }
    }

    // 4. Tìm kiếm bài hát (WebSocket event)
    @SubscribeMessage('searchMusic')
    async handleSearchMusic(client: Socket, payload: { query: string }): Promise<void> {
        try {
            const results = await this.musicService.searchMusic(payload.query);
            client.emit('searchResults', results); // Gửi kết quả tìm kiếm về client
        } catch (error) {
            console.error('Error searching music:', error);
            client.emit('error', { message: error.message });
        }
    }

    // Lấy địa chỉ IP từ client
    private getClientIp(client: Socket): string {
        let ip = client.handshake.address;

        if (client.handshake.headers['x-forwarded-for']) {
            ip = (client.handshake.headers['x-forwarded-for'] as string).split(',').shift();
        }

        return ip || 'unknown';
    }
}
