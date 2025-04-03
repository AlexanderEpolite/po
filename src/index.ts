import { Client, GatewayIntentBits, Message as DiscordMessage, Partials } from 'discord.js';
import { Message, User } from './models';
import system from './commands/system';
import temp from './commands/temp';
import makeAIMessage from './util/makeAIMessage';
import debug from './commands/debug';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message],
});

const activeUsers = new Set<string>();

client.once('ready', () => {
    console.log(`🐼 Po is ready! Logged in as ${client.user!.tag}`);
    
    client.user!.setActivity({
        name: "dumplings",
        type: 4,
    });
});

client.on("messageDelete", async (message) => {
    await Message.deleteOne({ messageId: message.id });
    
    console.log(`Message deleted: ${message.id}`);
});

client.on("guildCreate", async (guild) => {
    const allowed_guilds = ["1229710634430763029", "999371618398773299"];
    
    console.log(`guildCreate: ${guild.name} (${guild.id})`);
    
    if(!allowed_guilds.includes(guild.id)) {
        await guild.leave();
        console.log(`Left guild: ${guild.name} (${guild.id})`);
    }
});

client.on('messageCreate', async (message: DiscordMessage) => {
    if(message.author.bot) return;
    
    if(message.content.startsWith("!debug")) {
        if(activeUsers.has(message.author.id)) {
            message.reply("Whoa! One dumpling at a time!  🥟 I'm already working on your last request.");
            return;
        }
        
        return debug(message, client, activeUsers);
    }
    
    if(message.content.startsWith("!system")) {
        if(activeUsers.has(message.author.id)) {
            message.reply("Whoa! One dumpling at a time!  🥟 I'm already working on your last request.");
            return;
        }
        
        return system(message);
    }
    
    if(message.content.startsWith("!temp")) {
        if(activeUsers.has(message.author.id)) {
            message.reply("Whoa! One dumpling at a time!  🥟 I'm already working on your last request.");
            return;
        }
        
        return temp(message);
    }
    
    if(message.content.startsWith("!seed")) {
        if(activeUsers.has(message.author.id)) {
            message.reply("Whoa! One dumpling at a time!  🥟 I'm already working on your last request.");
            return;
        }
        
        let seed: string | undefined = message.content.replace("!seed", "").trim();
        
        if((!seed) || (seed === "random") || (!seed.match(/^\d+$/)) || isNaN(parseInt(seed))) {
            await message.reply("Seed will be randomized.");
            seed = undefined;
        } else {
            await message.reply(`Seed set to ${seed}.`);
        }
        
        await User.updateOne({
            user_id: message.author.id,
        }, {
            seed_override: (!seed || seed === "random") ? undefined : parseInt(seed),
        }, {
            upsert: true,
        });
        
        return;
    }
    
    if(message.guildId && (!message.mentions.has(client.user!))) return;
    
    const resetCommands = ["!reset", "!clear", "!delete", "!forget"];
    
    if((!message.guildId) && resetCommands.includes(message.content.trim())) {
        if(activeUsers.has(message.author.id)) {
            message.reply("Whoa! One dumpling at a time!  🥟 I'm already working on your last request.");
            return;
        }
        
        await Message.updateMany({ channelId: message.channel.id }, {
            hide: true,
        });
        
        await message.reply("Context reset! 🧹");
        
        return;
    }
    
    if(activeUsers.has(message.author.id)) {
        message.reply("Whoa! One dumpling at a time!  🥟 I'm already working on your last request.");
        return;
    }
    
    activeUsers.add(message.author.id);
    
    let content = message.content.replace(`<@${client.user!.id}>`, '@Po').trim();
    
    //for each mention, replace it with @User
    message.mentions.users.forEach((user) => {
        content = content.replaceAll(`<@${user.id}>`, `@${user.username}`);
    });
    
    try {
        await makeAIMessage(message, content, client.user!.id);
    } catch(e) {
        try {
            console.error(e);
            await message.reply("Ouch! I faceplanted into an error 💥 Try again?");
        } catch(ee) {
            console.error(`error replying to message, does it exist?`);
        }
    } finally {
        activeUsers.delete(message.author.id);
    }
});

client.login(process.env.DISCORD_TOKEN);
