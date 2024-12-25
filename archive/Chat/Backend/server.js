const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config({ path: '../../../configs/.env' });

// Создаем приложение Express
const app = express();
const server_root = '/api/back';
app.use(cors());
app.use(express.json()); // Для работы с JSON-запросами

// Конфигурация подключения к базе данных
const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Маршрут для отображения HTML
// app.get('/', (req, res) => {
//   res.sendFile(`${__dirname}/pages/index_.html`);
// });

// Маршрут для получения всех записей из таблицы
app.get(`${server_root}/get_chats4user`, async (req, res) => {
  try {
    const { uuid } = req.query.uuid;

    const result = await pool.query('SELECT * FROM "USERS" WHERE id=$1', [uuid]);
    res.status(200).json(result.rows[0]);
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для создания нового пользователя
app.post(`${server_root}/create_user`, async (req, res) => {
  try {
    const { uuid } = req.body.uuid;

    await pool.query('INSERT INTO "USERS" (id) VALUES ($1)', [uuid]);
    res.status(200).json({ res: 'OK' });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для создания нового чата
app.post(`${server_root}/create_chat`, async (req, res) => {
  try {
    const { uuid, chat_id } = req.body;

    await pool.query('INSERT INTO "CHATS" (id) VALUES ($1)', [chat_id]);
    await pool.query('UPDATE "USERS" SET chats = array_append(chats, $1) WHERE id=$2', [chat_id, uuid]);
    res.status(200).json({ res: 'OK' });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для добавления сообщения
app.post(`${server_root}/add_message`, async (req, res) => {
  try {
    const { chat_id, message, role } = req.body;
    
    await pool.query('UPDATE "CHATS" SET role=$1, message=$2 WHERE chat_id=$3', [role, message, chat_id]);
    res.status(200).json({ res: 'OK' });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://${process.env.SERVER_HOST}:${PORT}`);
});
