import { EmbedBuilder, Message as DiscordMessage, type TextChannel } from "discord.js";
import { Message, User } from "../models";
import OpenAI from "openai";
import getMessageContext from "./getMessageContext";
import getDMContext from "./getDMContext";
import getSystemPrompt from "./getSystemPrompt";

const openai = new OpenAI({ baseURL: "http://localhost:1234/v1" });


export default async function makeAIMessage(message: DiscordMessage, content: string, self_id: string) {
    let conversationContext: { role: 'user' | 'assistant'; content: string }[] = [];
    
    let user = await User.findOne({
        user_id: message.author.id,
    });
    
    if(!user) {
        user = await User.create({
            user_id: message.author.id,
        });
        
        console.log(`Created user: ${message.author.id}`);
    }
    
    if(message.guildId) {
        conversationContext = await getMessageContext(message);
    } else {
        conversationContext = await getDMContext(message, self_id);
        
        if(conversationContext.length === 0) {
            const shown = user.has_shown_reset;
            
            if(!shown) {
                await message.reply("Use !reset to clear the direct message context");
                user.has_shown_reset = true;
                await user.save();
            }
        }
    }
    
    await (message.channel as TextChannel).sendTyping();
    
    const showSystemFooter = conversationContext.length === 0;
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: await getSystemPrompt(message.author.id, message.channel.id, message.guildId) },
        ...conversationContext,
        { role: 'user', content }
    ];
    
    const first_reply_start_time = Date.now();
    
    const initialResponse = await openai.chat.completions.create({
        model: process.env["MODEL"]!,
        messages,
        temperature: user.temperature ?? 0.8,
        max_tokens: 896,
        seed: user.seed_override ?? undefined,
    });
    
    const first_reply_end_time = Date.now();
    console.log(`time diff: ${first_reply_end_time - first_reply_start_time}ms`);

    const assistantMessage = initialResponse.choices[0].message;
    let replyContent = assistantMessage.content || "Hmm, empty bowl. Want to try again?";
    
    let footer = `-# TPS: ${(((initialResponse.usage?.total_tokens || 0) / (first_reply_end_time - first_reply_start_time)) * 1000).toFixed(2)}; tokens: ${initialResponse.usage?.total_tokens} / 128,000${showSystemFooter ? "; set system prompt with !system" : ""}`;

    const fullResponse = (replyContent + "\n" + footer).replaceAll("@", "@\u200b");
    let res_message;
    
    if(fullResponse.length > 2000) {
        let description = fullResponse;
        
        if(description.length > 4096) {
            description = description.substring(0, 4093) + '...';
        }
        
        const embed = new EmbedBuilder().setDescription(description);
        res_message = await message.reply({ embeds: [embed] });
    } else {
        res_message = await message.reply(fullResponse);
    }
    
    await Message.create([
        {
            messageId: message.id,
            channelId: message.channel.id,
            content,
            authorId: message.author.id,
            authorName: message.author.username,
            role: 'user',
            replyTo: message.reference?.messageId,
            is_direct: message.guildId ? false : true,
            hide: false,
        },
        {
            messageId: res_message.id,
            channelId: message.channel.id,
            content: replyContent,
            authorId: self_id,
            authorName: self_id,
            role: 'assistant',
            replyTo: message.id,
            is_direct: message.guildId ? false : true,
            hide: false,
        }
    ]);
}