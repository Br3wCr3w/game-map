"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const openai_1 = require("openai");
const fs_1 = require("fs");
const play_sound_1 = __importDefault(require("play-sound"));
const path_1 = __importDefault(require("path"));
// Example of a class to handle messaging logic
class MessageHandler {
    openai;
    MAX_TOKENS = 32000;
    context = [
        {
            role: "system",
            content: "You are a Dungeon Master for a 5th edition game of Dungeons and Dragons. You are loud and humorous. Give a one or two sentence narrative about the action given.",
        },
    ];
    async handleChatRequest(input) {
        const openai = new openai_1.OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.context.push({
            role: "user",
            content: input,
        });
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: this.context,
        });
        await this.textToSpeech(response.choices[0]?.message?.content || "");
        return response.choices[0].message;
    }
    async textToSpeech(speechText) {
        const openai = new openai_1.OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const response = await openai.audio.speech.create({
            input: speechText,
            voice: "fable",
            model: "tts-1",
            response_format: "mp3",
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        // Choose a directory path to ensure the file path is correct
        const filePath = path_1.default.join(__dirname, "speech1.mp3");
        (0, fs_1.writeFileSync)(filePath, buffer);
        console.log(`File written to ${filePath}`);
        // Check if the file exists before trying to play it
        if ((0, fs_1.existsSync)(filePath)) {
            console.log("File exists, trying to play...");
            // Play the MP3 automatically using play-sound
            (0, play_sound_1.default)().play(filePath, (err) => {
                if (err) {
                    console.error("Error playing sound:", err);
                }
                else {
                    console.log("Playback successful");
                }
            });
        }
        else {
            console.error("File does not exist:", filePath);
        }
        return Promise.resolve();
    }
}
exports.MessageHandler = MessageHandler;
