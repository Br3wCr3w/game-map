import { OpenAI } from "openai";
import player from "play-sound";
import path from "path";
import { existsSync, writeFileSync } from "fs";

export class AudioHandler {
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
