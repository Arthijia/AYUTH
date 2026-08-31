// ============================================
// AYUTH - Internationalization (i18n)
// Multi-language support: English, Hindi, Kannada
// ============================================

const translations = {
  en: {
    // Header
    headerTitle: "AYUTH",
    headerSubtitle: "IP-SAKTI Sahayak",

    // Settings Modal
    settingsTitle: "Settings",
    jurisdictionLabel: "Jurisdiction",
    jurisdictionIndia: "India Only",
    jurisdictionIntl: "International Regimes (WIPO, CBD)",
    apiKeyLabel: "API Configuration",
    apiHelpText: "Enter your Gemini API key to enable Live AI mode. Leave empty to use Offline mode.",
    apiStatus: "Status:",
    apiStatusLabel: "Status:",
    statusConnected: "Connected (Live AI Mode)",
    statusOffline: "Not Connected (Offline Mode)",
    toggleVisibilityBtn: "👁️",
    modelLabel: "AI Model",
    dataLabel: "Session Data",
    clearSessionBtn: "Clear All Session Data",
    clearWarning: "This will delete the invention profile and chat history.",
    closeSettingsBtn: "Done",

    // Info Modal
    infoTitle: "About AYUTH",
    infoWhatIsHeading: "What is AYUTH?",
    infoWhatIs: "AYUTH (IP-SAKTI Sahayak) is an AI-powered assistant that provides guidance on intellectual property (IP) and regulatory matters specific to Ayurvedic inventions and innovations.",
    infoScopeHeading: "Scope",
    infoScope1: "Patent eligibility and inventive step",
    infoScope2: "Traditional Knowledge (TK) and TKDL overlaps",
    infoScope3: "Biological resource rules and biopiracy prevention",
    infoScope4: "Trademarks vs. Patents",
    infoScope5: "Geographical Indications (GI)",
    infoScope6: "AYUSH manufacturing licenses",
    infoScope7: "International filing routes",
    infoNotScopeHeading: "NOT Covered",
    infoNotScope: "Medical advice, treatment claims, clinical efficacy, or therapeutic guidance. For health-related questions, consult a qualified healthcare provider.",
    infoDisclaimerHeading: "Important Disclaimer",
    infoDisclaimer: "This tool provides informational guidance only and is NOT a substitute for professional legal advice from a registered patent attorney or IP counselor. Always consult qualified professionals before filing patents or making regulatory submissions.",

    // Sidebar Navigation
    navMain: "Main",
    navChat: "Chat",
    navClassifier: "Invention Profile",
    navLocker: "Invention Locker",
    navKnowledge: "Knowledge Base",
    navKB: "Q&A Library",
    navSession: "Session",
    sessionStatus: "Profile:",
    sessionMessages: "Messages:",
    profileNotSet: "Not Set",

    // Chat Tab
    chatTitle: "IP & Regulatory Guidance Chat",
    chatPlaceholder: "Ask about IP, patents, TK overlaps, regulatory licensing...",
    disclaimerFooter: "This is informational guidance, not a substitute for a registered patent attorney.",

    // Invention Classifier
    classifierTitle: "Invention Profile Builder",
    classifierDescription: "Answer these 5 questions to build your invention profile. This helps AYUTH provide better guidance tailored to your innovation.",
    q1Label: "1. What is your invention? (Brief description)",
    q1Placeholder: "e.g., A new formulation combining Ashwagandha with bioavailability enhancers...",
    q2Label: "2. What problem does it solve?",
    q2Placeholder: "e.g., Current formulations have poor absorption, limiting clinical efficacy...",
    q3Label: "3. What is technically novel about it?",
    q3Placeholder: "e.g., The specific ratio of ingredients and the stabilization process are new...",
    q4Label: "4. Has it been publicly disclosed before? (Publications, social media, presentations)",
    q4Placeholder: "-- Select --",
    q4No: "No",
    q4YesLimited: "Yes, in limited circles (confidential discussions)",
    q4YesPublic: "Yes, publicly (papers, presentations, social media)",
    q5Label: "5. Does it use biological resources or traditional knowledge?",
    q5Placeholder: "-- Select --",
    q5No: "No, purely synthetic or non-biological",
    q5Biological: "Yes, biological resources but not traditional knowledge",
    q5TK: "Yes, traditional knowledge (e.g., Vedic, Siddha, Unani practices)",
    q5Both: "Yes, both biological resources and traditional knowledge",
    saveProfileBtn: "Save Profile",
    clearProfileBtn: "Clear",
    profileSummaryTitle: "Current Profile",

    // Invention Locker
    lockerTitle: "Invention Locker",
    lockerDescription: "Create a timestamped proof-of-conception record by hashing your invention description. This is stored locally in your browser — never uploaded anywhere.",
    inventionTextLabel: "Paste your invention description:",
    inventionTextPlaceholder: "Full description of your invention, including technical details, methodology, expected benefits...",
    generateHashBtn: "Generate Hash & Timestamp",
    hashResultTitle: "Your Proof-of-Conception Receipt",
    hashNote: "Screenshot or save this receipt as your informal proof-of-conception evidence.",
    hashTimestampLabel: "Timestamp:",
    hashValueLabel: "SHA-256 Hash:",
    hashSizeLabel: "Text Size:",
    screenshotBtn: "📸 Screenshot Receipt",
    copyHashBtn: "📋 Copy Hash",
    lockerPrivacyNote: "✓ Completely private: No data is stored on any server. Your invention text is never uploaded or transmitted.",

    // Knowledge Base
    kbTitle: "Offline Knowledge Base",
    kbDescription: "Curated Q&A on common IP and regulatory questions for Ayurvedic inventions.",
    kbSearch: "Search Q&A...",

    // Buttons
    sendBtn: "Send",

    // Messages
    loadingMessage: "Thinking...",
    errorMessage: "Sorry, something went wrong. Please try again.",
    offlineModeMessage: "Using Offline Mode (API not connected)",
    greetingMessage: "Hello! I'm AYUTH, your IP and regulatory guidance assistant for Ayurvedic inventions. How can I help you today? You can ask about patents, traditional knowledge overlaps, TKDL risks, trademark strategy, regulatory compliance, and much more.",
    profileSavedMessage: "Profile saved successfully!",
    hashCopiedMessage: "Hash copied to clipboard!",
    sessionClearedMessage: "Session data cleared.",
    activeStatus: "Active",
    confirmClearSession: "Are you sure? This will delete your profile and chat history.",
    confirmClearProfile: "Clear the invention profile?",
    promptAllQuestions: "Please answer all questions:",
    q1Field: "invention description (Q1)",
    q2Field: "problem statement (Q2)",
    q3Field: "technical novelty (Q3)",
    q4Field: "disclosure status (Q4)",
    q5Field: "biological resources (Q5)",
    pasteInventionPrompt: "Please paste your invention description.",
    profileInventionLabel: "Invention:",
    profileProblemLabel: "Problem Solved:",
    profileNoveltyLabel: "Technical Novelty:",
    profileDisclosureLabel: "Public Disclosure:",
    profileBioLabel: "Biological Resources/TK:",
    profileSavedAtLabel: "Saved:",
    tkdlAlertMessage: "This formulation may overlap with traditional knowledge documented in TKDL.",
    biopiracyAlertMessage: "Ensure you comply with biopiracy regulations and obtain NBA clearance.",
    noveltyAlertMessage: "Carefully assess novelty before filing to avoid rejection.",

    // Risk Alerts
    tkdlAlertTitle: "⚠️ TKDL Alert",
    biopiracyAlertTitle: "⚠️ Biopiracy Risk",
    noveltyAlertTitle: "ℹ️ Novelty Concern",
  },

  hi: {
    // Header
    headerTitle: "AYUTH",
    headerSubtitle: "IP-SAKTI सहायक",

    // Settings Modal
    settingsTitle: "सेटिंग्स",
    jurisdictionLabel: "क्षेत्राधिकार",
    jurisdictionIndia: "केवल भारत",
    jurisdictionIntl: "अंतर्राष्ट्रीय व्यवस्था (WIPO, CBD)",
    apiKeyLabel: "API कॉन्फ़िगरेशन",
    apiHelpText: "लाइव AI मोड सक्षम करने के लिए अपनी Gemini API कुंजी दर्ज करें। ऑफलाइन मोड उपयोग करने के लिए खाली छोड़ें।",
    apiStatus: "स्थिति:",
    apiStatusLabel: "स्थिति:",
    statusConnected: "जुड़ा हुआ (लाइव AI मोड)",
    statusOffline: "जुड़ा नहीं (ऑफलाइन मोड)",
    toggleVisibilityBtn: "👁️",
    modelLabel: "AI मॉडल",
    dataLabel: "सत्र डेटा",
    clearSessionBtn: "सभी सत्र डेटा साफ़ करें",
    clearWarning: "यह आविष्कार प्रोफ़ाइल और चैट इतिहास को हटा देगा।",
    closeSettingsBtn: "पूर्ण",

    // Info Modal
    infoTitle: "AYUTH के बारे में",
    infoWhatIsHeading: "AYUTH क्या है?",
    infoWhatIs: "AYUTH (IP-SAKTI सहायक) एक AI-संचालित सहायक है जो आयुर्वेदिक आविष्कारों के लिए बौद्धिक संपत्ति (IP) और नियामक मामलों पर मार्गदर्शन प्रदान करता है।",
    infoScopeHeading: "दायरा",
    infoScope1: "पेटेंट पात्रता और आविष्कारी कदम",
    infoScope2: "पारंपरिक ज्ञान (TK) और TKDL अतिव्यापी",
    infoScope3: "जैविक संसाधन नियम और बायोपायरेसी रोकथाम",
    infoScope4: "ट्रेडमार्क बनाम पेटेंट",
    infoScope5: "भौगोलिक संकेत (GI)",
    infoScope6: "AYUSH विनिर्माण लाइसेंस",
    infoScope7: "अंतर्राष्ट्रीय फाइलिंग मार्ग",
    infoNotScopeHeading: "कवर नहीं",
    infoNotScope: "चिकित्सा सलाह, उपचार दावे, नैदानिक प्रभावकारिता, या चिकित्सीय मार्गदर्शन। स्वास्थ्य संबंधी प्रश्नों के लिए, योग्य स्वास्थ्यसेवा प्रदाता से परामर्श लें।",
    infoDisclaimerHeading: "महत्वपूर्ण अस्वीकरण",
    infoDisclaimer: "यह उपकरण केवल सूचनात्मक मार्गदर्शन प्रदान करता है और पंजीकृत पेटेंट वकील या IP सलाहकार से पेशेवर कानूनी सलाह का विकल्प नहीं है। पेटेंट दाखिल करने या नियामक प्रस्तुतियों से पहले हमेशा योग्य पेशेवरों से परामर्श लें।",

    // Sidebar Navigation
    navMain: "मुख्य",
    navChat: "चैट",
    navClassifier: "आविष्कार प्रोफ़ाइल",
    navLocker: "आविष्कार लॉकर",
    navKnowledge: "ज्ञान आधार",
    navKB: "Q&A लाइब्रेरी",
    navSession: "सत्र",
    sessionStatus: "प्रोफ़ाइल:",
    sessionMessages: "संदेश:",
    profileNotSet: "सेट नहीं",

    // Chat Tab
    chatTitle: "IP और नियामक मार्गदर्शन चैट",
    chatPlaceholder: "IP, पेटेंट, TK अतिव्यापी, नियामक लाइसेंसिंग के बारे में पूछें...",
    disclaimerFooter: "यह सूचनात्मक मार्गदर्शन है, पंजीकृत पेटेंट वकील का विकल्प नहीं।",

    // Invention Classifier
    classifierTitle: "आविष्कार प्रोफ़ाइल बिल्डर",
    classifierDescription: "अपनी आविष्कार प्रोफ़ाइल बनाने के लिए इन 5 प्रश्नों का उत्तर दें। यह AYUTH को आपके नवाचार के लिए बेहतर मार्गदर्शन प्रदान करने में मदद करता है।",
    q1Label: "1. आपका आविष्कार क्या है? (संक्षिप्त विवरण)",
    q1Placeholder: "उदा., अश्वगंधा को बायोएवेलेबिलिटी एन्हांसर के साथ मिलाने वाला एक नया फॉर्मूलेशन...",
    q2Label: "2. यह किस समस्या को हल करता है?",
    q2Placeholder: "उदा., वर्तमान फॉर्मूलेशन में खराब अवशोषण है, नैदानिक प्रभावकारिता को सीमित करता है...",
    q3Label: "3. इसमें तकनीकी रूप से क्या नया है?",
    q3Placeholder: "उदा., सामग्री का विशिष्ट अनुपात और स्थिरीकरण प्रक्रिया नई है...",
    q4Label: "4. क्या इसे पहले सार्वजनिक रूप से प्रकट किया गया है? (प्रकाशन, सोशल मीडिया, प्रस्तुतियां)",
    q4Placeholder: "-- चुनें --",
    q4No: "नहीं",
    q4YesLimited: "हाँ, सीमित हलकों में (गोपनीय चर्चा)",
    q4YesPublic: "हाँ, सार्वजनिक रूप से (पेपर, प्रस्तुतियां, सोशल मीडिया)",
    q5Label: "5. क्या यह जैविक संसाधनों या पारंपरिक ज्ञान का उपयोग करता है?",
    q5Placeholder: "-- चुनें --",
    q5No: "नहीं, पूरी तरह से सिंथेटिक या गैर-जैविक",
    q5Biological: "हाँ, जैविक संसाधन लेकिन पारंपरिक ज्ञान नहीं",
    q5TK: "हाँ, पारंपरिक ज्ञान (उदा., वैदिक, सिद्ध, यूनानी प्रथाएं)",
    q5Both: "हाँ, जैविक संसाधन और पारंपरिक ज्ञान दोनों",
    saveProfileBtn: "प्रोफ़ाइल सहेजें",
    clearProfileBtn: "साफ़ करें",
    profileSummaryTitle: "वर्तमान प्रोफ़ाइल",

    // Invention Locker
    lockerTitle: "आविष्कार लॉकर",
    lockerDescription: "अपने आविष्कार विवरण को हैश करके एक टाइमस्टैम्प किए गए proof-of-conception रिकॉर्ड बनाएं। यह आपके ब्राउज़र में स्थानीय रूप से संग्रहीत है — कहीं भी अपलोड नहीं किया गया।",
    inventionTextLabel: "अपना आविष्कार विवरण पेस्ट करें:",
    inventionTextPlaceholder: "आपके आविष्कार का पूर्ण विवरण, तकनीकी विवरण, पद्धति, अपेक्षित लाभ सहित...",
    generateHashBtn: "हैश और टाइमस्टैम्प जेनरेट करें",
    hashResultTitle: "आपकी Proof-of-Conception रसीद",
    hashNote: "इस रसीद को अपनी informal proof-of-conception साक्ष्य के रूप में स्क्रीनशॉट या सहेजें।",
    hashTimestampLabel: "टाइमस्टैम्प:",
    hashValueLabel: "SHA-256 हैश:",
    hashSizeLabel: "पाठ आकार:",
    screenshotBtn: "📸 रसीद का स्क्रीनशॉट",
    copyHashBtn: "📋 हैश कॉपी करें",
    lockerPrivacyNote: "✓ पूरी तरह निजी: कोई भी डेटा किसी सर्वर पर संग्रहीत नहीं है। आपके आविष्कार का पाठ कभी अपलोड या प्रसारित नहीं होता।",

    // Knowledge Base
    kbTitle: "ऑफलाइन ज्ञान आधार",
    kbDescription: "आयुर्वेदिक आविष्कारों के लिए सामान्य IP और नियामक प्रश्नों पर curated Q&A।",
    kbSearch: "Q&A खोजें...",

    // Buttons
    sendBtn: "भेजें",

    // Messages
    loadingMessage: "सोच रहे हैं...",
    errorMessage: "खेद है, कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
    offlineModeMessage: "ऑफलाइन मोड का उपयोग कर रहे हैं (API जुड़ा नहीं है)",
    greetingMessage: "नमस्ते! मैं AYUTH हूँ, आयुर्वेदिक आविष्कारों के लिए आपका IP और नियामक मार्गदर्शन सहायक। मैं आपकी कैसे मदद कर सकता हूँ? आप पेटेंट, पारंपरिक ज्ञान अतिव्यापी, TKDL जोखिम, ट्रेडमार्क रणनीति, नियामक अनुपालन और बहुत कुछ के बारे में पूछ सकते हैं।",
    profileSavedMessage: "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!",
    hashCopiedMessage: "क्लिपबोर्ड पर हैश कॉपी किया गया!",
    sessionClearedMessage: "सत्र डेटा साफ़ किया गया।",
    activeStatus: "सक्रिय",
    confirmClearSession: "क्या आप वाकई सुनिश्चित हैं? यह आपकी प्रोफ़ाइल और चैट इतिहास को हटा देगा।",
    confirmClearProfile: "आविष्कार प्रोफ़ाइल साफ़ करें?",
    promptAllQuestions: "कृपया सभी प्रश्नों के उत्तर दें:",
    q1Field: "आविष्कार विवरण (Q1)",
    q2Field: "समस्या कथन (Q2)",
    q3Field: "तकनीकी नवीनता (Q3)",
    q4Field: "प्रकटीकरण स्थिति (Q4)",
    q5Field: "जैविक संसाधन (Q5)",
    pasteInventionPrompt: "कृपया अपना आविष्कार विवरण पेस्ट करें।",
    profileInventionLabel: "आविष्कार:",
    profileProblemLabel: "समस्या हल:",
    profileNoveltyLabel: "तकनीकी नवीनता:",
    profileDisclosureLabel: "सार्वजनिक प्रकटीकरण:",
    profileBioLabel: "जैविक संसाधन/TK:",
    profileSavedAtLabel: "सहेजा गया:",
    tkdlAlertMessage: "इस फॉर्मूलेशन का पारंपरिक ज्ञान से TKDL में दर्जed अतिव्यापी हो सकता है।",
    biopiracyAlertMessage: "कृपया बायोपायरेसी विनियमों का अनुपालन करें और NBA मंजूरी प्राप्त करें।",
    noveltyAlertMessage: "दाखिला करने से पहले नवीनता का सावधानीपूर्वक मूल्यांकन करें ताकि अस्वीकृति से बचा जा सके।",

    // Risk Alerts
    tkdlAlertTitle: "⚠️ TKDL सतर्कता",
    biopiracyAlertTitle: "⚠️ बायोपायरेसी जोखिम",
    noveltyAlertTitle: "ℹ️ नवीनता चिंता",
  },

  kn: {
    // Header
    headerTitle: "AYUTH",
    headerSubtitle: "IP-SAKTI ಸಹಾಯಕ",

    // Settings Modal
    settingsTitle: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    jurisdictionLabel: "ಅಧಿಕಾರ ವ್ಯವಸ್ಥೆ",
    jurisdictionIndia: "ಭಾರತ ಮಾತ್ರ",
    jurisdictionIntl: "ಅಂತರರಾಷ್ಟ್ರೀಯ ವ್ಯವಸ್ಥೆಗಳು (WIPO, CBD)",
    apiKeyLabel: "API ಕಾನ್ಫಿಗರೇಶನ್",
    apiHelpText: "ಲೈವ್ AI ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ನಿಮ್ಮ Gemini API ಕೀ ನಮೂದಿಸಿ. ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಬಳಸಲು ಖಾಲಿ ಬಿಡಿ.",
    apiStatus: "ಸ್ಥಿತಿ:",
    apiStatusLabel: "ಸ್ಥಿತಿ:",
    statusConnected: "ಸಂಪರ್ಕಿತ (ಲೈವ್ AI ಮೋಡ್)",
    statusOffline: "ಸಂಪರ್ಕವಿಲ್ಲ (ಆಫ್‌ಲೈನ್ ಮೋಡ್)",
    toggleVisibilityBtn: "👁️",
    modelLabel: "AI ಮಾದರಿ",
    dataLabel: "ಸೆಷನ್ ಡೇಟಾ",
    clearSessionBtn: "ಎಲ್ಲಾ ಸೆಷನ್ ಡೇಟಾ ಸ್ಪಷ್ಟ ಮಾಡಿ",
    clearWarning: "ಇದು ಆವಿಷ್ಕಾರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಚ್ಯಾಟ್ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿಹೋಗುವುದು.",
    closeSettingsBtn: "ಸಿದ್ಧ",

    // Info Modal
    infoTitle: "AYUTH ಬಗ್ಗೆ",
    infoWhatIsHeading: "AYUTH ಎಂದರೇನು?",
    infoWhatIs: "AYUTH (IP-SAKTI ಸಹಾಯಕ) ಆಯುರ್ವೇದಿಕ ಆವಿಷ್ಕಾರಗಳಿಗೆ ಬೌದ್ಧಿಕ ಸಂಪತ್ತು (IP) ಮತ್ತು ನಿಯಂತ್ರಕ ವಿಷಯಗಳ ಮೇಲೆ ಮಾರ್ಗದರ್ಶನ ಒದಗಿಸುವ AI-ಚಾಲಿತ ಸಹಾಯಕ.",
    infoScopeHeading: "ವ್ಯಾಪ್ತಿ",
    infoScope1: "ಪೇಟೆಂಟ್ ಪಾತ್ರತೆ ಮತ್ತು ಆವಿಷ್ಕಾರಿ ಹೆಜ್ಜೆ",
    infoScope2: "ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ (TK) ಮತ್ತು TKDL ಅತಿರೇಕ",
    infoScope3: "ಜೈವಿಕ ಸಂಪನ್ನ ನಿಯಮಗಳು ಮತ್ತು ಬಯೋ-ಲೂಟ ತಡೆಗಟ್ಟುವಿಕೆ",
    infoScope4: "ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ವಿರುದ್ಧ ಪೇಟೆಂಟ್",
    infoScope5: "ಭೌಗೋಳಿಕ ಸೂಚನೆಗಳು (GI)",
    infoScope6: "AYUSH ತಯಾರಿ ಪರವಾನೆಗಳು",
    infoScope7: "ಅಂತರರಾಷ್ಟ್ರೀಯ ಫೈಲಿಂಗ್ ಮಾರ್ಗಗಳು",
    infoNotScopeHeading: "ವ್ಯಾಪ್ತಿಯಲ್ಲಿಲ್ಲ",
    infoNotScope: "ವೈದ್ಯಕೀಯ ಸಲಹೆ, ಚಿಕಿತ್ಸೆಯ ಹೇಳಿಕೆಗಳು, ಕ್ಲಿನಿಕಲ್ ಪರಿಣಾಮಕಾರಿತೆ, ಅಥವಾ ಚಿಕಿತ್ಸಕ ಮಾರ್ಗದರ್ಶನ. ಆರೋಗ್ಯ-ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ, ಯೋಗ್ಯ ಆರೋಗ್ಯಸೇವೆ ಪೂರೈಕೆದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    infoDisclaimerHeading: "ಪ್ರಮುಖ ನಿರಾಕರಣೆ",
    infoDisclaimer: "ಈ ಸಾಧನವು ಮಾತ್ರ ಮಾಹಿತಿಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನವನ್ನು ಒದಗಿಸುತ್ತದೆ ಮತ್ತು ನೋಂದಾಯಿತ ಪೇಟೆಂಟ್ ವಕೀಲ ಅಥವಾ IP ಸಮಾಲೋಚಕರಿಂದ ವೃತ್ತಿಪರ ಕಾನೂನಿ ಸಲಹೆಯ ಬದಲಿ ಅಲ್ಲ. ಪೇಟೆಂಟ್ ಸಲ್ಲಿಸುವ ಅಥವಾ ನಿಯಂತ್ರಕ ಸಲ್ಲಿಕೆ ಮಾಡುವ ಮೊದಲು ಯಾವಾಗಲೂ ಯೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",

    // Sidebar Navigation
    navMain: "ಮುಖ್ಯ",
    navChat: "ಚ್ಯಾಟ್",
    navClassifier: "ಆವಿಷ್ಕಾರ ಪ್ರೊಫೈಲ್",
    navLocker: "ಆವಿಷ್ಕಾರ ತಾಲೆಬೇಟೆ",
    navKnowledge: "ಜ್ಞಾನ ಭಾಂಡಾರ",
    navKB: "Q&A ಲೈಬ್ರೆರಿ",
    navSession: "ಸೆಷನ್",
    sessionStatus: "ಪ್ರೊಫೈಲ್:",
    sessionMessages: "ಸಂದೇಶಗಳು:",
    profileNotSet: "ಹೊಂದಿಸಿಲ್ಲ",

    // Chat Tab
    chatTitle: "IP ಮತ್ತು ನಿಯಂತ್ರಕ ಮಾರ್ಗದರ್ಶನ ಚ್ಯಾಟ್",
    chatPlaceholder: "IP, ಪೇಟೆಂಟ್, TK ಅತಿರೇಕ, ನಿಯಂತ್ರಕ ಪರವಾನೆಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೋರಿ...",
    disclaimerFooter: "ಇದು ಮಾಹಿತಿಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನ, ನೋಂದಾಯಿತ ಪೇಟೆಂಟ್ ವಕೀಲಿಂದ ಅಲ್ಲ.",

    // Invention Classifier
    classifierTitle: "ಆವಿಷ್ಕಾರ ಪ್ರೊಫೈಲ್ ಮಾಪಕ",
    classifierDescription: "ನಿಮ್ಮ ಆವಿಷ್ಕಾರ ಪ್ರೊಫೈಲ್ ನಿರ್ಮಿಸಲು ಈ 5 ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಿ. ಇದು AYUTH ಅನ್ನು ನಿಮ್ಮ ನವಾಚಾರಕ್ಕೆ ಉತ್ತಮ ಮಾರ್ಗದರ್ಶನ ಒದಗಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    q1Label: "1. ನಿಮ್ಮ ಆವಿಷ್ಕಾರ ಯಾವುದು? (ಸಂಕ್ಷಿಪ್ತ ವರ್ಣನೆ)",
    q1Placeholder: "ಉದಾ., ಅಶ್ವಗಂಧಾ ಬಯೋಅವೇಲೆಬಿಲಿಟಿ ಎನ್‌ಹ್ಯಾನ್ಸರ್‌ಗಳೊಂದಿಗೆ ಸಂಯೋಜಿಸುವ ಹೊಸ ಸೂತ್ರೀಕರಣ...",
    q2Label: "2. ಇದು ಯಾವ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸುತ್ತದೆ?",
    q2Placeholder: "ಉದಾ., ವರ್ತಮಾನ ಸೂತ್ರೀಕರಣಗಳು ಕಳಪೆ ಹೀರಿಕೆಯನ್ನು ಹೊಂದಿವೆ, ಕ್ಲಿನಿಕಲ್ ಪರಿಣಾಮಕಾರಿತೆ ಸೀಮಿತ...",
    q3Label: "3. ಅದರಲ್ಲಿ ತಾಂತ್ರಿಕವಾಗಿ ಹೊಸದು ಯಾವುದು?",
    q3Placeholder: "ಉದಾ., ಸಮಗ್ರಣಗಳ ನಿರ್ದಿಷ್ಟ ಅನುಪಾತ ಮತ್ತು ಸ್ಥಿರಿಕರಣ ಪ್ರಕ್ರಿಯೆ ಹೊಸತರ...",
    q4Label: "4. ಇದನ್ನು ಪೂರ್ವಾಗ್ರಹದ ಸಾರ್ವಜನಿಕವಾಗಿ ಬಹಿರಂಗಪಡಿಸಲಾಗಿದೆಯೇ? (ಪ್ರಕಾಶನ, ಸೋಶ್ಯಲ್ ಮಿಡಿಯಾ, ಪ್ರಸ್ತುತಿಗಳು)",
    q4Placeholder: "-- ಆಯ್ಕೆ ಮಾಡಿ --",
    q4No: "ಇಲ್ಲ",
    q4YesLimited: "ಹೌದು, ಸೀಮಿತ ವಲಯಗಳಲ್ಲಿ (ರಹಸ್ಯ ಆಲೋಚನೆ)",
    q4YesPublic: "ಹೌದು, ಸಾರ್ವಜನಿಕವಾಗಿ (ಪ್ರಕಾಶನ, ಪ್ರಸ್ತುತಿಗಳು, ಸೋಶ್ಯಲ್ ಮಿಡಿಯಾ)",
    q5Label: "5. ಇದು ಜೈವಿಕ ಸಂಪನ್ನ ಅಥವಾ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನವನ್ನು ಬಳಸುತ್ತದೆಯೇ?",
    q5Placeholder: "-- ಆಯ್ಕೆ ಮಾಡಿ --",
    q5No: "ಇಲ್ಲ, ಸಂಪೂರ್ಣವಾಗಿ ಸಿಂಥೆಟಿಕ್ ಅಥವಾ ಜೈವಿಕವಲ್ಲದ",
    q5Biological: "ಹೌದು, ಜೈವಿಕ ಸಂಪನ್ನ ಆದರೆ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ಅಲ್ಲ",
    q5TK: "ಹೌದು, ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ (ಉದಾ., ವೈದಿಕ, ಸಿದ್ಧ, ಯೂನಾನಿ ಅಭ್ಯಾಸಗಳು)",
    q5Both: "ಹೌದು, ಜೈವಿಕ ಸಂಪನ್ನ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ಎರಡೂ",
    saveProfileBtn: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ",
    clearProfileBtn: "ಸ್ಪಷ್ಟ",
    profileSummaryTitle: "ಪ್ರಸ್ತುತ ಪ್ರೊಫೈಲ್",

    // Invention Locker
    lockerTitle: "ಆವಿಷ್ಕಾರ ತಾಲೆಬೇಟೆ",
    lockerDescription: "ನಿಮ್ಮ ಆವಿಷ್ಕಾರ ವರ್ಣನೆಯನ್ನು ಹ್ಯಾಶ್ ಮಾಡುವ ಮೂಲಕ ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್ಡ ಪ್ರೊಫ್-ಆಫ್-ಕಾನ್ಸೆಪ್ಟ್ ರೆಕಾರ್ಡ್ ರಚಿಸಿ. ಇದನ್ನು ನಿಮ್ಮ ಬ್ರೌಜರ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ — ಎಲ್ಲಿಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುವುದಿಲ್ಲ.",
    inventionTextLabel: "ನಿಮ್ಮ ಆವಿಷ್ಕಾರ ವರ್ಣನೆ ಪೇಸ್ಟ್ ಮಾಡಿ:",
    inventionTextPlaceholder: "ನಿಮ್ಮ ಆವಿಷ್ಕಾರದ ಸಂಪೂರ್ಣ ವರ್ಣನೆ, ತಾಂತ್ರಿಕ ವಿವರ, ವಿಧಾನ, ನಿರೀಕ್ಷಿತ ಲಾಭಗಳು...",
    generateHashBtn: "ಹ್ಯಾಶ್ ಮತ್ತು ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್ ಉತ್ಪನ್ನಗೊಳಿಸಿ",
    hashResultTitle: "ನಿಮ್ಮ ಪ್ರೊಫ್-ಆಫ್-ಕಾನ್ಸೆಪ್ಟ್ ರಸೀದಿ",
    hashNote: "ಈ ರಸೀದಿಯನ್ನು ನಿಮ್ಮ ಅನೌಪಚಾರಿಕ ಪ್ರೊಫ್-ಆಫ್-ಕಾನ್ಸೆಪ್ಟ್ ಸಾಕ್ಷ್ಯವಾಗಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಥವಾ ಉಳಿಸಿ.",
    hashTimestampLabel: "ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್:",
    hashValueLabel: "SHA-256 ಹ್ಯಾಶ್:",
    hashSizeLabel: "ಪಠ್ಯ ಗಾತ್ರ:",
    screenshotBtn: "📸 ರಸೀದಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್",
    copyHashBtn: "📋 ಹ್ಯಾಶ್ ನಕಲಿ",
    lockerPrivacyNote: "✓ ಸಂಪೂರ್ಣವಾಗಿ ಯೋಗ್ಯ: ಯಾವುದೇ ಡೇಟಾ ಯಾವುದೇ ಸರ್ವರ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ. ನಿಮ್ಮ ಆವಿಷ್ಕಾರ ಪಠ್ಯವನ್ನು ಎಂದಿಗೂ ಅಪ್‌ಲೋಡ್ ಅಥವಾ ರವಾನೆ ಮಾಡಲಾಗುವುದಿಲ್ಲ.",

    // Knowledge Base
    kbTitle: "ಆಫ್‌ಲೈನ್ ಜ್ಞಾನ ಭಾಂಡಾರ",
    kbDescription: "ಆಯುರ್ವೇದಿಕ ಆವಿಷ್ಕಾರಗಳಿಗೆ ಸಾಮಾನ್ಯ IP ಮತ್ತು ನಿಯಂತ್ರಕ ಪ್ರಶ್ನೆಗಳ ಮೇಲೆ Curated Q&A.",
    kbSearch: "Q&A ಹುಡುಕಿ...",

    // Buttons
    sendBtn: "ಕಳುಹಿಸಿ",

    // Messages
    loadingMessage: "ಆಲೋಚನೆ ಮಾಡುತ್ತಿದೆ...",
    errorMessage: "ಕ್ষಮಿಸಿ, ಏನೋ ಸರಿಯಾಗಿ ಹೋಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.",
    offlineModeMessage: "ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಬಳಸುತ್ತಿದೆ (API ಸಂಪರ್ಕಿತವಲ್ಲ)",
    greetingMessage: "ನಮಸ್ಕಾರ! ಆಯುರ್ವೇದಿಕ ಆವಿಷ್ಕಾರಗಳಿಗೆ ನಿಮ್ಮ IP ಮತ್ತು ನಿಯಂತ್ರಕ ಮಾರ್ಗದರ್ಶನ ಸಹಾಯಕ AYUTH ನಾನು. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನೀವು ಪೇಟೆಂಟ್, ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ಅತಿರೇಕ, TKDL ಅಪಾಯ, ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ಕೌಶಲ್ಯ, ನಿಯಂತ್ರಕ ಅನುಸರಣೆ ಮತ್ತು ಇನ್ನೂ ಬಹಳಷ್ಟು ಬಗ್ಗೆ ಕೇಳಬಹುದು.",
    profileSavedMessage: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಯಿತು!",
    hashCopiedMessage: "ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ಹ್ಯಾಶ್ ನಕಲಿ ಮಾಡಲಾಯಿತು!",
    sessionClearedMessage: "ಸೆಷನ್ ಡೇಟಾ ಸ್ಪಷ್ಟ ಮಾಡಿದೆ.",
    activeStatus: "ಸಕ್ರಿಯ",
    confirmClearSession: "ನೀವು ಖಚಿತವೇ? ಇದು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಚ್ಯಾಟ್ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿಹಾಕುತ್ತದೆ.",
    confirmClearProfile: "ಆವಿಷ್ಕಾರ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಸ್ಪಷ್ಟಗೊಳಿಸುವುದೇ?",
    promptAllQuestions: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಿ:",
    q1Field: "ಆವಿಷ್ಕಾರ ವಿವರಣೆ (Q1)",
    q2Field: "ಸಮಸ್ಯೆ ಹೇಳಿಕೆ (Q2)",
    q3Field: "ತಾಂತ್ರಿಕ ನವೀನತೆ (Q3)",
    q4Field: "ಪ್ರಕಟಣ ಸ್ಥಿತಿ (Q4)",
    q5Field: "ಜೈವಿಕ ಸಂಪನ್ನ (Q5)",
    pasteInventionPrompt: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆವಿಷ್ಕಾರ ವಿವರಣೆಯನ್ನು ಅಂಟಿಸಿ.",
    profileInventionLabel: "ಆವಿಷ್ಕಾರ:",
    profileProblemLabel: "ಸಮಸ್ಯೆ ಪರಿಹರಿಸಲಾಗಿದೆ:",
    profileNoveltyLabel: "ತಾಂತ್ರಿಕ ನವೀನತೆ:",
    profileDisclosureLabel: "ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆ:",
    profileBioLabel: "ಜೈವಿಕ ಸಂಪನ್ನ/TK:",
    profileSavedAtLabel: "ಉಳಿಸಲಾಗಿದೆ:",
    tkdlAlertMessage: "ಈ ಫಾರ್ಮುಲೇಷನ್ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನಕ್ಕೆ TKDL‌ನಲ್ಲಿ ದಾಖಲಾಗಿರುವ ಅತಿರೇಕವನ್ನು ಹೊಂದಿರಬಹುದು.",
    biopiracyAlertMessage: "ದಯವಿಟ್ಟು ಬಯೋಪೈರಸಿ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಿ ಮತ್ತು NBA ಅನುಮೋದನೆ ಪಡೆಯಿರಿ.",
    noveltyAlertMessage: "ಅಂಕಿತಕ್ಕೆ ಮೊದಲು ನವೀನತೆಯನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ, ತಿರಸ್ಕರಣ ತಪ್ಪಿಸಿಕೊಳ್ಳಿ.",

    // Risk Alerts
    tkdlAlertTitle: "⚠️ TKDL ಎಚ್ಚರಿಕೆ",
    biopiracyAlertTitle: "⚠️ ಬಯೋಪೈರಸಿ ಅಪಾಯ",
    noveltyAlertTitle: "ℹ️ ನವೀನತೆ ಆತಂಕ",
  },
};

// Get current language from localStorage or default to English
function getLanguage() {
  return localStorage.getItem("ayuthLanguage") || "en";
}

// Set language
function setLanguage(lang) {
  localStorage.setItem("ayuthLanguage", lang);
  updateUILanguage(lang);
}

// Translate a key
function t(key) {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations.en[key] || key;
}

// Update entire UI language
function updateUILanguage(lang) {
  document.documentElement.lang = lang;

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key);
    if (value !== undefined && value !== null) {
      el.textContent = value;
    }
  });

  const formFields = {
    chatInput: "chatPlaceholder",
    inventionText: "inventionTextPlaceholder",
    kbSearch: "kbSearch",
    q1: "q1Placeholder",
    q2: "q2Placeholder",
    q3: "q3Placeholder",
  };

  Object.entries(formFields).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = t(key);
  });

  const selects = {
    q4: {
      0: "q4Placeholder",
      1: "q4No",
      2: "q4YesLimited",
      3: "q4YesPublic",
    },
    q5: {
      0: "q5Placeholder",
      1: "q5No",
      2: "q5Biological",
      3: "q5TK",
      4: "q5Both",
    },
  };

  Object.entries(selects).forEach(([selectId, options]) => {
    const select = document.getElementById(selectId);
    if (select) {
      Object.entries(options).forEach(([index, key]) => {
        const option = select.options[index];
        if (option) option.textContent = t(key);
      });
    }
  });

  const langSelect = document.getElementById("languageSelect");
  if (langSelect) langSelect.value = lang;

  const settingsBtn = document.getElementById("settingsBtn");
  const infoBtn = document.getElementById("infoBtn");
  if (settingsBtn) settingsBtn.title = t("settingsTitle");
  if (infoBtn) infoBtn.title = t("infoTitle");

  if (typeof updateSessionInfo === "function") {
    updateSessionInfo();
  }

  if (typeof updateJurisdictionIndicator === "function") {
    updateJurisdictionIndicator();
  }
}

// Initialize language on page load
document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) {
    langSelect.value = getLanguage();
    langSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }
  updateUILanguage(getLanguage());
});
