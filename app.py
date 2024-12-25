from flask import Flask, render_template, request, jsonify
import pyttsx3
import threading

app = Flask(__name__)

# Initialize Text-to-Speech engine
tts_engine = pyttsx3.init()

# Lock to manage speech queue and avoid overlapping
speech_lock = threading.Lock()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text')
    voice = data.get('voice')

    if not text:
        return jsonify({'status': 'error', 'message': 'No text provided.'}), 400

    # Set the voice
    voices = tts_engine.getProperty('voices')
    tts_engine.setProperty('voice', voices[0].id if voice == 'male' else voices[1].id)

    # Use a separate thread to handle speech playback
    def speak_text():
        with speech_lock:
            tts_engine.stop()  # Stop any ongoing speech
            tts_engine.say(text)
            tts_engine.runAndWait()

    threading.Thread(target=speak_text).start()
    return jsonify({'status': 'success', 'message': 'Text played successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
