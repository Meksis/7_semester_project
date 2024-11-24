from flask import Flask, request, jsonify, url_for, render_template
import psycopg2
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Конфигурация подключения к базе данных
DB_CONFIG = {
    'dbname': 'postgres',
    'user': 'postgres',
    'password': '1111',
    'host': '127.0.0.1',  # Или другой хост
    'port': 5432          # По умолчанию для PostgreSQL
}


@app.route('/', methods=['GET', 'POST'])
def default():
    return render_template('index_.html')

# Маршрут для получения всех записей из таблицы
@app.route('/get_chats4user', methods=['GET'])
def get_chats4user():
    try:
        # Подключение к базе данных
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # uuid = request.get_json().get('uuid')
        
        uuid = request.args['uuid']
        cursor.execute('SELECT * FROM "USERS" WHERE id=%s', (uuid, ))
        chats = cursor.fetchone()

        print(chats)
        
        # Закрываем соединение
        cursor.close()
        conn.close()

        # Возвращаем данные в формате JSON
        return jsonify(chats), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Маршрут для добавления новой записи
@app.route('/create_user', methods=['POST'])
def create_user():
    try:
        uuid = request.get_json().get('uuid')

        # Подключение к базе данных
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Добавляем запись
        cursor.execute(
            'INSERT INTO "USERS" (id) VALUES (%s)',
            (uuid, )
        )
        
        # Сохраняем изменения
        conn.commit()

        # Закрываем соединение
        cursor.close()
        conn.close()

        return jsonify({'res': 'OK'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/create_chat', methods=['POST'])
def create_chat():
    try:
        uuid = request.get_json().get('uuid')
        chat_id = request.get_json().get('chat_id')
        
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Добавляем запись
        cursor.execute(
            'INSERT INTO "CHATS" VALUES (%s)',
            (chat_id, )
        )

        conn.commit()

# new_item = {"product": "orange", "quantity": 3}

# # SQL запрос для добавления элемента в конец массива
# query = """
#     UPDATE orders
#     SET items = items || %s
#     WHERE id = %s;
# """

# # Выполнение запроса
# cur.execute(query, (json.dumps([new_item]), order_id))

        cursor.execute('''
            UPDATE "USERS" SET chats = chats || %s WHERE id=%s
        ''', (chat_id, uuid))

        return jsonify({'res': 'OK'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_message', methods=['POST'])
def add_message():
    try:
        # uuid = request.get_json().get('uuid')
        chat_id = request.get_json().get('chat_id')
        message = request.get_json().get('message')
        role = request.get_json().get('role')
        
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Добавляем запись
        # cursor.execute(
        #     'INSERT INTO "CHATS" VALUES (%s)',
        #     (chat_id, )
        # )

        cursor.execute('''UPDATE "CHATS" SET role=%s, message=%s WHERE chat_id=%s''',
                       (role, message, chat_id))
        conn.commit()

        return jsonify({'res': 'OK'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', ssl_context=('./certifies/cert.pem', './certifies/key.pem'))
