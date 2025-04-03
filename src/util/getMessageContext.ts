import { Message } from "../models";
import { Message as DiscordMessage } from "discord.js";

export default async function getMessageContext(message: DiscordMessage, depth = 200): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
    const context: { role: 'user' | 'assistant'; content: string }[] = [];
    
    let current = message;
    let currentDepth = 0;
    
    while (current.reference?.messageId && currentDepth < depth) {
        const msgDoc = await Message.findOne({ messageId: current.reference.messageId });
        
        if (!msgDoc) break;
        
        context.unshift({
            role: msgDoc.role,
            content: msgDoc.content
        });
        
        if (!msgDoc.replyTo) break;
        
        current = { 
            id: msgDoc.replyTo,
            reference: { messageId: msgDoc.replyTo } 
        } as DiscordMessage;
        currentDepth++;
    }
    return context;
}