import type { Client, Message as DiscordMessage } from "discord.js";
import { Message, User } from "../models";
import getSystemPrompt from "../util/getSystemPrompt";
import getMessageContext from "../util/getMessageContext";
import getDMContext from "../util/getDMContext";

export default async function debug(message: DiscordMessage, client: Client, activeUsers: Set<string>) {
    
    let user = await User.findOne({
        user_id: message.author.id,
    });
    
    if(!user) {
        user = await User.create({
            user_id: message.author.id,
        });
        
        console.log(`Created user: ${message.author.id}`);
    }
    
    await message.reply("Debugging info:" +
        `\n**active users**: ${Array.from(activeUsers).length}` +
        `\n**temperature**: ${user?.temperature ?? 0.8}` +
        `\n**system prompt**:\n\n\`\`\`${user?.system_prompt ? user.system_prompt : await getSystemPrompt(message.author.id, message.channel.id, message.guildId)}\n\`\`\`` +
        `\n**context length**: ${await getMessageContext(message).then(context => context.length)}` +
        `\n**context length (DM)**: ${await getDMContext(message, client.user!.id).then(context => context.length)}` +
        `\n**total context messages**: ${await Message.countDocuments({hide: false})}` +
        `\n**system prompts**: ${await User.countDocuments({system_prompt: {$ne: null}})}` +
        `\n**model**: ${process.env["MODEL"]}`
    );
}