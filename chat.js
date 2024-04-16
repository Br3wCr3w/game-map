// chat.js
const { ipcRenderer } = require("electron");

// Function to call the main process function
function callMainProcessFunction(message) {
  ipcRenderer.send("chatRequest", message);
}
document
  .getElementById("message-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const input = document.getElementById("message-input");
    const message = input.value.trim();

    if (message) {
      displayMessage("You", message);
      input.value = "";

      // Here, you would send the message to your AI Dungeon Master and get a response
      // For demonstration, we'll just echo the message
      displayMessage("Dungeon Master", message); // Replace this with actual AI response

      callMainProcessFunction(message);
    }
  });

function displayMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = `${sender}: ${message}`;
  document.getElementById("messages").appendChild(messageDiv);
}
