import React, { useState } from 'react';

function Sidebar({ chats, createNewChat, setCurrentChatId, currentChatId, deleteChat, isCollapsed, toggleCollapse }) {
  const [activeMenu, setActiveMenu] = useState(null); // Состояние для активного меню

  const handleMenuToggle = (chatId) => {
    setActiveMenu(activeMenu === chatId ? null : chatId); // Переключаем видимость меню
  };

  const handleMenuClose = () => {
    setActiveMenu(null); // Закрываем меню
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2>История чатов</h2>}
        <button className="toggle-button" onClick={toggleCollapse}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <button onClick={createNewChat}>+ Новый чат</button>
          <div className="chat-history">
            {Object.keys(chats).map(chatId => (
              <div
                key={chatId}
                className={`chat-link ${currentChatId === chatId ? 'active' : ''}`}
                onClick={() => setCurrentChatId(chatId)}
              >
                <span>{`Chat ${chatId.slice(0, 8)}`}</span>
                <div className="menu-container" onMouseLeave={handleMenuClose}>
                  <button 
                    className="menu-toggle"
                    onClick={(e) => {
                      e.stopPropagation(); // Останавливаем событие, чтобы оно не вызывало смену активного чата
                      handleMenuToggle(chatId);
                    }}
                  >
                    •••
                  </button>
                  {activeMenu === chatId && (
                    <div className="menu">
                      <button onClick={() => deleteChat(chatId)}>Удалить</button>
                      <button onClick={() => alert('Переименовать')}>Переименовать</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;


