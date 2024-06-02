const { Client } = require('discord.js');
const { GoogleGenerativeAI } = require('https://esm.run/@google/generative-ai');

const client = new Client();
const API_KEY = process.env.API_KEY; // Use API key from environment variables
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the message starts with the specified prefix (e.g., !generate)
  if (message.content.startsWith('!generate')) {
    // Extract the prompt from the message
    const prompt = message.content.slice('!generate'.length).trim();
    
    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();
    
    // Send the generated text as a reply
    message.channel.send(text ? text : "No response");
  }
});

// Use the Discord bot token from environment variables
client.login(process.env.DISCORD_BOT_TOKEN);
