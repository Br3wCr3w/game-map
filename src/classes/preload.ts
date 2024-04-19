let lastKnownChatCount = 0;

const checkForNewMessages = () => {
  const chatNode = document.getElementById("textchat");
  if (!chatNode) return;

  const generalMessages = document.querySelectorAll(".message.general");

  const messageText = !!generalMessages?.length
    ? generalMessages[generalMessages.length - 1]?.lastChild?.textContent
    : "";
  console.log("messageText:", messageText);

  const nodes = chatNode.getElementsByClassName("message general you");

  const currentChatCount = chatNode.childNodes.length;
  //if (currentChatCount > lastKnownChatCount) {
  //console.log("New message detected!");
  Array.from(chatNode.childNodes)
    .slice(lastKnownChatCount)
    .forEach((node) => {
      //console.log("New chat text:", node.textContent);
    });
  lastKnownChatCount = currentChatCount;
  //}
};

setInterval(checkForNewMessages, 5000); // Check every second
