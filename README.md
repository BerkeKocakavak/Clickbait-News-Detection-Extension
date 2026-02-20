# 🎣 Clickbait Detector AI

## 📌 Project Overview
This project detects clickbait headlines on news websites (e.g., CNN, BBC) in real-time. It consists of a Python Flask API (Backend) and a Google Chrome Extension (Frontend).

Developed as a CENG313 Introduction to Data Science course project at Gazi University, this system provides users with immediate visual feedback regarding the nature of the headlines they encounter on news websites. By filtering out misleading content, it aims to highlight credible information and improve the online reading experience.

**Developers:**  Berke KOCAKAVAK, Batuhan Sami AKÇAY, Hasan GÜRSES, Türkay AYDOĞAN.

## ✨ Key Features & Technical Details
***High Accuracy Machine Learning Model:** Powered by a Support Vector Machine (LinearSVC) model trained on a perfectly balanced 32,000-headline dataset, achieving an impressive ~95% accuracy.

***Advanced NLP Pipeline:** Utilizes Python and NLTK for robust text preprocessing, including regex cleaning, stopword removal, WordNet lemmatization, and TF-IDF vectorization.

***Smart Heuristic Filtering:** The extension intelligently distinguishes between actual headlines and irrelevant text (like summaries or menus) by ignoring text smaller than 16px, having fewer than 4 words, or lacking bold styling.

***Real-time Visual Feedback:** Modifies the web page dynamically, labeling clickbait with a red "CLICKBAIT" badge and normal news with a green "NORMAL" badge.

## 📂 Folder Structure
`api/`: Contains the Python server, pre-trained models (`.pkl`), and `requirements.txt`.

`extension/`: Contains the Chrome Extension source code (`manifest.json`, `content.js`, etc.).

`data/`: Contains the dataset used for training.

`notebooks/`: Jupyter notebooks used for data analysis and model training.

## 🛠️ Requirements
To run this project, you need:
1.  **Python 3.8+** installed on your system.
2.  **Google Chrome** browser.
3.  Internet connection (for NLTK data download).

## 🚀 Step-by-Step Installation Guide

### STEP 1: Set Up the Backend (Python Server)
The extension relies on a local server to analyze text.
1.  Navigate to the `api` folder.
2.  Open a terminal/command prompt in this folder.
3.  Install the required libraries:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the server:
    ```bash
    python app.py
    ```
5.  You should see a message: `Running on http://127.0.0.1:5000`. **Keep this terminal window OPEN**.

### STEP 2: Install the Chrome Extension
1.  Open Google Chrome and type `chrome://extensions/` in the address bar.
2.  Toggle **Developer mode** on (top right corner).
3.  Click the **Load unpacked** button (top left).
4.  Select the `extension` folder from the project directory.
5.  The extension "Clickbait Detector AI" should now appear in your list.

### ⚠️ STEP 3: Browser Permission 
Since our API runs on `http://localhost` (unsecured) and news sites like CNN use `https` (secured), Chrome blocks the connection by default ("Mixed Content Error"). **You MUST allow insecure content for the extension to work**:

1.  Go to a news site (e.g., https://www.bbc.com or https://www.cnn.com).
2.  Click the **Lock Icon (🔒)** or Settings icon on the left side of the address bar.
3.  Click **Site Settings**.
4.  Scroll down to find **Insecure content**.
5.  Change the setting from "Block" to **"Allow"**.
6.  **Reload the page**.

Now, you will see "🎣 CLICKBAIT" or "✅ NORMAL" badges next to headlines!

---
**Note:** Generative AI models were utilized to assist in the development, code generation, and documentation of this project.
