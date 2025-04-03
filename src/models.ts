import mongoose, { Schema } from "mongoose";
import type { IMessage } from "./struct/IMessage";
import type { IUser } from "./struct/IUser";

await mongoose.connect('mongodb://localhost:27017/po');

const message = new Schema<IMessage>({
    messageId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    replyTo: { type: String },
    createdAt: { type: Date, default: Date.now },
    hide: { type: Boolean, default: false },
});

export const Message = mongoose.model<IMessage>('PoMessage', message);

const user = new Schema<IUser>({
    user_id: {type: String, required: true, unique: true, immutable: true},
    temperature: {type: Number, default: 0.8},
    system_prompt: {type: String},
    has_shown_reset: {type: Boolean, default: false},
    seed_override: {type: Number},
});

export const User = mongoose.model<IUser>("User", user);
