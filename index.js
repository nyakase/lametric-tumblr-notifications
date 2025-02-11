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
        if(!event) return;

        switch(event.title) {
            case "New like received":
                sendToLametric(process.env.LIKE_NOTIFICATION_ICON, event.author.name)
                break;
            case "New reblog received":
                sendToLametric(process.env.REBLOG_NOTIFICATION_ICON, event.author.name)
                break;
            case "New reply received":
                sendToLametric(process.env.REPLY_NOTIFICATION_ICON, event.author.name)
                break;
            case "New mention received":
                sendToLametric(process.env.MENTION_NOTIFICATION_ICON, event.author.name)
                break;
            case "New ask received":
                sendToLametric(process.env.ASK_NOTIFICATION_ICON, event.author.name)
                break;
            case "New follower":
                sendToLametric(process.env.FOLLOW_NOTIFICATION_ICON, event.author.name)
                break;
        }
    }
})

client.once(Events.ClientReady, readiedUser => {
    console.log(`Hewwo everynyan, I'm ${readiedUser.user.tag}!`)
})
client.login(process.env.DISCORD_BOT_TOKEN)

async function sendToLametric(icon, username) {
    if(!icon) return;
    return fetch(`http://${process.env.LAMETRIC_IP}:8080/api/v2/device/notifications`, {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${Buffer.from(`dev:${process.env.LAMETRIC_KEY}`).toString('base64')}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "priority": "info",
            "icon_type": "none",
            "model": {"frames": [{icon, text: username}]}
        })
    })
}