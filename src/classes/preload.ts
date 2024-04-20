import { MessageHandler } from "./message-handler";

let lastKnownChatCount = 0;
let lastChatNodeStringified = "";
const checkForNewMessages = () => {
  const chatNode = document.getElementById("textchat");
  if (!chatNode) return;
  const chatNodeStringified = JSON.stringify(chatNode.innerText);
  console.log("chatNodeStringified:", chatNodeStringified);
  return;

  // if (chatNodeStringified === lastChatNodeStringified) return;
  // const messageHandler = new MessageHandler();

  // messageHandler.handleChatRequest(
  //   "what happened here: " + chatNodeStringified
  // );

  // const generalMessages = document.querySelectorAll(".message.general");

  // const messageText = !!generalMessages?.length
  //   ? generalMessages[generalMessages.length - 1]?.lastChild?.textContent
  //   : "";
  // console.log("messageText:", messageText);

  // const nodes = chatNode.getElementsByClassName("message general you");

  // const currentChatCount = chatNode.childNodes.length;
  // lastKnownChatCount = currentChatCount;
  // lastChatNodeStringified = JSON.stringify(chatNode.innerHTML);
  // //}
};

setInterval(checkForNewMessages, 15000); // Check every second
