// --- Configuration ---
const API_URL = "http://127.0.0.1:5000/predict";

console.log("Background Service Worker Started.");

// --- Message Listener ---
// Listens for messages sent from content scripts or the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ANALYZE_HEADLINE") {
        
        // Execute the async API call and send the result back
        handleApiRequest(request.text).then(sendResponse);
        
        // Important: Return true to indicate that the response is asynchronous.
        // If you remove this, the communication channel closes before data arrives.
        return true; 
    }
});

// --- Helper Functions ---
async function handleApiRequest(text) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ headline: text })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data: data };

    } catch (error) {
        console.error("API Fetch Error:", error);
        return { success: false, error: error.message };
    }
}