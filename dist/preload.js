"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import IPC renderer to communicate with the main process if needed
const electron_1 = require("electron");
// Function to setup the observer
function setupObserver() {
    console.log("Setting up observer...");
    console.log("The chat element is:", document.getElementById("textchat"));
    // Select the target node
    const targetNode = document.getElementById("textchat");
    // If the target node does not exist, we might need to retry after the page has loaded
    if (!targetNode) {
        console.error("The chat element does not exist yet.");
        // Optionally, set up a retry mechanism here, e.g., using setInterval
        return;
    }
    // Options for the observer (which mutations to observe)
    const config = { childList: true };
    // Callback function to execute when mutations are observed
    const callback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if it is an element node
                        const elementNode = node; // Type assertion to HTMLElement
                        console.log("A new chat message was added:", elementNode.innerText);
                        // Optionally send this information to the main process
                        electron_1.ipcRenderer.send("new-chat-message", elementNode.innerText);
                    }
                });
            }
        }
    };
    // Create an instance of the observer with the callback function
    const observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}
// Call the setup function
setupObserver();
