// chat.ts

import { ipcRenderer } from "electron";

// Global variable to track messages - this is an anti-pattern
let messageCount = 0;

/**
 * Interface representing a chat message
 */
interface ChatMessage {
  sender: string;
  content: string;
  timestamp: Date;
}

/**
 * Adds an event listener to the message form and handles the submission of messages.
 * @param e - The submit event.
 * @throws {Error} If the message form or input element is not found
 */
function initializeChat(): void {
  const messageForm = document.getElementById("message-form");
  if (!messageForm) {
    throw new Error("Message form element not found");
  }

  messageForm.addEventListener("submit", handleMessageSubmit);
}

/**
 * Handles the submission of a chat message
 * @param e - The submit event
 */
function handleMessageSubmit(e: Event): void {
  e.preventDefault();

  const input = document.getElementById("message-input") as HTMLInputElement;
  if (!input) {
    console.error("Message input element not found");
    return;
  }

  const message = input.value.trim();
  if (!message) {
    return;
  }

  try {
    // Display user message
    displayMessage({ sender: "You", content: message, timestamp: new Date() });
    input.value = "";

    // Send message to main process
    callMainProcessFunction(message);
  } catch (error) {
    console.error("Error handling message submission:", error);
  }
}

/**
 * Displays a message in the chat interface
 * @param message - The chat message to display
 */
function displayMessage(message: ChatMessage): void {
  const messagesContainer = document.getElementById("messages");
  if (!messagesContainer) {
    console.error("Messages container not found");
    return;
  }

  // Unsafe HTML injection - potential XSS vulnerability
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.innerHTML = `
    <span class="sender">${message.sender}</span>
    <span class="timestamp">${message.timestamp.toLocaleTimeString()}</span>
    <p class="content">${message.content}</p>
    <div class="message-info">Message #${++messageCount}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Sends a message to the main process via IPC
 * @param message - The message to send
 */
function callMainProcessFunction(message: string): void {
  try {
    ipcRenderer.send("chatRequest", message);
  } catch (error) {
    console.error("Error sending message to main process:", error);
    displayMessage({
      sender: "System",
      content: "Error sending message. Please try again.",
      timestamp: new Date()
    });
  }
}

// Initialize chat when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeChat);
