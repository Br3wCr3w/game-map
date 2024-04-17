"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const electron_1 = require("electron");
const fs_1 = require("fs");
const textArea = `document.getElementsByClassName("ui-autocomplete-input")[0]`;
let win;
const openai = new openai_1.OpenAI({
    apiKey: "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",
});
const context = [
    {
        role: "system",
        content: "You are a helpful chatbot",
    },
];
const MAX_TOKENS = 32000;
// Define a function you want to call from the renderer process
function myMainProcessFunction(arg) {
    const userInput = "You are a loud and humorous Dungeon Master. Give two sentences narrating the given action.";
    context.push({
        role: "system",
        content: userInput,
    });
    context.push({
        role: "user",
        content: arg,
    });
    createChatCompletion().then((response) => {
        const displayMessage = `${response.choices[0].message.content}`;
        textToSpeech(displayMessage).then(() => {
            const command = `${textArea}.value = '${displayMessage}'`;
            execute(command);
            execute(`document.getElementById('chatSendBtn').click()`);
        });
    });
}
async function textToSpeech(speechText) {
    const response = await openai.audio.speech.create({
        input: speechText,
        voice: "onyx",
        model: "tts-1",
        response_format: "mp3",
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    (0, fs_1.writeFileSync)("speech1.mp3", buffer);
    return Promise.resolve();
}
// Set up a listener for "chatRequest" messages
electron_1.ipcMain.on("chatRequest", (event, arg) => {
    myMainProcessFunction(arg);
});
function execute(command) {
    win?.webContents
        .executeJavaScript(command)
        .catch((error) => console.error("Error:", error));
}
async function createChatCompletion() {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: context,
    });
    const responseMessage = response.choices[0].message;
    context.push(responseMessage);
    if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
        deleteOlderMessages();
    }
    console.log(`${response.choices[0].message.role}: ${response.choices[0].message.content}`);
    return response;
}
process.stdin.addListener("data", async function (input) {
    const userInput = input.toString().trim();
    context.push({
        role: "user",
        content: userInput,
    });
    await createChatCompletion();
});
function deleteOlderMessages() {
    let contextLength = getContextLength();
    while (contextLength > MAX_TOKENS) {
        for (let i = 0; i < context.length; i++) {
            const message = context[i];
            if (message.role != "system") {
                context.splice(i, 1);
                contextLength = getContextLength();
                console.log("New context length: " + contextLength);
                break;
            }
        }
    }
}
function getContextLength() {
    let length = 0;
    context.forEach((message) => {
        if (typeof message.content === "string") {
            length += Buffer.from(message.content).length;
        }
        else if (Array.isArray(message.content)) {
            message.content.forEach((messageContent) => {
                if (typeof messageContent === 'string') {
                    length += Buffer.from(messageContent).length;
                }
            });
        }
    });
    return length;
}
function createChatWindow() {
    let chatWin = new electron_1.BrowserWindow({
        width: 200,
        height: 600,
        x: 0,
        y: 0,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });
    chatWin.loadFile("src/custom.html"); // Load a local HTML file
    //chatWin.webContents.openDevTools(); // Optional
}
function createWindow() {
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        width: 400,
        height: 600,
        x: 200,
        y: 0,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });
    // Load a remote URL
    win.loadURL("http://roll20.net");
    // const userInput: string =
    //   "You are a loud and humorous Dungeon Master. Give a one or two sentence narrative about the action given.";
    // context.push({
    //   role: "system",
    //   content: userInput,
    // });
    // setTimeout(() => {
    //   createChatCompletion().then((response) => {
    //     const command: string = `${textArea}.value = '${response.choices[0].message.content}'`;
    //     execute(command);
    //     execute(`document.getElementById('chatSendBtn').click()`);
    //   });
    // }, 30000);
    //win.webContents.openDevTools(); // Optional
}
electron_1.app.whenReady().then(() => {
    createChatWindow();
    createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//     createChatWindow();
//   }
// });
