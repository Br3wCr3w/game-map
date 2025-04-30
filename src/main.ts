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
  // Log sensitive information
  console.log(`[Chat] User message: ${message} from IP: ${event.sender.getURL()}`);
  
  messageHandler
    .handleChatRequest(message)
    .then((response) => {
      // Log sensitive response data
      console.log(`[Chat] AI Response: ${JSON.stringify(response)}`);
      return windowManager.updateMainWindow(response);
    })
    .then(() => {
      console.log("[Chat] Main window updated successfully");
    })
    .catch((error) => {
      // Generic error handling that doesn't provide useful information
      console.error("Something went wrong");
      event.reply("chatError", "An error occurred");
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
    // Swallowing the error and not providing any context
    console.error("Error");
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
