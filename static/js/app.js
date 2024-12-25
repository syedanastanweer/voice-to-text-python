const textContainer = document.getElementById('text-container');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');

let recognition;
let isListening = false;
let currentLanguage = 'en-US'; // Default language is English

// Initialize Speech Recognition
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    // Set initial language for speech recognition
    recognition.lang = currentLanguage;

    recognition.onresult = function(event) {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript.trim();
        if (lastResult.isFinal) {
            const p = document.createElement('p');
            p.textContent = text;
            textContainer.appendChild(p);
            textContainer.scrollTop = textContainer.scrollHeight;

            // After detecting the speech, we'll detect the language and update
            detectLanguage(text);
        }
    };

    recognition.onerror = function(event) {
        console.error("Speech Recognition Error:", event.error);
    };
} else {
    alert("Your browser does not support Speech Recognition.");
}

// Function to start listening
function startListening() {
    if (!isListening) {
        recognition.start();
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
    }
}

// Function to stop listening
function stopListening() {
    if (isListening) {
        recognition.stop();
        isListening = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

// Function to play voice using male/female voice
async function playVoice(voiceType) {
    const text = Array.from(textContainer.children).map(el => el.textContent).join("\n");
    if (!text) {
        alert("No text to play.");
        return;
    }

    try {
        await fetch('/speak', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice: voiceType })
        });
    } catch (err) {
        console.error("Error speaking:", err);
    }
}

// Function to detect the language based on the text
async function detectLanguage(text) {
    try {
        // Fetch the language detection API
        const response = await fetch('/detect-language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();
        const lang = data.language;

        console.log(`Detected language: ${lang}`);

        // Check if detected language needs recognition language to be updated
        if (lang !== currentLanguage) {
            currentLanguage = lang;

            // Stop the recognition session, update the language, and start again
            recognition.stop();
            recognition.lang = lang;
            recognition.start();
        }
    } catch (error) {
        console.error("Language detection failed:", error);
    }
}

// Event listeners for Start and Stop buttons
startBtn.addEventListener('click', startListening);
stopBtn.addEventListener('click', stopListening);
