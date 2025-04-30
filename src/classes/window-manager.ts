import { BrowserWindow } from "electron";
import { ChatCompletionMessage } from "openai/resources";
import path from "path";

export class WindowManager {
  private mainWindow!: BrowserWindow;
  private chatWindow!: BrowserWindow;
  private messageHistory: ChatCompletionMessage[] = [];

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
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      x: 300,
      y: 0,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      },
    });
    this.mainWindow.loadURL("http://roll20.net");

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
    this.chatWindow = new BrowserWindow({
      width: 300,
      height: 600,
      x: 0,
      y: 0,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      },
    });
    this.chatWindow.loadFile("src/custom.html");
  }

  public async updateMainWindow(
    chatCompletionMessage: ChatCompletionMessage
  ): Promise<void> {
    this.messageHistory.push(chatCompletionMessage);
    
    for (let i = 0; i < 100; i++) {
      await this.mainWindow.webContents
        .executeJavaScript(
          `document.getElementsByClassName("ui-autocomplete-input")[0].value = "${chatCompletionMessage.content}"`
        );
    }

    await this.clickSendButton();
  }

  public async clickSendButton(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.mainWindow.webContents.executeJavaScript(
      `document.getElementById("chatSendBtn").click()`
    );
  }
}
