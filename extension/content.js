console.log("Clickbait Detection is working.");

// Define selectors globally to avoid recreating the array repeatedly
const HEADLINE_SELECTORS = [
    "[data-testid='card-headline']", 
    ".container__headline-text", 
    ".cd__headline-text", 
    ".media__title", 
    "h1", "h2", "h3", 
    ".story-body__crosshead"
].join(", ");

// Common navigational or UI text to ignore
const IGNORED_PHRASES = [
    "read more", "see more", "watch", "video", "full story", 
    "next", "previous", "sign in", "login", "subscribe", 
    "follow us", "contact", "search", "menu", "only from the bbc", 
    "top stories", "must watch", "most read", "editors' picks", 
    "sport", "weather", "features", "analysis"
];

// --- Main Processing Logic ---

function processHeadline(element) {
    // 1. Check if already processed to prevent loops
    if (element.dataset.cbChecked === "true") return;

    // 2. Ignore elements inside navigation, footers, or ads
    if (element.closest("nav, footer, header, .menu, .ad-container, .footer, .ob-widget, .nav-links")) return;
    if (element.getAttribute("data-testid") === "indiana-title") return;
    
    // 3. Extract and validate text
    const text = element.innerText.trim();
    if (!text || text.length < 15 || text.length > 500) return;

    // 4. Check against ban list (UI elements)
    const lowerText = text.toLowerCase();
    const isBanned = IGNORED_PHRASES.some(phrase => 
        lowerText === phrase || lowerText.startsWith(phrase + ":")
    );
    if (isBanned) return;

    // 5. Check visibility
    if (element.offsetWidth < 1 || element.offsetHeight < 1) return;

    // 6. Mark as processed and send to background script
    element.dataset.cbChecked = "true";

    try {
        chrome.runtime.sendMessage({ type: "ANALYZE_HEADLINE", text: text }, (response) => {
            // Check for runtime errors
            if (chrome.runtime.lastError) return;
            if (response && response.success) {
                applyResult(element, response.data);
            }
        });
    } catch (e) {
        // Suppress messaging errors usually caused by context invalidation
    }
}

function applyResult(element, data) {
    // Avoid duplicate badges
    if (element.querySelector(".cb-badge")) return;

    const badge = document.createElement("span");
    badge.className = "cb-badge"; 
    
    // Base styles for the badge
    Object.assign(badge.style, {
        fontSize: "11px", 
        lineHeight: "normal", 
        fontWeight: "bold", 
        fontFamily: "Arial, sans-serif",
        textTransform: "uppercase", 
        display: "inline-block", 
        marginLeft: "10px", 
        verticalAlign: "middle", 
        padding: "2px 4px",
        whiteSpace: "nowrap",
        borderBottom: "2px solid"
    });

    if (data.result === "clickbait") {
        badge.style.color = "#D32F2F"; 
        badge.style.borderColor = "#D32F2F"; 
        badge.innerText = "🎣 CLICKBAIT";
    } else {
        badge.style.color = "#2E7D32"; 
        badge.style.borderColor = "#2E7D32"; 
        badge.innerText = "✅ NORMAL";
    }
    
    element.appendChild(badge);
}

// --- Observer Setup ---
// MutationObserver allows us to catch headlines that load dynamically 
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { 
                if (node.matches && node.matches(HEADLINE_SELECTORS)) {
                    processHeadline(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll(HEADLINE_SELECTORS).forEach(processHeadline);
                }
            }
        });
    });
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial pass: Process existing headlines on page load
document.querySelectorAll(HEADLINE_SELECTORS).forEach(processHeadline);