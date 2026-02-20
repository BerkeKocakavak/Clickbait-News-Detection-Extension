from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import string
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
import os

# --- NLTK Setup ---
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("Downloading necessary NLTK data...")
    # quiet=True added to reduce console noise
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt', quiet=True)

app = Flask(__name__)
CORS(app)

# --- Load Models ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'svm_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'tfidf_vectorizer.pkl')

try:
    svm_model = joblib.load(MODEL_PATH)
    tfidf_vectorizer = joblib.load(VECTORIZER_PATH)
    print("Models loaded successfully.")
except FileNotFoundError:
    print(f"Error: Model files not found at {MODEL_PATH}")
    svm_model = None

# --- Global Optimizations ---
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# Optimization: Pre-compile Regex patterns globally
# This prevents recompiling the regex on every single API request (Better Performance)
PUNCT_REGEX = re.compile(f"[{re.escape(string.punctuation)}]")
DIGIT_REGEX = re.compile(r"\d+")

def preprocess_text(text):
    text = text.lower()
    # Use compiled regex patterns for faster substitution
    text = PUNCT_REGEX.sub(" ", text)
    text = DIGIT_REGEX.sub(" ", text)
    
    tokens = [lemmatizer.lemmatize(w) for w in text.split() if w not in stop_words and len(w) > 2]
    return " ".join(tokens)

@app.route('/predict', methods=['POST'])
def predict():
    if not svm_model:
        return jsonify({'error': 'Models not loaded'}), 500
        
    try:
        # force=True allows parsing even if Content-Type header is missing
        data = request.get_json(force=True, silent=True)
        if not data:
             return jsonify({'error': 'Invalid JSON format'}), 400
             
        headline = data.get('headline', '')
        if not headline:
            return jsonify({'error': 'No headline provided'}), 400

        clean_headline = preprocess_text(headline)
        
        # Handle cases where cleaning removes all text 
        if not clean_headline.strip():
             return jsonify({'headline': headline, 'result': 'unknown'}), 200

        vector = tfidf_vectorizer.transform([clean_headline])
        prediction = svm_model.predict(vector)[0]
        result = "clickbait" if prediction == 1 else "normal"
        
        return jsonify({'headline': headline, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Clickbait Detector API running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)