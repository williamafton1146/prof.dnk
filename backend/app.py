from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Маршрут для главной страницы (отдает HTML)
@app.route('/')
def index():
    return render_template('index.html')

# Маршрут для API (принимает данные от JS)
@app.route('/api/send-data', methods=['POST'])
def receive_data():
    data = request.json
    # Здесь ваша логика обработки данных
    print(f"Получены данные: {data}")
    
    return jsonify({
        "status": "success",
        "message": f"Сервер получил: {data.get('text', '')}"
    })

if __name__ == '__main__':
    # Для локального теста
    app.run(debug=True, port=5000)