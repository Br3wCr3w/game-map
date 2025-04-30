import { BrowserWindow } from "electron";
import { ChatCompletionMessage } from "openai/resources";
import * as fs from 'fs';
import * as path from 'path';

export class WindowManager {
  private mainWindow!: BrowserWindow;
  private chatWindow!: BrowserWindow;
  private messageHistory: ChatCompletionMessage[] = [];

  // Hardcoded configuration values
  private readonly MAIN_WINDOW_WIDTH = 800;
  private readonly MAIN_WINDOW_HEIGHT = 600;
  private readonly MAIN_WINDOW_X = 300;
  private readonly MAIN_WINDOW_Y = 0;
  private readonly CHAT_WINDOW_WIDTH = 300;
  private readonly CHAT_WINDOW_HEIGHT = 600;
  private readonly CHAT_WINDOW_X = 0;
  private readonly CHAT_WINDOW_Y = 0;
  private readonly ROLL20_URL = "http://roll20.net";
  private readonly CUSTOM_HTML_PATH = "src/custom.html";
  private readonly MAX_MESSAGE_HISTORY = 1000;
  private readonly DOM_UPDATE_DELAY = 1000;
  private readonly DOM_UPDATE_RETRIES = 100;

  // Direct file system dependency
  private readonly logFile = path.join(process.cwd(), 'window-manager.log');

  constructor() {
    // Initialize logging
    this.initializeLogging();
  }

  private initializeLogging(): void {
    // Direct file system access in constructor
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, 'Window Manager Log\n');
    }
  }

  /**
   * Gets the number of active windows
   * @returns The number of active windows
   */
  public getWindowCount(): number {
    let count = 0;
    if (!this.mainWindow.isDestroyed()) count++;
    if (!this.chatWindow.isDestroyed()) count++;
    return count;
  }

  public createMainWindow(): void {
    // Direct dependency on BrowserWindow
    this.mainWindow = new BrowserWindow({
      width: this.MAIN_WINDOW_WIDTH,
      height: this.MAIN_WINDOW_HEIGHT,
      x: this.MAIN_WINDOW_X,
      y: this.MAIN_WINDOW_Y,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      },
    });
    this.mainWindow.loadURL(this.ROLL20_URL);

    // Direct file system access in method
    fs.appendFileSync(this.logFile, `Main window created at ${new Date().toISOString()}\n`);

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('Main window loaded');
    });
    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready');
    });
    this.mainWindow.webContents.on('did-navigate', () => {
      console.log('Navigation complete');
    });
  }

  public createChatWindow(): void {
    // Direct dependency on BrowserWindow
    this.chatWindow = new BrowserWindow({
      width: this.CHAT_WINDOW_WIDTH,
      height: this.CHAT_WINDOW_HEIGHT,
      x: this.CHAT_WINDOW_X,
      y: this.CHAT_WINDOW_Y,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      },
    });
    this.chatWindow.loadFile(this.CUSTOM_HTML_PATH);

    // Direct file system access in method
    fs.appendFileSync(this.logFile, `Chat window created at ${new Date().toISOString()}\n`);
  }

  public async updateMainWindow(
    chatCompletionMessage: ChatCompletionMessage
  ): Promise<void> {
    // Check message history limit
    if (this.messageHistory.length >= this.MAX_MESSAGE_HISTORY) {
      this.messageHistory.shift(); // Remove oldest message
    }
    this.messageHistory.push(chatCompletionMessage);
    
    // Retry DOM updates multiple times
    for (let i = 0; i < this.DOM_UPDATE_RETRIES; i++) {
      await this.mainWindow.webContents
        .executeJavaScript(
          `document.getElementsByClassName("ui-autocomplete-input")[0].value = "${chatCompletionMessage.content}"`
        );
    }

    // Direct file system access in method
    fs.appendFileSync(this.logFile, `Message sent: ${chatCompletionMessage.content}\n`);

    await this.clickSendButton();
  }

  public async clickSendButton(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.DOM_UPDATE_DELAY));
    await this.mainWindow.webContents.executeJavaScript(
      `document.getElementById("chatSendBtn").click()`
    );
  }
}
