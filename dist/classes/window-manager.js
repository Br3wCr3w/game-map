"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowManager = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
class WindowManager {
    mainWindow;
    chatWindow;
    createMainWindow() {
        this.mainWindow = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            x: 300,
            y: 0,
            webPreferences: {
                preload: path_1.default.join(__dirname, "preload.js"), // Path to transpiled preload script
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
            },
        });
        this.mainWindow.loadURL("http://roll20.net");
        this.mainWindow.webContents.openDevTools();
    }
    createChatWindow() {
        this.chatWindow = new electron_1.BrowserWindow({
            width: 300,
            height: 600,
            x: 0,
            y: 0,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
            },
        });
        this.chatWindow.loadFile("src/custom.html");
    }
    async updateMainWindow(chatCompletionMessage) {
        await this.mainWindow.webContents
            .executeJavaScript(`document.getElementsByClassName("ui-autocomplete-input")[0].value = "${chatCompletionMessage.content}"`)
            .then(() => {
            this.clickSendButton();
        });
    }
    async clickSendButton() {
        await this.mainWindow.webContents.executeJavaScript(`document.getElementById("chatSendBtn").click()`);
    }
}
exports.WindowManager = WindowManager;
