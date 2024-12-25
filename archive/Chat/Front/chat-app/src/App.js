import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

const ollama_model_name = 'llama3.1';

function App() {
  const [chats, setChats] = useState({});
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Добавлено состояние для сайдбара

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Файлы отчётов (затычка)
  const reportFiles = ['Файл 1', 'Файл 2', 'Файл 3', 'Файл 4', 'Файл 5', 'Файл 6'];

  useEffect(() => {
    const uuid = localStorage.getItem('uuid') || crypto.randomUUID();
    localStorage.setItem('uuid', uuid);

    fetch(`https://localhost/get_chats4user?uuid=${uuid}`)
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

  const deleteChat = (chatId) => {
    setChats(prevChats => {
      const { [chatId]: _, ...remainingChats } = prevChats;
      return remainingChats;
    });
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
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

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  const handleReportSubmit = () => {
    if (selectedReport && currentChatId) {
      const reportMessage = { sender: 'bot', message: `Генерируется отчёт: "${selectedReport}"...` };
      setChats(prevChats => ({
        ...prevChats,
        [currentChatId]: [...(prevChats[currentChatId] || []), reportMessage],
      }));
  
      // Тут типа к ламе запрос с задержкой, можна нахуй бля убрать нахуй бля или похуй, я вообще карбона объелся, хуле ты мне сделаешь пидор ты гнойный, а? Соси сосиску, на ультра правом двигаемся, пойду пельмени в пальмовом масле обмазывать и охлаждать 
      setTimeout(() => {
        const generatedReport = `Это отчёт, сгенерированный для "${selectedReport}".`;
        setChats(prevChats => ({
          ...prevChats,
          [currentChatId]: [...prevChats[currentChatId], { sender: 'bot', message: generatedReport }],
        }));
      }, 2000); 
      // Запрос можно и такой 
      // fetch('/your-backend-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reportName: selectedReport }),
      // })
      //   .then(response => response.json())
      //   .then(data => {
      //     const botMessage = { sender: 'bot', message: data.reportText };
      //     setChats(prevChats => ({
      //       ...prevChats,
      //       [currentChatId]: [...(prevChats[currentChatId] || []), botMessage],
      //     }));
      //   })
      //   .catch(error => {
      //     console.error('Ошибка при запросе отчёта:', error);
      //   });
      
      setIsModalOpen(false);
      setSelectedReport(null);
    } else {
      alert('Пожалуйста, выберите отчёт!');
    }
  };
  

  const currentChatName = currentChatId ? `Chat ${currentChatId.slice(0, 8)}` : 'Выберите чат';

  return (
    <div className="main-container">
      <Sidebar
        chats={chats}
        createNewChat={createNewChat}
        setCurrentChatId={setCurrentChatId}
        currentChatId={currentChatId}
        deleteChat={deleteChat}
        isCollapsed={isSidebarCollapsed} // Передача состояния сайдбара
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} // Передача функции переключения
        openModal={() => setIsModalOpen(true)} // Функция открытия модального окна
      />
      <ChatWindow
        messages={chats[currentChatId] || []}
        sendMessage={sendMessage}
        currentChatName={currentChatName}
      />

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Выберите отчёт</h2>
            <ul className="report-list">
              {reportFiles.map((file, index) => (
                <li
                  key={index}
                  className={`report-item ${selectedReport === file ? 'selected' : ''}`}
                  onClick={() => handleReportSelect(file)}
                >
                  {file}
                </li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button onClick={() => setIsModalOpen(false)}>Отмена</button>
              <button onClick={handleReportSubmit} disabled={!selectedReport}>ОК</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
