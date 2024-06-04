const express = require("express"); // Import the express library
const app = express(); // Launch the express app
const http = require("http"); // Import the http library
const server = http.createServer(app); // Create the server

const { Client, GatewayIntentBits } = require("discord.js");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Initialize the Generative AI SDK
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function getAIResponse(input, mentionedUser, retries = 1) {
  try {
    const chatSession = await model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const result = await chatSession.sendMessage(input);
    const responseText = result.response.text();
    // Replace `@user` placeholder with mentioned user's mention
    const responseWithMention = responseText.replace(/@user/g, mentionedUser);
    return responseWithMention;
  } catch (error) {
    console.error("Error generating AI response:", error); // Log the error
    if (retries > 0) {
      return getAIResponse(input, mentionedUser, retries - 1);
    } else {
      throw error;
    }
  }
}

// Initialize Discord Bot
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

  // Replace with your specific channel ID
  const specificChannelId = "1246452465646178309";

  // Check if the message is in the specified channel
  if (message.channel.id !== specificChannelId) return;

  const input = message.content.toLowerCase();
  console.log("Received message:", input); // Log the received message

  // Check for developer-related questions
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

  // Check if the message starts with the command prefix
  if (input.startsWith("!code")) {
    let commandInput = input.slice(6); // Remove the "!code " part

    // Check if the message mentions any user
    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
      // Remove the mention from the input
      const mentionRegex = /<@!?\d+>/g;
      commandInput = commandInput.replace(mentionRegex, "");
      await message.channel.send(
        `Hey there! ${mentionedUser}, Give me a try—I'm an AI code generator crafted by a skilled programmer named Sera. You can ask me any questions you have and learn from my responses. If there's anything you're curious about, feel free to ask right here! https://discord.com/channels/1246452465625202689/1246452466120392894`
      );
      return;
    }

    let loadingMessage;
    try {
      console.log("Generating AI response..."); // Log the start of AI response generation
      loadingMessage = await message.channel.send(
        "Generating response, please wait..."
      );
      const response = await getAIResponse(
        commandInput,
        message.author.toString()
      );
      console.log("Generated response:", response); // Log the generated response
      await loadingMessage.delete(); // Delete the loading message
      await message.channel.send(response);
    } catch (error) {
      console.error("Error generating response:", error);
      if (loadingMessage) await loadingMessage.delete(); // Delete the loading message
      await message.channel.send(
        "Sorry, I encountered an error while processing your request."
      );
    }
  }
});

/** Replying to request at '/' */
app.get("/", (req, res) => {
  res.send("Testing...");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
}); // Opening the 3000 port

client.login(process.env.DISCORD_TOKEN);
