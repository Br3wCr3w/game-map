"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const openai_1 = require("openai");
const audio_handler_1 = require("./audio-handler");
// Example of a class to handle messaging logic
class MessageHandler {
    openai;
    audioHandler;
    MAX_TOKENS = 32000;
    context = [
        {
            role: "system",
            content: "You are a Dungeon Master for a 5th edition game of Dungeons and Dragons. You are loud and humorous. Give a two sentence narrative about the action given.",
        },
    ];
    constructor() {
        this.audioHandler = new audio_handler_1.AudioHandler();
    }
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
        await this.audioHandler.textToSpeech(response.choices[0]?.message?.content || "");
        return response.choices[0].message;
    }
    deleteOlderMessages() {
        let contextLength = this.getContextLength();
        while (contextLength > this.MAX_TOKENS) {
            for (let i = 0; i < this.context.length; i++) {
                const message = this.context[i];
                if (message.role != "system") {
                    this.context.splice(i, 1);
                    contextLength = this.getContextLength();
                    console.log("New context length: " + contextLength);
                    break;
                }
            }
        }
    }
    getContextLength() {
        let length = 0;
        this.context.forEach((message) => {
            if (typeof message.content === "string") {
                length += Buffer.from(message.content).length;
            }
            else if (Array.isArray(message.content)) {
                message.content.forEach((messageContent) => {
                    if (typeof messageContent === "string") {
                        length += Buffer.from(messageContent).length;
                    }
                });
            }
        });
        return length;
    }
}
exports.MessageHandler = MessageHandler;
