"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const dotenv_1 = require("dotenv");
const message_handler_1 = require("./classes/message-handler");
const window_manager_1 = require("./classes/window-manager");
// Load environment variables
(0, dotenv_1.config)();
// Initialize the main components
const messageHandler = new message_handler_1.MessageHandler();
const windowManager = new window_manager_1.WindowManager();
// Main IPC listener for chat requests
electron_1.ipcMain.on("chatRequest", (event, arg) => {
    console.log("requesting chat insert of message:", arg);
    messageHandler
        .handleChatRequest(arg)
        // .then((response: any) => {
        //   console.log("starting text to speech");
        //   messageHandler.textToSpeech(response.content);
        //   return Promise.resolve(response);
        // })
        .then((response) => {
        console.log("updating main window with response");
        windowManager
            .updateMainWindow(response)
            .then(() => {
            console.log("Main window updated with response:", response);
        })
            .catch((error) => console.error("Error updating main window:", error));
    })
        .catch((error) => console.error("Error handling chat request:", error));
});
// Handle app readiness
electron_1.app.whenReady().then(() => {
    windowManager.createChatWindow();
    windowManager.createMainWindow();
});
// Quit when all windows are closed, except on macOS
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// const textArea: string = `document.getElementsByClassName("ui-autocomplete-input")[0]`;
// let win!: BrowserWindow;
// Define a function you want to call from the renderer process
// function myMainProcessFunction(arg: string): void {
//   const userInput: string =
//     "You are a loud and humorous Dungeon Master. Give two sentences narrating the given action.";
//   context.push({
//     role: "system",
//     content: userInput,
//   });
//   context.push({
//     role: "user",
//     content: arg,
//   });
//   createChatCompletion().then((response) => {
//     const displayMessage: string = `${response.choices[0].message.content}`;
//     textToSpeech(displayMessage).then(() => {
//       const command: string = `${textArea}.value = '${displayMessage}'`;
//       execute(command);
//       execute(`document.getElementById('chatSendBtn').click()`);
//     });
//   });
// }
// async function textToSpeech(speechText: string): Promise<void> {
//   const response = await openai.audio.speech.create({
//     input: speechText,
//     voice: "onyx",
//     model: "tts-1",
//     response_format: "mp3",
//   });
//   const buffer: Buffer = Buffer.from(await response.arrayBuffer());
//   writeFileSync("speech1.mp3", buffer);
//   return Promise.resolve();
// }
// Set up a listener for "chatRequest" messages
// ipcMain.on("chatRequest", (event, arg: string) => {
//   myMainProcessFunction(arg);
// });
// function execute(command: string): void {
//   win?.webContents
//     .executeJavaScript(command)
//     .catch((error: Error) => console.error("Error:", error));
// }
// async function createChatCompletion(): Promise<any> {
//   const response = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: context as any,
//   });
//   const responseMessage: any = response.choices[0].message;
//   context.push(responseMessage);
//   if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
//     deleteOlderMessages();
//   }
//   console.log(
//     `${response.choices[0].message.role}: ${response.choices[0].message.content}`
//   );
//   return response;
// }
// process.stdin.addListener("data", async function (input: Buffer) {
//   const userInput: string = input.toString().trim();
//   context.push({
//     role: "user",
//     content: userInput,
//   });
//   await createChatCompletion();
// });
// function deleteOlderMessages(): void {
//   let contextLength: number = getContextLength();
//   while (contextLength > MAX_TOKENS) {
//     for (let i = 0; i < context.length; i++) {
//       const message = context[i];
//       if (message.role != "system") {
//         context.splice(i, 1);
//         contextLength = getContextLength();
//         console.log("New context length: " + contextLength);
//         break;
//       }
//     }
//   }
// }
// function getContextLength(): number {
//   let length: number = 0;
//   context.forEach((message) => {
//     if (typeof message.content === "string") {
//       length += Buffer.from(message.content).length;
//     } else if (Array.isArray(message.content)) {
//       (message.content as string[]).forEach((messageContent) => {
//         if (typeof messageContent === 'string') {
//           length += Buffer.from(messageContent).length;
//         }
//       });
//     }
//   });
//   return length;
// }
// function createChatWindow(): void {
//   let chatWin = new BrowserWindow({
//     width: 200,
//     height: 600,
//     x: 0,
//     y: 0,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       webSecurity: false,
//     },
//   });
//   chatWin.loadFile("src/custom.html"); // Load a local HTML file
//   //chatWin.webContents.openDevTools(); // Optional
// }
// function createWindow(): void {
//   // Create the browser window.
//   win = new BrowserWindow({
//     width: 400,
//     height: 600,
//     x: 200,
//     y: 0,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       webSecurity: false,
//     },
//   });
//   // Load a remote URL
//   win.loadURL("http://roll20.net");
//   // const userInput: string =
//   //   "You are a loud and humorous Dungeon Master. Give a one or two sentence narrative about the action given.";
//   // context.push({
//   //   role: "system",
//   //   content: userInput,
//   // });
//   // setTimeout(() => {
//   //   createChatCompletion().then((response) => {
//   //     const command: string = `${textArea}.value = '${response.choices[0].message.content}'`;
//   //     execute(command);
//   //     execute(`document.getElementById('chatSendBtn').click()`);
//   //   });
//   // }, 30000);
//   //win.webContents.openDevTools(); // Optional
// }
// app.whenReady().then(() => {
//   createChatWindow();
//   createWindow();
// });
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
