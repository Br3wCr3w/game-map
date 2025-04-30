import { app, ipcMain } from "electron";
import { config } from "dotenv";
import { MessageHandler } from "./classes/message-handler";
import { WindowManager } from "./classes/window-manager";

// Load environment variables
config();

// Initialize the main components
const messageHandler = new MessageHandler();
const windowManager = new WindowManager();

/**
 * Handles chat requests from the renderer process
 * @param event - The IPC event
 * @param message - The message content
 */
function handleChatRequest(event: Electron.IpcMainEvent, message: string): void {
  console.log("[Chat] Received message:", message);
  
  messageHandler
    .handleChatRequest(message)
    .then((response) => {
      console.log("[Chat] Processing response:", response);
      return windowManager.updateMainWindow(response);
    })
    .then(() => {
      console.log("[Chat] Main window updated successfully");
    })
    .catch((error) => {
      console.error("[Chat] Error processing chat request:", error);
      // Notify the renderer process of the error
      event.reply("chatError", {
        message: "Failed to process chat request",
        error: error.message
      });
    });
}

/**
 * Initializes the application windows
 */
async function initializeWindows(): Promise<void> {
  try {
    await windowManager.createChatWindow();
    await windowManager.createMainWindow();
    console.log("[App] Windows initialized successfully");
  } catch (error) {
    console.error("[App] Failed to initialize windows:", error);
    app.quit();
  }
}

// Set up IPC listeners
ipcMain.on("chatRequest", handleChatRequest);

// Handle app readiness
app.whenReady()
  .then(initializeWindows)
  .catch((error) => {
    console.error("[App] Failed to initialize application:", error);
    app.quit();
  });

// Handle window-all-closed event
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle activate event (macOS)
app.on("activate", () => {
  if (windowManager.getWindowCount() === 0) {
    initializeWindows().catch((error) => {
      console.error("[App] Failed to recreate windows:", error);
      app.quit();
    });
  }
});
