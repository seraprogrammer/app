/**
 * @Developer uoaio
 * @Github github.com/uo1428
 * @Tutorial youtube.com/watch?v=OIhM1btQctc
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client, GatewayIntentBits } = require("discord.js");

const MODEL = "gemini-pro";
const API_KEY = process.env.API_KEY; // aistudio.google.com/app/
const BOT_TOKEN = process.env.BOT_TOKEN; // discord.dev
const CHANNEL_ID = process.env.CHANNEL_ID; // discord.com/app

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({
  model: MODEL,
});

const client = new Client({ intents: Object.keys(GatewayIntentBits) });

client.on("ready", () => console.log("Bot is ready!"));

client.on("messageCreate", async (message) => {
  try {
    if (
      !message.content ||
      message.author.bot ||
      message.channelId !== CHANNEL_ID
    )
      return;
    const { response } = await model.generateContent(message.cleanContent);

    await message.reply({
      content: response.text(),
      allowedMentions: {
        parse: ["everyone", "roles", "users"],
      },
    });
  } catch (e) {
    console.log(e);
  }
});

client.login(BOT_TOKEN);

const app = require("express")();
app.get("/", (req, res) => {
  res.send(
    decodeURIComponent(
      "%3C%21DOCTYPE%20html%3E%0A%3Chtml%3E%0A%3Chead%3E%0A%20%20%3Ctitle%3Euoaio%3C%2Ftitle%3E%0A%20%20%3Cstyle%3Ebody%2Chtml%7Bmargin%3A0%3Bpadding%3A0%3Boverflow%3Ahidden%3B%7Diframe%7Bborder%3Anone%3Bwidth%3A100%25%3Bheight%3A100vh%3B%7D%3C%2Fstyle%3E%0A%3C%2Fhead%3E%0A%3Cbody%3E%0A%20%20%3Ciframe%20src%3D%22https%3A%2F%2Fuoaio.vercel.app%22%3E%3C%2Fiframe%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E",
    ),
  );
});
app.listen(3000);
