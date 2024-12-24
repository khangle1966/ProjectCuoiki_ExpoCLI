import { Schema, Document } from 'mongoose';

// Interface cho User Document
export interface User extends Document {
    username: string;
    password: string;
    createdAt: Date;
}

// Schema của User
export const UserSchema = new Schema({
    username: { type: String, required: true, unique: true }, // Tên đăng nhập duy nhất
    password: { type: String, required: true },              // Mật khẩu đã được băm
    createdAt: { type: Date, default: Date.now },            // Thời gian tạo
});
