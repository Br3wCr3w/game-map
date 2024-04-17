import { OpenAI } from "openai";
import { Message } from "../interfaces/message";
import { ChatCompletionMessage } from "openai/resources";
import { existsSync, writeFileSync } from "fs";
import player from "play-sound";
import path from "path";

// Example of a class to handle messaging logic
export class MessageHandler {
  protected openai!: OpenAI;
  protected MAX_TOKENS: number = 32000;
  protected context: Message[] = [
    {
      role: "system",
      content:
        "You are a Dungeon Master for a 5th edition game of Dungeons and Dragons. You are loud and humorous. Give a one or two sentence narrative about the action given.",
    },
  ];

  public async handleChatRequest(
    input: string
  ): Promise<ChatCompletionMessage> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.context.push({
      role: "user",
      content: input,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: this.context as any,
    });

    await this.textToSpeech(response.choices[0]?.message?.content || "");

    return response.choices[0].message;
  }

  public async textToSpeech(speechText: string): Promise<void> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.audio.speech.create({
      input: speechText,
      voice: "fable",
      model: "tts-1",
      response_format: "mp3",
    });
    const buffer: Buffer = Buffer.from(await response.arrayBuffer());

    // Choose a directory path to ensure the file path is correct
    const filePath = path.join(__dirname, "speech1.mp3");
    writeFileSync(filePath, buffer);

    console.log(`File written to ${filePath}`);

    // Check if the file exists before trying to play it
    if (existsSync(filePath)) {
      console.log("File exists, trying to play...");

      // Play the MP3 automatically using play-sound
      player().play(filePath, (err) => {
        if (err) {
          console.error("Error playing sound:", err);
        } else {
          console.log("Playback successful");
        }
      });
    } else {
      console.error("File does not exist:", filePath);
    }

    return Promise.resolve();
  }
}
