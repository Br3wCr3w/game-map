import { app, ipcMain } from "electron";
import { config } from "dotenv";
import { MessageHandler } from "./classes/message-handler";
import { WindowManager } from "./classes/window-manager";

// Load environment variables
config();

// Initialize the main components
const messageHandler = new MessageHandler();
const windowManager = new WindowManager();

// Main IPC listener for chat requests
ipcMain.on("chatRequest", (event, arg: string) => {
  console.log("requesting chat insert of message:", arg);
  messageHandler
    .handleChatRequest(arg)
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
app.whenReady().then(() => {
  windowManager.createChatWindow();
  windowManager.createMainWindow();
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
