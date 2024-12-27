import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';
// import processTable from '../../../Backend/reporter';



const ollama_model_name = 'llama3.1';

function App() {
  const [chats, setChats] = useState({});
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // useEffect(() => {
  //   const uuid = localStorage.getItem('uuid') || crypto.randomUUID();
  //   localStorage.setItem('uuid', uuid);

  //   // Получение чатов пользователя
  //   fetch(`https://localhost/api/back/get_chats4user?uuid=${uuid}`)
  //     .then(response => response.json())
  //     .then(data => {
  //       const userChats = data.chats || {}; // Предполагаем, что чаты приходят в поле `chats`
  //       setChats(userChats);
  //     })
  //     .catch(() => console.error('Ошибка загрузки чатов'));
  // }, []);


    // Состояния для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportFiles, setReportFiles] = useState(null);
    // Файлы отчётов (затычка)
    // const reportFiles = ['Файл 1', 'Файл 2', 'Файл 3', 'Файл 4', 'Файл 5', 'Файл 6'];


  useEffect(() => {
    const uuid = localStorage.getItem('uuid') || crypto.randomUUID();
    localStorage.setItem('uuid', uuid);

    const getReportFiles = async () => {
      const chatResponse = await fetch(`https://localhost/api/back/get_reports_filenames`);
  
        const data = await chatResponse.json();
        setReportFiles(data.res);
    }
  
    const createUser = async () => {
      try {
        // Создаем пользователя
        await fetch(`https://localhost/api/back/create_user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid }),
        });
  
        // if (!createResponse.ok) {
        //   throw new Error('Ошибка создания пользователя');
        // }
  
        // Получаем чаты пользователя
        const chatResponse = await fetch(`https://localhost/api/back/get_chats4user?uuid=${uuid}`);
        // if (!chatResponse.ok) {
        //   throw new Error('Ошибка загрузки чатов');
        // }
  
        const data = await chatResponse.json();

        // console.log(data);

        // const userChats = data[0].chats.reduce((acc, key) => {
        //   acc[key] = [];
        //   return acc;
        // }, {})
        //  || {}; // Чаты из ответа сервера

        const userChats = data[0].chats.reduce((acc, key) => {
          // Для каждого чата создаем пустой массив для сообщений
          acc[key] = [];
        
          // Заполняем сообщения для данного чата, преобразуя в нужный формат
          const chatMessages = data[1].filter(message => message.chat_id === key)
            .map(message => ({
              sender: message.role,  // Изменяем роль на sender (user или assistant)
              message: message.message  // Оставляем сам текст сообщения
            }));
        
          // Добавляем преобразованные сообщения в массив чата
          acc[key] = chatMessages;
        
          return acc;
        }, {}) || {}; // Чаты из ответа сервера
        
        

        // console.log(userChats);

  
        // Устанавливаем чаты в состояние
        setChats(userChats);
      } 
      catch (error) {
        console.error(error.message);
      }
    };
    getReportFiles();
    createUser();
  }, []);

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };
  const handleReportSubmit = async () => {
    if (selectedReport && currentChatId) {
      const reportMessage = { sender: 'bot', message: `Генерируется отчёт: "${selectedReport}"...` };
      setChats(prevChats => ({
        ...prevChats,
        [currentChatId]: [...(prevChats[currentChatId] || []), reportMessage],
      }));
  
      // setTimeout(() => {
      //   const generatedReport = `Это отчёт, сгенерированный для "${selectedReport}".`;
      //   setChats(prevChats => ({
      //     ...prevChats,
      //     [currentChatId]: [...prevChats[currentChatId], { sender: 'bot', message: generatedReport }],
      //   }));
      // }, 2000); 

      // processTable(selectedReport);

      // Запрос можно и такой 
      await fetch('https://localhost/api/back/make_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_name: selectedReport }),
      })
        .then(response => response.json())
        .then(async (data) => {
          const botMessage = { sender: 'bot', message: data.res };
          
          await fetch(`https://localhost/api/back/add_message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: currentChatId,
              message: botMessage.message,
              role: 'assistant',
            }),
          });
          
          setChats(prevChats => ({
            ...prevChats,
            [currentChatId]: [...(prevChats[currentChatId] || []), botMessage],
          }));
          
        })
        .catch(error => {
          console.error('Ошибка при запросе отчёта:', error.message);
          throw error;
        });
      
      setIsModalOpen(false);
      setSelectedReport(null);
  
      // Сохраняем сообщение бота на сервере
      
  
      // Обновляем UI с сообщением бота
      // setChats(prevChats => ({
      //   ...prevChats,
      //   [currentChatId]: [...prevChats[currentChatId], botMessage],
      // }));
    } 
    
    else if (selectedReport) {
      alert('Пожалуйста, выберите чат для создания отчета!');
    }
    else {
      alert('Пожалуйста, выберите тип отчета!');
    }
  };
  
  

  const createNewChat = () => {
    const uuid = localStorage.getItem('uuid');
    const newChatId = crypto.randomUUID();

    // Добавление чата на сервере
    fetch(`https://localhost/api/back/create_chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid, chat_id: newChatId }),
    })
      .then(response => response.json())
      .then(() => {
        setChats(prevChats => ({
          ...prevChats,
          [newChatId]: [],
        }));
        setCurrentChatId(newChatId);
      })
      .catch(() => console.error('Ошибка создания нового чата'));
  };


  // ToDo - Добавить логику удаления чатов из БД
  // const deleteChat = (chatId) => {
  //   setChats(prevChats => {
  //     const { [chatId]: _, ...remainingChats } = prevChats;
  //     return remainingChats;
  //   });
  //   if (currentChatId === chatId) {
  //     setCurrentChatId(null);    // Здесь просто заглушка. После удаления чата просто выкидываем юзера в никуда
  //     // setCurrentChatId(chats[0] || null);   // Кидаем пользователя на первый доступный чат
  //   }
  // };

  const deleteChat = (chatId) => {
    const uuid = localStorage.getItem('uuid');

    fetch(`https://localhost/api/back/delete_chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid, chat_id: currentChatId }),
    })
      .catch((error) => {throw error});

    setChats(prevChats => {
      const { [chatId]: _, ...remainingChats } = prevChats;
      return remainingChats;
    });

    // Преобразуем оставшиеся чаты в массив их ключей
    // const chatIds = Object.keys(chats);
  
    // Найти индекс удаляемого чата в старом списке
    const allChatIds = Object.keys(chats);
    const removedChatIndex = allChatIds.indexOf(chatId);

    // Устанавливаем текущий чат на предыдущий в списке
    const newCurrentChatId = allChatIds[removedChatIndex - 1] || null;

    setCurrentChatId(newCurrentChatId);

    
  };


    const sendMessage = async (message) => {
      if (!currentChatId) {
        alert('Сначала создайте новый чат!');
        return;
      }
    
      // const uuid = localStorage.getItem('uuid');
      const userMessage = { sender: 'user', message };
    
      // Обновляем UI сразу
      setChats(prevChats => ({
        ...prevChats,
        [currentChatId]: [...(prevChats[currentChatId] || []), userMessage],
      }));
    
      try {
        // Отправляем сообщение пользователя на сервер
        // console.log(`Добавляем сообщение ПОЛЬЗОВАТЕЛЯ: ${message}`);
        await fetch(`https://localhost/api/back/add_message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: currentChatId,
            message,
            role: 'user',
          }),
        });
        // console.log(`Ответ: ${await add_user_message_response.json().res}`);
    
        // Запрос к LLM
        const llmResponse = await fetch(`https://localhost/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollama_model_name,
            messages: [{ role: 'user', content: message }],
            stream: false,
          }),
        });
    
        // if (!llmResponse.ok) {
        //   throw new Error('Ошибка при запросе к LLM.');
        // }
    
        // const llmData = await llmResponse.json() || null;
        const llmData =  llmResponse.ok ? await llmResponse.json() : null;
        const botMessage = {
          sender: 'assistant',
          message: llmData ? llmData.message?.content : 'Ошибка в ответе сервера',
        };
    
        // Сохраняем сообщение бота на сервере
        await fetch(`https://localhost/api/back/add_message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: currentChatId,
            message: botMessage.message,
            role: 'assistant',
          }),
        });
    
        // Обновляем UI с сообщением бота
        setChats(prevChats => ({
          ...prevChats,
          [currentChatId]: [...prevChats[currentChatId], botMessage],
        }));
      }
      
      catch (error) {
        console.error('Ошибка:', error.message);
        
    
        // Обработчик ошибок - сообщение о проблемах с соединением
        const errorMessage = { sender: 'assistant', message: 'Ошибка соединения с сервером.' };
        setChats(prevChats => ({
          ...prevChats,
          [currentChatId]: [...prevChats[currentChatId], errorMessage],
        }));
        throw error;
      }
    };
    

    const writeChatsToLog = () => {
      console.log(chats);
    };

  const currentChatName = currentChatId ? `Chat ${currentChatId.slice(0, 8)}` : 'Выберите чат';

  return (
    <div className="main-container">
      <Sidebar
        chats={chats}
        // createNewChat={writeChatsToLog}
        createNewChat={createNewChat}
        setCurrentChatId={setCurrentChatId}
        currentChatId={currentChatId}
        deleteChat={deleteChat}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        // testFunction={writeChatsToLog}
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
