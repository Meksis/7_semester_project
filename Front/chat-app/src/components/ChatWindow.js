import React from 'react';

function ChatWindow({ messages, sendMessage, currentChatName }) {
  const handleSendMessage = () => {
    const message = document.getElementById('userInput').value;
    if (message.trim()) {
      sendMessage(message);
      document.getElementById('userInput').value = ''; // Очищаем поле после отправки
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat Assistant</h1>
        <h2>{currentChatName}</h2> {/* Отображаем название текущего чата */}
      </div>
      <div className="chat-output">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea id="userInput" placeholder="Введите сообщение..."></textarea>
        <button onClick={handleSendMessage}>Отправить</button>
      </div>
    </div>
  );
}

export default ChatWindow;