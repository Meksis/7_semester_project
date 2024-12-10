import React from 'react';

function Sidebar({ chats, createNewChat, setCurrentChatId, currentChatId, deleteChat }) {
  return (
    <div className="sidebar">
      <h2>История чатов</h2>
      <button onClick={createNewChat}>+ Новый чат</button>
      <div className="chat-history">
        {Object.keys(chats).map(chatId => (
          <div
            key={chatId}
            className={`chat-link ${currentChatId === chatId ? 'active' : ''}`}
            onClick={() => setCurrentChatId(chatId)}
          >
            <span>{`Chat ${chatId.slice(0, 8)}`}</span> {/* Название чата */}
            <button onClick={(e) => {
              e.stopPropagation(); // Чтобы клик по кнопке не срабатывал на `onClick` чата
              deleteChat(chatId);
            }} className="delete-button">
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;