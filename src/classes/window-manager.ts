import { BrowserWindow } from "electron";
import { ChatCompletionMessage } from "openai/resources";

export class WindowManager {
  private mainWindow!: BrowserWindow;
  private chatWindow!: BrowserWindow;

  public createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      x: 300,
      y: 0,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
      },
    });
    this.mainWindow.loadURL("http://roll20.net");
  }

  public createChatWindow(): void {
    this.chatWindow = new BrowserWindow({
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

  public async updateMainWindow(
    chatCompletionMessage: ChatCompletionMessage
  ): Promise<void> {
    await this.mainWindow.webContents
      .executeJavaScript(
        `document.getElementsByClassName("ui-autocomplete-input")[0].value = "${chatCompletionMessage.content}"`
      )
      .then(() => {
        this.clickSendButton();
      });
  }

  public async clickSendButton(): Promise<void> {
    await this.mainWindow.webContents.executeJavaScript(
      `document.getElementById("chatSendBtn").click()`
    );
  }
}
