let messageCount = 0;
let selectedFile = null;

// scroll chat container to bottom
function scrollToBottom() {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// append a message to chat container
function appendMessage(sender, message, id = null) {
  const messageHtml = `
    <div class="message ${sender}">
      <div class="msg-header">${capitalizeFirstLetter(sender)}</div>
      <div class="msg-body" ${id ? `id="${id}"` : ""}>${message}</div>
    </div>
  `;
  document.getElementById("chatContainer").insertAdjacentHTML("beforeend", messageHtml);
  scrollToBottom();
}

// capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// send user message
function sendMessage() {
  const inputField = document.getElementById("text");
  const rawText = inputField.value;

  if (!rawText && !selectedFile) return;

  appendMessage("user", rawText || "📎 File Sent");
  inputField.value = "";

  const formData = new FormData();
  formData.append("msg", rawText);
  if (selectedFile) {
    formData.append("file", selectedFile);
  }

  fetchBotResponse(formData);
}

// fetch bot response
function fetchBotResponse(formData) {
  fetch("/get", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) throw new Error("Bad request");
      return response.text();
    })
    .then((data) => displayBotResponse(data))
    .catch(() => displayError())
    .finally(() => {
      selectedFile = null;
    });
}

// display bot response with typing effect
function displayBotResponse(data) {
  const botMessageId = `botMessage-${messageCount++}`;
  appendMessage("model", "", botMessageId);

  const botMessageDiv = document.getElementById(botMessageId);
  botMessageDiv.textContent = "";

  let index = 0;
  const interval = setInterval(() => {
    if (index < data.length) {
      botMessageDiv.textContent += data[index++];
    } else {
      clearInterval(interval);
    }
  }, 30);
}

// display error
function displayError() {
  appendMessage("model error", "⚠️ Failed to fetch response from server.");
}

// event listeners
function attachEventListeners() {
  const sendButton = document.getElementById("send");
  const inputField = document.getElementById("text");
  const attachmentButton = document.getElementById("attachment");
  const fileInput = document.getElementById("fileInput");

  sendButton.addEventListener("click", sendMessage);

  inputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  attachmentButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
    appendMessage("user", `📎 Selected File: ${selectedFile.name}`);
  });
}

document.addEventListener("DOMContentLoaded", attachEventListeners);
