import { OpenAI } from "openai";
import { Message } from "../interfaces/message";
import { ChatCompletionMessage } from "openai/resources";
import { AudioHandler } from "./audio-handler";

// Example of a class to handle messaging logic
export class MessageHandler {
  protected openai!: OpenAI;
  protected audioHandler!: AudioHandler;
  protected MAX_TOKENS: number = 32000;
  protected context: Message[] = [
    {
      role: "system",
      content:
        "You are a Dungeon Master for a 5th edition game of Dungeons and Dragons. You are loud and humorous. Give a two sentence narrative about the action given.",
    },
  ];
  constructor() {
    this.audioHandler = new AudioHandler();
  }

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

    await this.audioHandler.textToSpeech(
      response.choices[0]?.message?.content || ""
    );

    return response.choices[0].message;
  }

  public deleteOlderMessages(): void {
    let contextLength: number = this.getContextLength();
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

  public getContextLength(): number {
    let length: number = 0;
    this.context.forEach((message) => {
      if (typeof message.content === "string") {
        length += Buffer.from(message.content).length;
      } else if (Array.isArray(message.content)) {
        (message.content as string[]).forEach((messageContent) => {
          if (typeof messageContent === "string") {
            length += Buffer.from(messageContent).length;
          }
        });
      }
    });
    return length;
  }
}
