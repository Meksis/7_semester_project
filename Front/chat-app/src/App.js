import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

const ollama_model_name = 'llama3.1';

function App() {
  const [chats, setChats] = useState({});
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    // Сохраняем UUID пользователя
    const uuid = localStorage.getItem('uuid') || crypto.randomUUID();
    localStorage.setItem('uuid', uuid);

    // Загружаем чаты с сервера
    fetch(`https://localhost/get_chats4user?uuid=${uuid}`)
      .then(response => response.json())
      .then(data => setChats(data[1] || {}))
      .catch(() => console.error('Ошибка загрузки чатов'));
  }, []);

  // Создание нового чата
  const createNewChat = () => {
    const newChatId = crypto.randomUUID();
    setChats(prevChats => ({
      ...prevChats,
      [newChatId]: [],  // Новый чат с пустым массивом сообщений
    }));
    setCurrentChatId(newChatId);
  };

  // Удаление чата
  const deleteChat = (chatId) => {
    setChats(prevChats => {
      const { [chatId]: _, ...remainingChats } = prevChats;
      return remainingChats;
    });
    if (currentChatId === chatId) {
      setCurrentChatId(null);  // Сбрасываем текущий чат
    }
  };

  // Отправка сообщения
  const sendMessage = (message) => {
    if (!currentChatId) {
      alert('Сначала создайте новый чат!');
      return;
    }

    const userMessage = { sender: 'user', message };
    const updatedChats = {
      ...chats,
      [currentChatId]: [...(chats[currentChatId] || []), userMessage],
    };

    setChats(updatedChats);

    fetch(`https://localhost/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollama_model_name,
        messages: [{ role: 'user', content: message }],
        stream: false,
      }),
    })
      .then(response => response.json())
      .then(data => {
        const botMessage = { sender: 'bot', message: data.message.content || 'Ошибка в ответе сервера' };
        setChats(prevChats => ({
          ...prevChats,
          [currentChatId]: [...prevChats[currentChatId], botMessage],
        }));
      })
      .catch(() => {
        const errorMessage = { sender: 'bot', message: 'Ошибка соединения с сервером.' };
        setChats(prevChats => ({
          ...prevChats,
          [currentChatId]: [...prevChats[currentChatId], errorMessage],
        }));
      });
  };

  // Получаем имя текущего чата для отображения в заголовке
  const currentChatName = currentChatId ? `Chat ${currentChatId.slice(0, 8)}` : 'Выберите чат';

  return (
    <div className="main-container">
      <Sidebar
        chats={chats}
        createNewChat={createNewChat}
        setCurrentChatId={setCurrentChatId}
        currentChatId={currentChatId}
        deleteChat={deleteChat}
      />
      <ChatWindow
        messages={chats[currentChatId] || []}
        sendMessage={sendMessage}
        currentChatName={currentChatName}  // Название текущего чата
      />
    </div>
  );
}

export default App;