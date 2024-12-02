import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [chats, setChats] = useState({});
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    // Fetch initial data (e.g., user chats or create a new user)
    const uuid = localStorage.getItem('uuid') || crypto.randomUUID();
    localStorage.setItem('uuid', uuid);

    fetch(`https://127.0.0.1:5000/get_chats4user?uuid=${uuid}`)
      .then(response => response.json())
      .then(data => setChats(data[1] || {}))
      .catch(() => console.error('Ошибка загрузки чатов'));
  }, []);

  const createNewChat = () => {
    const newChatId = crypto.randomUUID();
    setChats(prevChats => ({
      ...prevChats,
      [newChatId]: [],
    }));
    setCurrentChatId(newChatId);
  };

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
        model: '3',
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

  return (
    <div className="main-container">
      <Sidebar
        chats={chats}
        createNewChat={createNewChat}
        setCurrentChatId={setCurrentChatId}
        currentChatId={currentChatId}
      />
      <ChatWindow
        messages={chats[currentChatId] || []}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default App;
