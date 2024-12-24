import { Schema } from 'mongoose';

export const MusicSchema = new Schema({
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    thumbnail: { type: String, required: true },  // Thêm trường thumbnail
    duration: { type: Number, required: true },  // Thêm trường duration
});
