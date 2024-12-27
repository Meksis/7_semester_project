const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');



const processTable = require('./reporter');

// Загрузка переменных окружения
dotenv.config({ path: '../../../configs/.env' });

// Создаем приложение Express
const app = express();
const server_root = '/api/back';
const tables_Path = path.resolve('../../../Tables_Composer/Other_Files/Таблицы');


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


const getFilesInDirectory = (directory, filter) => {
  const files = fs.readdirSync(directory);  // Получаем все файлы и папки
  return files.filter(file => file.endsWith(filter)); // Фильтруем только файлы с нужным расширением (например, .xlsx)
};



// Маршрут для получения всех записей из таблицы
app.get(`${server_root}/get_chats4user`, async (req, res) => {
  try {
    const uuid  = req.query.uuid;

    // const result = await pool.query('SELECT * FROM "USERS" WHERE id=$1', [uuid]);

    const result = await pool.query(`
      SELECT u.id AS user_id, c.chat_id, c.role, c.message
      FROM "USERS" u
      LEFT JOIN "CHATS" c ON c.chat_id = ANY(u.chats)
      WHERE u.id = $1 
        AND c.role!=''; 

    `, [uuid]);

    const chats = await pool.query(`select chats from "USERS" where id=$1`, [uuid]);
    
    // console.log(result.fields);
    // console.log(result);
    // console.log(result.rows);

    // res.status(200).json(result.fields[0]);
    res.status(200).json([chats.rows[0], result.rows]);
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для создания нового пользователя
app.post(`${server_root}/create_user`, async (req, res) => {
  try {
    const uuid = req.body.uuid;

    await pool.query('INSERT INTO "USERS" (id) VALUES ($1)', [uuid]);
    res.status(200).json({ res: 'OK' });
  } 
  
  catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для создания нового чата
app.post(`${server_root}/create_chat`, async (req, res) => {
  try {
    const { uuid, chat_id } = req.body;

    // await pool.query('UPDATE "USERS" SET chats = chats ||  $1 WHERE id=$2', [chat_id, uuid]);
    // await pool.query('UPDATE "USERS" SET chats = array_append(chats, $1) WHERE id=$2', [chat_id, uuid]);
    // await pool.query('INSERT INTO "CHATS" (chat_id) VALUES ($1)', [chat_id]);
    // await pool.query(`UPDATE "USERS" SET chats = COALESCE(chats, '[]'::jsonb) || to_jsonb($1::text) WHERE id=$2`, [chat_id, uuid]);

    await pool.query('INSERT INTO "CHATS" (chat_id) VALUES ($1)', [chat_id]);
    await pool.query(`UPDATE "USERS" SET chats = array_prepend($1, chats) WHERE id=$2`, [chat_id, uuid]);
    // chats = array_remove(chats, 'chat-to-remove-id')

    res.status(200).json({ res: 'OK' });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.post(`${server_root}/delete_chat`, async (req, res) => {
  try {
    const { uuid, chat_id } = req.body;
    // console.log(uuid, chat_id);

    // await pool.query('UPDATE "USERS" SET chats = chats ||  $1 WHERE id=$2', [chat_id, uuid]);
    // await pool.query('UPDATE "USERS" SET chats = array_append(chats, $1) WHERE id=$2', [chat_id, uuid]);
    // await pool.query('INSERT INTO "CHATS" (chat_id) VALUES ($1)', [chat_id]);
    // await pool.query(`UPDATE "USERS" SET chats = COALESCE(chats, '[]'::jsonb) || to_jsonb($1::text) WHERE id=$2`, [chat_id, uuid]);

    await pool.query('DELETE FROM "CHATS" WHERE chat_id=$1', [chat_id]);
    await pool.query(`UPDATE "USERS" SET chats = array_remove(chats, $1) WHERE id=$2`, [chat_id, uuid]);
    // chats = array_remove(chats, 'chat-to-remove-id')
    // console.log('OK');
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
    // console.log(chat_id, message, role);
    
    await pool.query('INSERT INTO "CHATS" VALUES($1, $2, $3);', [chat_id, role, message]);
    res.status(200).json({ res: 'OK' });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.get(`${server_root}/get_reports_filenames`, async (req, res) => {
  try {
    // const { chat_id, message, role } = req.body;
    // console.log(chat_id, message, role);
    const files = getFilesInDirectory(tables_Path, 'xlsx').map((value) => value.split('.')[0]);
    // console.log(files);

    
    // await pool.query('INSERT INTO "CHATS" VALUES($1, $2, $3);', [chat_id, role, message]);
    res.status(200).json({ res: files });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.post(`${server_root}/make_report`, async (req, res) => {
  console.log('Получили запрос на создание отчета');
  try {
    const { report_name } = req.body;
    // console.log(chat_id, message, role);
    // const files = getFilesInDirectory(tables_Path, 'xlsx').map((value) => value.split('.')[0]);
    // console.log(files);
    const report = await processTable(report_name);
    console.log(report);
    
    // await pool.query('INSERT INTO "CHATS" VALUES($1, $2, $3);', [chat_id, role, message]);
    res.status(200).json({ res: report });
    console.log('Отчет составлен');
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
