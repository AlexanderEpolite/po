import type { Document } from "mongoose";

export interface IMessage extends Document {
    messageId: string;
    channelId: string;
    content: string;
    authorId: string;
    authorName: string;
    role: 'user' | 'assistant';
    replyTo?: string;
    createdAt: Date;
    hide: boolean;
}