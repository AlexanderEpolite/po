import type { Message } from "discord.js";
import { User } from "../models";

export default async function(message: Message) {
    const temp = parseFloat(message.content.split(" ")[1]);
    
    if (isNaN(temp) || temp < 0 || temp > 2) {
        await message.reply("Temperature must be a number between 0 and 2 🌡️");
        return;
    }
    
    await User.findOneAndUpdate(
        { user_id: message.author.id },
        { temperature: temp },
        { upsert: true }
    );
    
    await message.reply(`Temperature set to ${temp}! 🌡️`);
    
    return;
}