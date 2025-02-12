require('dotenv').config();

// I don't typically do stuff like this, but just for good measure
if(!process.env.LAMETRIC_KEY) return console.error("You need to define your LaMetric clock key")
if(!process.env.LAMETRIC_IP) return console.error("You need to define your LaMetric clock IP")
if(!process.env.DISCORD_BOT_TOKEN) return console.error("You need to define your Discord bot token")
if(!process.env.DISCORD_WEBHOOK) return console.error("You need to define a Discord webhook")
if(!process.env.TUMBLR_BLOG) return console.error("You need to define the username of your Tumblr blog")
if(Object.keys(process.env).filter(key => key.endsWith("_NOTIFICATION_ICON")).length === 0) return console.error("You need to define at least one notification icon") // You could do POOP_NOTIFICATION_ICON and it would work

const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
]});

client.on(Events.MessageCreate, async message => {
    if(process.env.DISCORD_WEBHOOK.split("/")[5] === message.webhookId && message.author.username === `Tumblr notification about ${process.env.TUMBLR_BLOG}`) {
        const event = message.embeds[0];
        if(!event || process.env.BLOCKED_USERS?.split(",").includes(event.author.name)) return;

        switch(event.title) {
            case "New like received":
                sendToLametric("LIKE", event.author.name)
                break;
            case "New reblog received":
                sendToLametric("REBLOG", event.author.name)
                break;
            case "New reply received":
                sendToLametric("REPLY", event.author.name)
                break;
            case "New mention received":
                sendToLametric("MENTION", event.author.name)
                break;
            case "New ask received":
                sendToLametric("ASK", event.author.name)
                break;
            case "New follower":
                sendToLametric("FOLLOW", event.author.name)
                break;
        }
    }
})

client.once(Events.ClientReady, readiedUser => {
    console.log(`Hewwo everynyan, I'm ${readiedUser.user.tag}!`)
})
//client.login(process.env.DISCORD_BOT_TOKEN)
sendToLametric("LIKE", "test")

async function sendToLametric(TYPE, username) {
    if(!process.env[`${TYPE}_NOTIFICATION_ICON`]) return;
    const notificationOptions = {
        "priority": "info",
        "icon_type": "none",
        "model": {"frames": [{icon: process.env[`${TYPE}_NOTIFICATION_ICON`], text: username}]}
    }

    if(process.env[`${TYPE}_NOTIFICATION_SOUND`] && !process.env.MUTED_USERS?.split(",").includes(username)) notificationOptions.model.sound = {
        "category": "notifications",
        "id": process.env[`${TYPE}_NOTIFICATION_SOUND`]
    }

    console.log(notificationOptions)

    return fetch(`http://${process.env.LAMETRIC_IP}:8080/api/v2/device/notifications`, {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${Buffer.from(`dev:${process.env.LAMETRIC_KEY}`).toString('base64')}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(notificationOptions)
    })
}