let currentChatId = null;

// let ollama_url = 'proxy51.rt3.io:39571';
let flask_proto = 'https';
let flask_url = '127.0.0.1:5000';


// let ollama_url = 'zitrax-ollama-11434-tcp.at.remote.it:33001';
let ollama_proto = 'http';
let ollama_url = '127.0.0.1:11434';

// let uuid = localStorage.getItem('uuid');
let chats = {};

// Получаем начальные данные 
(async () => {
  let uuid = localStorage.getItem('uuid');

  if (uuid) {
    // Пытаемся получить id пользователя. Если null, создаем новый и сразу же записываем в сессию
    const response = await fetch(`${flask_proto}://${flask_url}/get_chats4user?uuid=${uuid}`, {
      method: 'GET',
      
    });

    const responseData = await response.json();
    chats = responseData[1];
    // console.log(responseData); // Обработка ответа
  } 
  
  else {
    let new_uuid = crypto.randomUUID();
    // let new_uuid = uuid.v4();
    
    localStorage.setItem('uuid', new_uuid);
    uuid = new_uuid;

    const response = await fetch(`${ollama_proto}://${flask_url}/create_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify({
        uuid: uuid
      })
    });

    const responseData = await response.json();
    // console.log(responseData); // Обработка ответа
  }

})();


async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const chatOutput = document.getElementById('chatOutput');

  if (!currentChatId) {
    alert("Сначала создайте новый чат!");
    return; 
  }

  if (userInput.value.trim()) {
    const userMessage = document.createElement('div');
    userMessage.textContent = userInput.value;
    userMessage.className = 'user-message';
    chatOutput.appendChild(userMessage);

    try {
      const response = await fetch(`${ollama_proto}://${ollama_url}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
          model: "llama3.1",
          messages: [
            {
              role: "user",
              content: userInput.value,
            },
          ],
          stream: false,
        })
      });

      const responseData = await response.json();
      const botMessageText = responseData.message.content && responseData.message 
        ? responseData.message.content
        : 'Ошибка в ответе сервера';

      const botMessage = document.createElement('div');
      botMessage.textContent = botMessageText;
      botMessage.className = 'bot-message';
      chatOutput.appendChild(botMessage);

    chatOutput.scrollTop = chatOutput.scrollHeight;

    if (!chats[currentChatId]) chats[currentChatId] = [];
    chats[currentChatId].push({ sender: 'user', message: userInput.value });
    // chats[currentChatId].push({ sender: 'bot', message: 'Это ответ ассистента!' });

    userInput.value = '';
  }

    catch (error) {
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Ошибка соединения с сервером.';
      errorMessage.className = 'error-message';
      chatOutput.appendChild(errorMessage);
      
    
    }
  }
}

function createNewChat() {
  const chatHistory = document.getElementById('chatHistory');

  currentChatId = `chat-${Date.now()}`;
  chats[currentChatId] = [];

  const chatLink = document.createElement('div');
  chatLink.textContent = `Чат ${Object.keys(chats).length}`;
  chatLink.className = 'chat-link';
  chatLink.onclick = () => loadChat(currentChatId);
  chatHistory.appendChild(chatLink);

  loadChat(currentChatId);
}

function loadChat(chatId) {
  currentChatId = chatId;

  const chatOutput = document.getElementById('chatOutput');
  chatOutput.innerHTML = '';

  const chatMessages = chats[chatId] || [];
  chatMessages.forEach(({ sender, message }) => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    chatOutput.appendChild(messageDiv);
  });
}
