const dataForge = require('data-forge');
require('data-forge-fs'); // Для работы с CSV и JSON

const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); // Библиотека для работы с Excel
const axios = require('axios');

// Константы для путей и URL
const tablesPath = path.resolve('../../Tables_Composer/Other_Files/Таблицы');
const proto = 'https';
const url = 'localhost';

// Функция для чтения Excel-файла и преобразования в DataFrame
const readExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    return new dataForge.DataFrame(jsonData);
};

// Чтение и обработка таблиц
const loadTables = () => {
    const tables = fs
        .readdirSync(tablesPath)
        .filter((filename) => fs.statSync(path.join(tablesPath, filename)).isFile());

    const tablesDfs = {};
    tables.forEach((table) => {
        const filePath = path.join(tablesPath, table);
        const df = readExcelFile(filePath);
        const filteredColumns = df.getColumnNames().includes('REG_STATUS')
            ? ['CLASSID', 'NAME', 'ADDRESS', 'STATUS', 'REG_STATUS']
            : ['CLASSID', 'NAME', 'ADDRESS', 'STATUS'];
        tablesDfs[path.basename(table, '.xlsx')] = df.subset(filteredColumns);
    });

    return tablesDfs;
};

// Объединение данных
const joinDfs = (tablesDfs, dfName) => {
    const statuses = {
        1: 'существующий',
        2: 'планируемый',
        3: 'планируемый к реконструкции',
        4: 'планируемый к ликвидации',
    };

    try {
        const df = tablesDfs[dfName];
        const valuesPath = path.join(tablesPath, 'Values', `${dfName}.xlsx`);
        const valuesDf = readExcelFile(valuesPath);

        return df.join(
            valuesDf,
            (left) => left.CLASSID,
            (right) => right['Код объекта'],
            (left, right) => ({
                CLASSID: left.CLASSID,
                VALUE: right.Значение || 'неизвестно',
                STATUS: statuses[left.STATUS] || left.STATUS,
            })
        );
    } catch (error) {
        console.error(`Ошибка обработки файла ${dfName}:`, error.message);
        return null;
    }
};

// Функция для получения текста из объединенного DataFrame
const getTextFromDf = (df) => {
    if (!df) return 'Данные отсутствуют';
    return df
        .take(20)
        .toRows()
        .map((row, index) => `№${index + 1} | Тип объекта: ${row[1]} | Статус объекта: ${row[2]}`)
        .join('\n');
};

// Основная функция модуля
const processTable = async (tableName) => {
    const tablesDfs = loadTables();
    const dfJoined = joinDfs(tablesDfs, tableName);

    if (!dfJoined) {
        throw new Error(`Не удалось обработать таблицу: ${tableName}`);
    }

    const textDf = getTextFromDf(dfJoined);
    // console.log(textDf);
    // console.log(textDf.split('\n').length);

    const model = 'llama3.1';
    const prompt = 'How many objects are there in total and what unique statuses and types of objects are there? Translate your answer into Russian.';
    const configs = {
        model,
        messages: [
            {
                role: 'user',
                content: `${prompt}\nОбщее число записей = ${textDf.split('\n').length}\nНумерованный список прилагаю ниже:\n${textDf}`,
            },
        ],
        stream: false,
    };

    try {
        const response = await axios.post(`${proto}://${url}/api/chat`, configs, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        });
        return response.data.message.content;
    } catch (error) {
        console.error('Ошибка отправки запроса:', error.message);
        throw new Error('Не удалось отправить запрос.');
    }
};

// Экспортируемая функция
module.exports = processTable;
