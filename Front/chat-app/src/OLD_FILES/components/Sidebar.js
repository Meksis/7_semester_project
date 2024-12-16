import React from 'react';

function Sidebar({ chats, createNewChat, setCurrentChatId, currentChatId }) {
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
            Чат {chatId.slice(0)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
