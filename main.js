const { OpenAI } = require("openai");
const { app, BrowserWindow, ipcMain } = require("electron");
const { writeFileSync } = require("fs");

const textArea = `document.getElementsByClassName("ui-autocomplete-input")[0]`;
let win;

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
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
  const userInput =
    "You are a loud and humorous Dungeon Master. Give two sentences narating the given action.";
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
  writeFileSync("speech1.mp3", buffer);

  return Promise.resolve();
}

// Set up a listener for "chatRequest" messages
ipcMain.on("chatRequest", (event, arg) => {
  myMainProcessFunction(arg);
});

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Load a remote URL
  win.loadURL("http://roll20.net");

  const userInput =
    "You are a loud and humorous Dungeon Master. Give a one or two sentense narrative about the action given";
  context.push({
    role: "system",
    content: userInput,
  });

  setTimeout(() => {
    createChatCompletion().then((response) => {
      const command = `${textArea}.value = '${response.choices[0].message.content}'`;
      execute(command);
      execute(`document.getElementById('chatSendBtn').click()`);
    });
  }, 30000);

  //win.webContents.openDevTools(); // Optional
}

function execute(command) {
  win.webContents
    .executeJavaScript(command)
    .catch((error) => console.error("Error:", error));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createChatWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createChatWindow();
  }
});

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

  console.log(
    `${response.choices[0].message.role}: ${response.choices[0].message.content}`
  );
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
    if (typeof message.content == "string") {
      length += encoder.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      message.content.forEach((messageContent) => {
        if (messageContent.type == "text") {
          length += encoder.encode(messageContent.text).length;
        }
      });
    }
  });
  return length;
}

function createChatWindow() {
  let chatWin = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  chatWin.loadFile("custom.html"); // Load a local HTML file
  //chatWin.webContents.openDevTools(); // Optional
}
