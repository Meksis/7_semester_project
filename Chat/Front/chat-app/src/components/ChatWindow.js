import React, { useState, useRef } from 'react';

function ChatWindow({ messages, sendMessage, currentChatName }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null); // Ссылка на textarea

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage(''); // Очищаем поле после отправки
      // Сбрасываем высоту textarea после отправки
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Возвращаем высоту в 'auto'
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);

    // Автоматически увеличиваем высоту по мере ввода текста
    const textarea = textareaRef.current;
    textarea.style.height = 'auto'; // Сброс высоты, чтобы корректно измерить новый scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Устанавливаем нужную высоту
  };

  // Функция для обработки отображения текста с сохранением абзацев
  const formatMessage = (text) => {

    return text.split('\n').map((item, index) => (
      <span key={index}>
        {item}
        <br />
      </span>
    ));
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
            {formatMessage(msg.message)} {/* Форматируем сообщение */}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          ref={textareaRef} // Привязываем ref к textarea
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          rows="1" // Устанавливаем минимальное количество строк
        />
        <button onClick={handleSendMessage}>Отправить</button>
      </div>
    </div>
  );
}

export default ChatWindow;





