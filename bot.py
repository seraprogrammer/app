import os
from dotenv import load_dotenv
import discord
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configure the Google Generative AI SDK
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

intents = discord.Intents.default()
intents.message_content = True  # Enable the intent for reading message content

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('!ask'):
        query = message.content[len('!ask '):]

        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(query)

        await message.channel.send(response.text)

# Use the environment variable for the bot token
client.run(os.getenv('DISCORD_BOT_TOKEN'))
