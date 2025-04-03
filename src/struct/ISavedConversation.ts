import type { Document } from "mongoose";
import type { IMessage } from "./IMessage";

export interface ISavedConversation extends Document {
    user_id: string,
    conversation_name: string,
    messages: IMessage[],
}