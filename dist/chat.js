"use strict";
// chat.ts
/**
 * Represents the chat functionality of the game map.
 */
const { ipcRenderer } = require("electron");
/**
 * Adds an event listener to the message form and handles the submission of messages.
 * @param e - The submit event.
 */
document.getElementById("message-form")
    ?.addEventListener("submit", function (e) {
    e.preventDefault();
    /**
     * Represents the input element for messages.
     */
    const input = document.getElementById("message-input");
    const message = input?.value.trim();
    if (message) {
        displayMessage("You", message);
        input.value = "";
        // Here, you would send the message to your AI Dungeon Master and get a response
        // For demonstration, we'll just echo the message
        displayMessage("Dungeon Master", message); // Replace this with actual AI response
        callMainProcessFunction(message);
    }
});
/**
 * Displays a message in the chat.
 * @param sender - The sender of the message.
 * @param message - The message content.
 */
function displayMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${sender}: ${message}`;
    document.getElementById("messages")?.appendChild(messageDiv);
}
/**
 * Calls a function in the main process with the provided message.
 * @param message - The message to send to the main process.
 */
function callMainProcessFunction(message) {
    ipcRenderer.send("chatRequest", message);
}
