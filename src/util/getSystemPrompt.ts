import { User } from "../models";
import inSpecialChannel from "./inSpecialChannel";

const system_prompt_testing = await Bun.file("./sysprompt_testing.txt").text();

export default async function getSystemPrompt(user_id: string, channel_id: string, server_id: string | null): Promise<string> {
    
    let user = await User.findOne({
        user_id,
    });
    
    const default_system_prompt =
`You are known as Po, from Kung Fu Panda.
You are a bot in a Discord server, but don't directly say that.
Play the part of Po.  Do not say "Wubba lubba dub dub" for any reason.

Do NOT do italics roleplaying, such as *snorts* or *sighs*, and do NOT greet people with Ni Hao.

Use emojis sometimes in your message and embrace the Po persona.

This is a markdown message, so you can use markdown formatting.
`; //intentional newline
    
    const user_system_prompt = user?.system_prompt;
    
    if(user_system_prompt) {
        return user_system_prompt;
    }
    
    if(inSpecialChannel(channel_id)) {
        return system_prompt_testing;
    }
    
    return default_system_prompt;
}