// ============================================
// AYUTH - Main Application Logic
// AI Chat, Invention Profiling, Locker, Settings
// ============================================

// Global State
let appState = {
  jurisdiction: localStorage.getItem("ayuthJurisdiction") || "india",
  apiKey: localStorage.getItem("ayuthApiKey") || null, // Persist API key
  apiModel: localStorage.getItem("ayuthModel") || "gemini-1.5-pro",
  inventionProfile: JSON.parse(localStorage.getItem("ayuthProfile")) || null,
  conversationHistory: JSON.parse(localStorage.getItem("ayuthChat")) || [],
  isLoading: false,
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  // Load saved settings
  const jurisdiction = localStorage.getItem("ayuthJurisdiction") || "india";
  document.querySelector(
    `input[name="jurisdiction"][value="${jurisdiction}"]`
  ).checked = true;
  updateJurisdictionIndicator();

  // Set up event listeners
  setupEventListeners();

  // Load settings from localStorage
  loadSettings();

  // Display initial greeting
  if (appState.conversationHistory.length === 0) {
    addMessageToChat(t("greetingMessage"), "assistant");
  } else {
    // Restore conversation history
    appState.conversationHistory.forEach((msg) => {
      addMessageToChat(msg.content, msg.role);
    });
  }

  // Update session info
  updateSessionInfo();

  // Load invention profile if exists
  if (appState.inventionProfile) {
    displayInventionProfileSummary();
  }
}

function setupEventListeners() {
  // Jurisdiction toggle
  document.querySelectorAll('input[name="jurisdiction"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      appState.jurisdiction = e.target.value;
      localStorage.setItem("ayuthJurisdiction", e.target.value);
      updateJurisdictionIndicator();
    });
  });

  // API Key input - use "input" for real-time, and "change" for when it loses focus
  const apiKeyInput = document.getElementById("apiKeyInput");
  if (apiKeyInput) {
    apiKeyInput.value = appState.apiKey || ""; // Restore saved API key
    apiKeyInput.addEventListener("input", (e) => {
      appState.apiKey = e.target.value || null;
      localStorage.setItem("ayuthApiKey", appState.apiKey || "");
      updateAPIStatus();
    });
    apiKeyInput.addEventListener("change", (e) => {
      appState.apiKey = e.target.value || null;
      localStorage.setItem("ayuthApiKey", appState.apiKey || "");
      updateAPIStatus();
    });
  }

  // Model selection
  const modelSelect = document.getElementById("modelSelect");
  if (modelSelect) {
    modelSelect.addEventListener("change", (e) => {
      appState.apiModel = e.target.value;
      localStorage.setItem("ayuthModel", e.target.value);
    });
  }

  // Chat input - auto-focus and Enter to send
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Settings and Info buttons
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("infoBtn").addEventListener("click", openInfo);
}

// ============================================
// Settings & API Key Management
// ============================================

function openSettings() {
  const modal = document.getElementById("settingsModal");
  modal.classList.remove("hidden");
}

function closeSettings() {
  const modal = document.getElementById("settingsModal");
  modal.classList.add("hidden");
}

function openInfo() {
  const modal = document.getElementById("infoModal");
  modal.classList.remove("hidden");
}

function closeInfo() {
  const modal = document.getElementById("infoModal");
  modal.classList.add("hidden");
}

function toggleApiKeyVisibility() {
  const input = document.getElementById("apiKeyInput");
  const btn = document.getElementById("toggleApiKeyVisibility");
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
}

function updateAPIStatus() {
  const statusSpan = document.querySelector(".status-text span");
  if (!statusSpan) return; // Handle when modal isn't loaded yet
  if (appState.apiKey && appState.apiKey.trim().length > 0) {
    statusSpan.textContent = t("statusConnected");
    statusSpan.className = "status-connected";
  } else {
    statusSpan.textContent = t("statusOffline");
    statusSpan.className = "status-offline";
  }
}

function loadSettings() {
  updateAPIStatus();
  const modelSelect = document.getElementById("modelSelect");
  if (modelSelect) {
    modelSelect.value = appState.apiModel;
  }
}

function clearSession() {
  if (confirm(t("confirmClearSession"))) {
    localStorage.removeItem("ayuthProfile");
    localStorage.removeItem("ayuthChat");
    appState.inventionProfile = null;
    appState.conversationHistory = [];
    document.getElementById("chatMessages").innerHTML = "";
    document.getElementById("profileSummary").classList.add("hidden");
    updateSessionInfo();
    addMessageToChat(t("sessionClearedMessage"), "assistant");
    addMessageToChat(t("greetingMessage"), "assistant");
  }
}

function updateJurisdictionIndicator() {
  const indicator = document.getElementById("jurisdictionIndicator");
  if (appState.jurisdiction === "india") {
    indicator.textContent = t("jurisdictionIndia");
    indicator.className = "badge badge-india";
  } else {
    indicator.textContent = t("jurisdictionIntl");
    indicator.className = "badge badge-intl";
  }
}

// ============================================
// Tab Navigation
// ============================================

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  const tab = document.getElementById(tabName + "Tab");
  if (tab) {
    tab.classList.add("active");
  }

  // Add active class to nav button
  const navBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (navBtn) {
    navBtn.classList.add("active");
  }

  // Special handling for KB tab - ensure it's rendered
  if (tabName === "kb" && typeof renderKnowledgeBase === "function") {
    renderKnowledgeBase();
  }
}

// ============================================
// Chat Interface
// ============================================

function addMessageToChat(content, role = "user") {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";

  // Parse for risk alerts in assistant messages
  if (role === "assistant") {
    contentDiv.innerHTML = parseMessageForAlerts(content);
  } else {
    contentDiv.innerHTML = escapeHtml(content);
  }

  messageDiv.appendChild(contentDiv);

  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const timestampDiv = document.createElement("div");
  timestampDiv.className = "message-timestamp";
  timestampDiv.textContent = timestamp;
  messageDiv.appendChild(timestampDiv);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Save to history
  appState.conversationHistory.push({ role, content, timestamp });
  localStorage.setItem("ayuthChat", JSON.stringify(appState.conversationHistory));
  updateSessionInfo();
}

function parseMessageForAlerts(content) {
  let html = escapeHtml(content);

  // Check for risk keywords and inject alerts
  const alerts = [
    {
      pattern: /TKDL|traditional knowledge|overlaps?/gi,
      type: "tkdl",
      title: t("tkdlAlertTitle"),
      message: t("tkdlAlertMessage"),
    },
    {
      pattern: /biopiracy|biological resources|benefit-sharing/gi,
      type: "biopiracy",
      title: t("biopiracyAlertTitle"),
      message: t("biopiracyAlertMessage"),
    },
    {
      pattern: /novelty|prior art|public disclosure/gi,
      type: "novelty",
      title: t("noveltyAlertTitle"),
      message: t("noveltyAlertMessage"),
    },
  ];

  let hasAlert = false;
  alerts.forEach((alert) => {
    if (alert.pattern.test(content) && !hasAlert) {
      const alertHtml = `
        <div class="risk-alert ${alert.type}">
          <div class="risk-alert-icon">⚠️</div>
          <div class="risk-alert-content">
            <h4>${alert.title}</h4>
            <p>${alert.message}</p>
          </div>
        </div>
      `;
      html = alertHtml + html;
      hasAlert = true; // Only show one alert per message
    }
  });

  return html;
}

function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message
  addMessageToChat(message, "user");
  chatInput.value = "";
  chatInput.focus(); // Return focus to input for continuous typing

  // Get AI response
  getAIResponse(message);
}

async function getAIResponse(userMessage) {
  appState.isLoading = true;
  const chatMessages = document.getElementById("chatMessages");

  // Add loading indicator
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message assistant";
  loadingDiv.innerHTML =
    '<div class="message-content"><em>' + t("loadingMessage") + '</em></div>';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    // Check if API key is available for live mode
    if (appState.apiKey && appState.apiKey.trim().length > 0) {
      // Live AI mode
      const response = await callGeminiAPI(userMessage);
      loadingDiv.remove();
      addMessageToChat(response, "assistant");
    } else {
      // Offline mode - use knowledge base
      loadingDiv.remove();
      const response = getOfflineResponse(userMessage);
      addMessageToChat(response, "assistant");
    }
  } catch (error) {
    loadingDiv.remove();
    addMessageToChat(
      t("errorMessage") + " (" + error.message + ")",
      "assistant"
    );
  }

  appState.isLoading = false;
}

function retrieveRelevantKnowledge(userMessage, limit = 3) {
  const query = userMessage.toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);

  const scored = knowledgeBase
    .map((item) => {
      const question = item.question.toLowerCase();
      const answer = item.answer.toLowerCase();
      const category = item.category.toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (!term) continue;
        if (question.includes(term)) score += 5;
        if (answer.includes(term)) score += 2;
        if (category.includes(term)) score += 4;
      }

      if (query.includes(category)) score += 6;
      if (question.includes(query) || answer.includes(query)) score += 8;

      if (item.jurisdiction.includes(appState.jurisdiction)) score += 2;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);

  return scored;
}

async function callGeminiAPI(userMessage) {
  const response = await fetch("http://localhost:4000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: userMessage,
      jurisdiction: appState.jurisdiction,
      inventionProfile: appState.inventionProfile || {},
      apiKey: appState.apiKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `Backend API error: ${response.status}`;

    if (response.status === 401 || message.toLowerCase().includes("api key")) {
      throw new Error("Invalid API key. Check your Gemini API key in settings.");
    }

    throw new Error(message);
  }

  const data = await response.json();
  return data.answer || "I could not generate a grounded answer.";
}

function getOfflineResponse(userMessage) {
  const matches = retrieveRelevantKnowledge(userMessage, 1);

  if (matches.length > 0) {
    const item = matches[0];
    let response = `**${item.question}**\n\n${item.answer}\n\n*Citation: ${item.citation}*`;
    response += `\n\n${t("disclaimerFooter")}`;
    return response;
  }

  let fallback = `I could not find a direct match in the AYUTH knowledge base for "${userMessage}".\n\nThis system does not assume facts beyond the available source material. Please browse the Q&A Library or connect a Gemini API key for a retrieval-grounded answer based on the local knowledge base.\n\n${t("disclaimerFooter")}`;

  return fallback;
}

// ============================================
// Invention Profile / Classifier
// ============================================

function saveInventionProfile() {
  const q1 = document.getElementById("q1").value.trim();
  const q2 = document.getElementById("q2").value.trim();
  const q3 = document.getElementById("q3").value.trim();
  const q4 = document.getElementById("q4").value;
  const q5 = document.getElementById("q5").value;

  const missingFields = [];
  if (!q1) missingFields.push(t("q1Field"));
  if (!q2) missingFields.push(t("q2Field"));
  if (!q3) missingFields.push(t("q3Field"));
  if (!q4) missingFields.push(t("q4Field"));
  if (!q5) missingFields.push(t("q5Field"));

  if (missingFields.length > 0) {
    alert(t("promptAllQuestions") + "\n" + missingFields.map((f) => "• " + f).join("\n"));
    return;
  }

  appState.inventionProfile = {
    description: q1,
    problem: q2,
    novelty: q3,
    disclosure: q4,
    bioResources: q5,
    savedAt: new Date().toLocaleString(),
  };

  localStorage.setItem("ayuthProfile", JSON.stringify(appState.inventionProfile));
  displayInventionProfileSummary();
  updateSessionInfo();

  // Notify user in chat
  addMessageToChat(t("profileSavedMessage"), "assistant");
}

function displayInventionProfileSummary() {
  const profileSummary = document.getElementById("profileSummary");
  const profileContent = document.getElementById("profileContent");

  if (!appState.inventionProfile) {
    profileSummary.classList.add("hidden");
    return;
  }

  const profile = appState.inventionProfile;
  profileContent.innerHTML = `
    <p><strong>${t("profileInventionLabel")}</strong> ${escapeHtml(profile.description)}</p>
    <p><strong>${t("profileProblemLabel")}</strong> ${escapeHtml(profile.problem)}</p>
    <p><strong>${t("profileNoveltyLabel")}</strong> ${escapeHtml(profile.novelty)}</p>
    <p><strong>${t("profileDisclosureLabel")}</strong> ${profile.disclosure}</p>
    <p><strong>${t("profileBioLabel")}</strong> ${profile.bioResources}</p>
    <p><small>${t("profileSavedAtLabel")} ${profile.savedAt}</small></p>
  `;

  profileSummary.classList.remove("hidden");
}

function clearInventionProfile() {
  if (confirm(t("confirmClearProfile"))) {
    appState.inventionProfile = null;
    localStorage.removeItem("ayuthProfile");
    document.getElementById("classifierForm").reset();
    document.getElementById("profileSummary").classList.add("hidden");
    updateSessionInfo();
  }
}

// ============================================
// Invention Locker - Proof of Conception
// ============================================

async function generateInventionHash() {
  const inventionText = document.getElementById("inventionText").value.trim();

  if (!inventionText) {
    alert(t("pasteInventionPrompt"));
    return;
  }

  try {
    // Generate SHA-256 hash using SubtleCrypto
    const encoder = new TextEncoder();
    const data = encoder.encode(inventionText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Get timestamp
    const timestamp = new Date().toISOString();

    // Display result
    document.getElementById("hashTimestampValue").textContent = timestamp;
    document.getElementById("hashValue").textContent = hashHex;
    document.getElementById("hashSize").textContent =
      inventionText.length + " characters";

    document.getElementById("hashResult").classList.remove("hidden");
  } catch (error) {
    alert("Error generating hash: " + error.message);
  }
}

function screenshotReceipt() {
  const hashResult = document.getElementById("hashResult");

  // Use html2canvas library if available, otherwise fallback to print
  if (typeof html2canvas !== "undefined") {
    html2canvas(hashResult).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = "ayuth-proof-of-conception-" + Date.now() + ".png";
      link.click();
    });
  } else {
    // Fallback: just print (user can screenshot from print preview)
    window.print();
  }
}

function copyHashToClipboard() {
  const hashValue = document.getElementById("hashValue").textContent;
  navigator.clipboard.writeText(hashValue).then(() => {
    alert(t("hashCopiedMessage"));
  });
}

// ============================================
// Session Info
// ============================================

function updateSessionInfo() {
  const profileStatus = document.getElementById("profileStatus");
  const messageCount = document.getElementById("messageCount");

  if (appState.inventionProfile) {
    profileStatus.textContent = t("activeStatus");
    profileStatus.style.color = "var(--color-success)";
  } else {
    profileStatus.textContent = t("profileNotSet");
    profileStatus.style.color = "var(--color-text-light)";
  }

  messageCount.textContent = appState.conversationHistory.length;
}

// ============================================
// Utility Functions
// ============================================

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  const settingsModal = document.getElementById("settingsModal");
  const infoModal = document.getElementById("infoModal");

  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
  if (e.target === infoModal) {
    infoModal.classList.add("hidden");
  }
});

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("settingsModal").classList.add("hidden");
    document.getElementById("infoModal").classList.add("hidden");
  }
});
