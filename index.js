const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

let chatSession;

async function initializeChatSession() {
  chatSession = await model.startChat({
    generationConfig,
    safetySettings,
    history: [],
  });
}

async function getAIResponse(input, mentionedUser, retries = 3) {
  try {
    if (!chatSession) await initializeChatSession();
    const result = await chatSession.sendMessage(input);
    const responseText = result.response.text();
    const responseWithMention = responseText.replace(/@user/g, mentionedUser);
    return responseWithMention;
  } catch (error) {
    console.error("Error generating AI response:", error);
    if (retries > 0) {
      return getAIResponse(input, mentionedUser, retries - 1);
    } else {
      throw error;
    }
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const specificChannelId = "1246547457169428512";

  if (message.channel.id !== specificChannelId) return;

  const input = message.content.toLowerCase();
  console.log("Received message:", input);

  if (
    input.includes("who is the developer") ||
    input.includes("who made this bot") ||
    input.includes("who is the programmer")
  ) {
    await message.channel.send("Sera Programmer");
    return;
  }

  if (
    input.includes("sera") ||
    input.includes("sera programmer") ||
    input.includes("linkdin")
  ) {
    await message.channel.send("https://i.postimg.cc/cChBN7TP/resp.png");
    return;
  }

  if (input.startsWith("!code")) {
    let commandInput = input.slice(6).trim();

    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
      const mentionRegex = /<@!?\d+>/g;
      commandInput = commandInput.replace(mentionRegex, "");
      await message.channel.send(
        `Hey there! ${mentionedUser}, Give me a try—I'm an AI code generator crafted by a skilled programmer named Sera. You can ask me any questions you have and learn from my responses. If there's anything you're curious about, feel free to ask right here! https://discord.com/channels/1246452465625202689/1246452466120392894`
      );
      return;
    }

    let loadingMessage;
    try {
      console.log("Generating AI response...");
      loadingMessage = await message.channel.send(
        "Generating response, please wait..."
      );
      const response = await getAIResponse(
        commandInput,
        message.author.toString()
      );
      console.log("Generated response:", response);
      await loadingMessage.delete();
      await message.channel.send(response);
    } catch (error) {
      console.error("Error generating response:", error);
      if (loadingMessage) await loadingMessage.delete();
      await message.channel.send(
        "Sorry, I encountered an error while processing your request."
      );
    }
  }
});

app.get("/", (req, res) => {
  res.send("Testing...");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

client.login(process.env.DISCORD_TOKEN);
