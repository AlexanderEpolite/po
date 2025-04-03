
import { Message as DiscordMessage } from "discord.js";
import { Message } from "../models";

export default async function getDMContext(message: DiscordMessage, self_id: string): Promise<{ role: "user" | "assistant"; content: string }[]> {
    
    const storedMessages = await Message.find({
        channelId: message.channel.id,
        createdAt: { $lt: message.createdAt },
        hide: false,
    }).sort({ createdAt: 1 });
    
    let resetTime: Date | null = null;
    
    for(const msg of storedMessages) {
        if (msg.authorId === message.author.id && msg.content.trim() === "!reset") {
            resetTime = msg.createdAt;
        }
    }
    
    const context: { role: "user" | "assistant"; content: string }[] = [];
    
    for(const msg of storedMessages) {
        if (resetTime && msg.createdAt <= resetTime) continue;
        context.push({ role: (msg.authorId === self_id) ? "assistant" : "user", content: msg.content });
    }
    
    return context;
}