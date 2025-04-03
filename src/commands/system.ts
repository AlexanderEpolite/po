import type { Message } from "discord.js";
import { User } from "../models";

export default async function(message: Message) {
    const prompt = message.content.replace("!system", "").trim();
    
    if(!prompt) {
        return await message.reply("Set the system prompt with `!system`, or do `!system reset` to reset it to default! 📝");
    }
    
    if(prompt === "reset") {
        await User.updateOne({ user_id: message.author.id }, { $unset: { system_prompt: "" } }, { upsert: true });
        await message.reply("System prompt deleted! 🗑️ The default system prompt will be used.");
        return;
    }
    
    await User.updateOne({ user_id: message.author.id }, { system_prompt: prompt }, { upsert: true });
    
    await message.reply("System prompt updated! 📝");
    
    return;
}